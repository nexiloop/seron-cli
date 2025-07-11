import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Ollama } from 'ollama';
import { HfInference } from '@huggingface/inference';
import axios from 'axios';
import * as path from 'path';
import { AIModel, ChatMessage, ChatResponse, AVAILABLE_MODELS } from './ai-models.js';
import { ConfigService } from './config.js';
import { FileSystemService } from './filesystem.js';
import { SeronProgress, SERON_ACTIONS } from '../utils/progress.js';

export class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private ollama: Ollama | null = null;
  private huggingface: HfInference | null = null;
  private config: ConfigService;
  private fileSystem: FileSystemService;
  private progress: SeronProgress;

  constructor() {
    this.config = new ConfigService();
    this.fileSystem = new FileSystemService();
    this.progress = new SeronProgress();
    this.initializeClients();
  }

  private initializeClients() {
    const openaiKey = this.config.get('openai_api_key');
    const anthropicKey = this.config.get('anthropic_api_key');
    const huggingfaceKey = this.config.get('huggingface_api_key');

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    if (huggingfaceKey) {
      this.huggingface = new HfInference(huggingfaceKey);
    }

    // Initialize Ollama (local, no API key needed)
    this.ollama = new Ollama({ host: 'http://localhost:11434' });
  }

  async chat(messages: ChatMessage[], modelId: string): Promise<ChatResponse> {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    switch (model.provider) {
      case 'openai':
        return this.chatWithOpenAI(messages, model);
      case 'anthropic':
        return this.chatWithAnthropic(messages, model);
      case 'ollama':
        return this.chatWithOllama(messages, model);
      case 'huggingface':
        return this.chatWithHuggingFace(messages, model);
      case 'xai':
        return this.chatWithXAI(messages, model);
      default:
        throw new Error(`Provider ${model.provider} not supported`);
    }
  }

  // Enhanced chat with automatic code execution
  async chatWithCodeExecution(messages: ChatMessage[], modelId: string, workingDirectory?: string): Promise<ChatResponse> {
    this.progress.startAction(SERON_ACTIONS.THINKING);
    
    // Add system prompt for code generation with execution
    const enhancedMessages = [...messages];
    const codeSystemPrompt = `You are Seron, an AI coding assistant that can create and execute code directly in the user's directory. 

When the user asks you to create files, build apps, or write code:
1. Create the files directly in their current directory
2. Execute any necessary commands (npm install, build, etc.)
3. Don't show code blocks or ask the user to run commands - just do it automatically
4. Use modern best practices and popular frameworks
5. Always create working, complete applications

Format file creation like this:
**SERON_CREATE_FILE: filename.ext**
\`\`\`language
file content here
\`\`\`

Format commands like this:
**SERON_RUN_COMMAND: npm install react**

Current working directory: ${workingDirectory || process.cwd()}

Always respond with what you did and what files you created, not code blocks.`;

    // Check if there's already a system message
    const systemIndex = enhancedMessages.findIndex(m => m.role === 'system');
    if (systemIndex >= 0) {
      enhancedMessages[systemIndex].content = `${enhancedMessages[systemIndex].content}\n\n${codeSystemPrompt}`;
    } else {
      enhancedMessages.unshift({ role: 'system', content: codeSystemPrompt });
    }

    this.progress.updateAction(SERON_ACTIONS.GENERATING);
    
    try {
      const response = await this.chat(enhancedMessages, modelId);
      this.progress.completeAction(SERON_ACTIONS.GENERATING);
      
      // Parse the response for code execution
      await this.executeCodeFromResponse(response.content, workingDirectory);
      
      return response;
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.GENERATING, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Enhanced streaming with progress and automatic code execution
  async *chatStreamWithProgress(messages: ChatMessage[], modelId: string, workingDirectory?: string): AsyncGenerator<string, void, unknown> {
    this.progress.startAction(SERON_ACTIONS.THINKING);
    
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!model) {
      this.progress.failAction(SERON_ACTIONS.THINKING, `Model ${modelId} not found`);
      throw new Error(`Model ${modelId} not found`);
    }

    // Add enhanced system prompt
    const enhancedMessages = [...messages];
    const codeSystemPrompt = `You are Seron, an AI coding assistant. When creating files or writing code:

IMPORTANT: Use these special markers ONLY for actions, they will not be shown to the user:
- **SERON_CREATE_FILE: filename.ext** (for new files)
- **SERON_EDIT_FILE: filename.ext** (for existing files)
- **SERON_RUN_COMMAND: command** (for terminal commands)

Always describe what you're doing in normal text, then use the markers.

Current directory: ${workingDirectory || process.cwd()}

Check if files exist before creating them. If a file exists, edit it instead.`;

    const systemIndex = enhancedMessages.findIndex(m => m.role === 'system');
    if (systemIndex >= 0) {
      enhancedMessages[systemIndex].content = `${enhancedMessages[systemIndex].content}\n\n${codeSystemPrompt}`;
    } else {
      enhancedMessages.unshift({ role: 'system', content: codeSystemPrompt });
    }

    this.progress.updateAction(SERON_ACTIONS.GENERATING);
    
    let fullResponse = '';
    let filteredResponse = '';
    
    try {
      for await (const chunk of this.chatStream(enhancedMessages, modelId)) {
        fullResponse += chunk;
        
        // Filter out the special formatting syntax from what we show to the user
        const filteredChunk = this.filterSpecialSyntax(chunk);
        if (filteredChunk) {
          filteredResponse += filteredChunk;
          yield filteredChunk;
        }
      }
      
      this.progress.completeAction(SERON_ACTIONS.GENERATING);
      
      // Execute code after streaming is complete, but use the full response for parsing
      await this.parseAndExecuteCode(fullResponse, workingDirectory);
      
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.GENERATING, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Filter out special syntax from user-visible content
  private filterSpecialSyntax(content: string): string {
    // Remove the special formatting markers and code blocks that follow them
    let filtered = content;
    
    // Remove SERON_CREATE_FILE markers and their code blocks
    filtered = filtered.replace(/\*\*SERON_CREATE_FILE:[^\*]*\*\*\s*```[^`]*```/g, '');
    
    // Remove SERON_EDIT_FILE markers and their code blocks  
    filtered = filtered.replace(/\*\*SERON_EDIT_FILE:[^\*]*\*\*\s*```[^`]*```/g, '');
    
    // Remove SERON_RUN_COMMAND markers
    filtered = filtered.replace(/\*\*SERON_RUN_COMMAND:[^\*]*\*\*/g, '');
    
    // Remove just the markers if they appear without code blocks
    filtered = filtered.replace(/\*\*SERON_CREATE_FILE:[^\*]*\*\*/g, '');
    filtered = filtered.replace(/\*\*SERON_EDIT_FILE:[^\*]*\*\*/g, '');
    
    return filtered;
  }

  private async executeCodeFromResponse(response: string, workingDirectory?: string): Promise<void> {
    const cwd = workingDirectory || process.cwd();
    await this.parseAndExecuteCode(response, cwd);
  }

  private async parseAndExecuteCode(response: string, workingDirectory?: string): Promise<void> {
    const cwd = workingDirectory || process.cwd();
    
    // Look for file creation patterns: **SERON_CREATE_FILE: filename**
    const fileCreatePattern = /\*\*SERON_CREATE_FILE:\s*([^\*]+)\*\*\s*```(\w+)?\s*([\s\S]*?)```/g;
    let match;
    
    while ((match = fileCreatePattern.exec(response)) !== null) {
      const filename = match[1].trim();
      const content = match[3].trim();
      const filePath = path.join(cwd, filename);
      
      try {
        // Check if file already exists
        const fileExists = await this.fileSystem.fileExists(filePath);
        if (fileExists) {
          // Edit the existing file instead
          await this.fileSystem.editFile(filePath, content);
        } else {
          // Create new file
          await this.fileSystem.createFile(filePath, content);
        }
      } catch (error) {
        console.error(`Failed to create/edit ${filename}:`, error);
      }
    }
    
    // Look for file editing patterns: **SERON_EDIT_FILE: filename**
    const fileEditPattern = /\*\*SERON_EDIT_FILE:\s*([^\*]+)\*\*\s*```(\w+)?\s*([\s\S]*?)```/g;
    while ((match = fileEditPattern.exec(response)) !== null) {
      const filename = match[1].trim();
      const content = match[3].trim();
      const filePath = path.join(cwd, filename);
      
      try {
        await this.fileSystem.editFile(filePath, content);
      } catch (error) {
        console.error(`Failed to edit ${filename}:`, error);
      }
    }
    
    // Look for command execution patterns: **SERON_RUN_COMMAND: command**
    const commandPattern = /\*\*SERON_RUN_COMMAND:\s*([^\*]+)\*\*/g;
    while ((match = commandPattern.exec(response)) !== null) {
      const command = match[1].trim();
      try {
        await this.fileSystem.runCommand(command, cwd);
      } catch (error) {
        console.error(`Failed to run command ${command}:`, error);
      }
    }
    
    // Also look for npm install commands in text
    const npmInstallPattern = /npm install\s+([^\s\n]+)/g;
    while ((match = npmInstallPattern.exec(response)) !== null) {
      const packageName = match[1];
      try {
        await this.fileSystem.installPackage(packageName);
      } catch (error) {
        console.error(`Failed to install ${packageName}:`, error);
      }
    }
  }

  private async chatWithOpenAI(messages: ChatMessage[], model: AIModel): Promise<ChatResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please set your API key.');
    }

    const response = await this.openai.chat.completions.create({
      model: model.id,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: model.maxTokens
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: model.id,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined
    };
  }

  private async chatWithAnthropic(messages: ChatMessage[], model: AIModel): Promise<ChatResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized. Please set your API key.');
    }

    // Separate system message from other messages
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: model.id,
      max_tokens: model.maxTokens,
      system: systemMessage?.content,
      messages: chatMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      model: model.id,
      usage: response.usage ? {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      } : undefined
    };
  }

  private async chatWithOllama(messages: ChatMessage[], model: AIModel): Promise<ChatResponse> {
    if (!this.ollama) {
      throw new Error('Ollama client not initialized.');
    }

    try {
      const response = await this.ollama.chat({
        model: model.id,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: false
      });

      return {
        content: response.message.content,
        model: model.id
      };
    } catch (error) {
      throw new Error(`Ollama error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async chatWithHuggingFace(messages: ChatMessage[], model: AIModel): Promise<ChatResponse> {
    if (!this.huggingface) {
      throw new Error('HuggingFace client not initialized. Please set your API key.');
    }

    try {
      // Convert messages to a single prompt for HuggingFace
      const prompt = messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
        .join('\n') + '\nAssistant:';

      const response = await this.huggingface.textGeneration({
        model: model.id,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1
        }
      });

      return {
        content: response.generated_text.replace(prompt, '').trim(),
        model: model.id
      };
    } catch (error) {
      throw new Error(`HuggingFace error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async chatWithXAI(messages: ChatMessage[], model: AIModel): Promise<ChatResponse> {
    const xaiKey = this.config.get('xai_api_key');
    if (!xaiKey) {
      throw new Error('xAI API key not set. Please configure your xAI API key.');
    }

    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: model.id,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: model.maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${xaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.choices[0]?.message?.content || '',
        model: model.id,
        usage: response.data.usage ? {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      throw new Error(`xAI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *chatStream(messages: ChatMessage[], modelId: string): AsyncGenerator<string, void, unknown> {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    if (!model.supportsStreaming) {
      const response = await this.chat(messages, modelId);
      yield response.content;
      return;
    }

    switch (model.provider) {
      case 'openai':
        yield* this.streamOpenAI(messages, model);
        break;
      case 'anthropic':
        yield* this.streamAnthropic(messages, model);
        break;
      case 'ollama':
        yield* this.streamOllama(messages, model);
        break;
      case 'xai':
        yield* this.streamXAI(messages, model);
        break;
      case 'huggingface':
        // HuggingFace doesn't support streaming, fallback to regular chat
        const response = await this.chat(messages, modelId);
        yield response.content;
        break;
    }
  }

  private async *streamOpenAI(messages: ChatMessage[], model: AIModel): AsyncGenerator<string, void, unknown> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const stream = await this.openai.chat.completions.create({
      model: model.id,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      temperature: 0.7
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  private async *streamAnthropic(messages: ChatMessage[], model: AIModel): AsyncGenerator<string, void, unknown> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const stream = await this.anthropic.messages.create({
      model: model.id,
      max_tokens: model.maxTokens,
      system: systemMessage?.content,
      messages: chatMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      stream: true
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  private async *streamOllama(messages: ChatMessage[], model: AIModel): AsyncGenerator<string, void, unknown> {
    if (!this.ollama) {
      throw new Error('Ollama client not initialized');
    }

    const response = await this.ollama.chat({
      model: model.id,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true
    });

    for await (const part of response) {
      if (part.message?.content) {
        yield part.message.content;
      }
    }
  }

  private async *streamXAI(messages: ChatMessage[], model: AIModel): AsyncGenerator<string, void, unknown> {
    const xaiKey = this.config.get('xai_api_key');
    if (!xaiKey) {
      throw new Error('xAI API key not set');
    }

    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: model.id,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${xaiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`xAI streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): AIModel[] {
    return AVAILABLE_MODELS;
  }

  async isModelAvailable(modelId: string): Promise<boolean> {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!model) return false;

    try {
      switch (model.provider) {
        case 'openai':
          return !!this.openai;
        case 'anthropic':
          return !!this.anthropic;
        case 'huggingface':
          return !!this.huggingface;
        case 'xai':
          return !!this.config.get('xai_api_key');
        case 'ollama':
          if (!this.ollama) return false;
          const models = await this.ollama.list();
          return models.models.some(m => m.name.includes(modelId));
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}