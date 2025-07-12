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

When creating files or modifying code:
1. ALWAYS use proper file creation syntax
2. ALWAYS include a language identifier in code blocks
3. ALWAYS include proper content based on file type
4. NEVER leave code blocks empty
5. Double-check all paths and content

Format file creation EXACTLY like this (notice the language after first \`\`\`):
**SERON_CREATE_FILE: filename.ext**
\`\`\`language
content here
\`\`\`

Examples of proper file creation:
For Python:
**SERON_CREATE_FILE: script.py**
\`\`\`python
#!/usr/bin/env python3
def main():
    print("Hello World")
\`\`\`

For JavaScript:
**SERON_CREATE_FILE: app.js**
\`\`\`javascript
'use strict';
console.log('Hello World');
\`\`\`

For HTML:
**SERON_CREATE_FILE: index.html**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
</body>
</html>
\`\`\`

Current working directory: ${workingDirectory || process.cwd()}

Remember to:
1. Check if directories exist before creating files
2. Create all necessary parent directories
3. Use proper file extensions and templates
4. Add proper headers and metadata`;

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
      
      // Parse and execute the response with thorough checking
      await this.parseAndExecuteCode(response.content, workingDirectory);
      
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
    
    // More aggressive pattern to remove markers and their code blocks
    filtered = filtered.replace(/\*\*SERON_CREATE_FILE:[^\*]*\*\*\s*```[^`]*```/gs, '');
    filtered = filtered.replace(/\*\*SERON_EDIT_FILE:[^\*]*\*\*\s*```[^`]*```/gs, '');
    filtered = filtered.replace(/\*\*SERON_RUN_COMMAND:[^\*]*\*\*/gs, '');
    
    // Remove any leftover markers
    filtered = filtered.replace(/\*\*SERON_CREATE_FILE:[^\*]*\*\*/g, '');
    filtered = filtered.replace(/\*\*SERON_EDIT_FILE:[^\*]*\*\*/g, '');
    filtered = filtered.replace(/\*\*\s*$/g, '');
    
    return filtered;
  }

  private async executeCodeFromResponse(response: string, workingDirectory?: string): Promise<void> {
    const cwd = workingDirectory || process.cwd();
    await this.parseAndExecuteCode(response, cwd);
  }

  private async parseAndExecuteCode(response: string, workingDirectory?: string): Promise<void> {
    const cwd = workingDirectory || process.cwd();
    
    // Initial analysis phase
    this.progress.startAction(SERON_ACTIONS.ANALYZING, 'checking workspace and files');
    
    // Verify working directory exists
    try {
      await this.fileSystem.createDirectory(cwd);
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.ANALYZING, `Invalid working directory ${cwd}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }
    
    // Parse and validate file creation markers
    const fileCreatePattern = /\*\*SERON_CREATE_FILE:\s*([^\*]+)\*\*\s*```(\w+)?\s*([\s\S]*?)```/g;
    let match;
    const filesToProcess = [];
    
    // First pass: collect and validate all file operations
    while ((match = fileCreatePattern.exec(response)) !== null) {
      const filename = match[1].trim();
      const language = match[2] || '';
      const content = match[3].trim();
      const filePath = path.join(cwd, filename);
      
      // Validation checks
      if (!filename) {
        this.progress.failAction(SERON_ACTIONS.ANALYZING, 'Empty filename detected');
        continue;
      }
      
      if (!content) {
        this.progress.failAction(SERON_ACTIONS.ANALYZING, `Empty content for ${filename}`);
        continue;
      }

      filesToProcess.push({
        filename,
        language,
        content,
        filePath,
        exists: await this.fileSystem.fileExists(filePath)
      });
    }

    // Report plan
    if (filesToProcess.length > 0) {
      this.progress.completeAction(SERON_ACTIONS.ANALYZING, 
        `Found ${filesToProcess.length} files to process in ${cwd}:\n` +
        filesToProcess.map(f => `  - Will ${f.exists ? 'update' : 'create'} ${f.filename} (${f.language || 'auto-detect'})`).join('\n')
      );
    } else {
      this.progress.failAction(SERON_ACTIONS.ANALYZING, 'No valid file operations found in response');
      return;
    }

    // Process each file
    for (const file of filesToProcess) {
      try {
        // Create parent directory if needed
        const dir = path.dirname(file.filePath);
        this.progress.startAction(SERON_ACTIONS.ANALYZING, `checking directory ${dir}`);
        await this.fileSystem.createDirectory(dir);
        this.progress.completeAction(SERON_ACTIONS.ANALYZING, `directory ${dir} ready`);

        if (file.exists) {
          // Edit existing file
          this.progress.startAction(SERON_ACTIONS.EDITING_FILE, `${file.filename} in ${cwd}`);
          await this.fileSystem.editFile(file.filePath, file.content, file.language);
          this.progress.completeAction(SERON_ACTIONS.EDITING_FILE, `${file.filename} updated in ${cwd}`);
        } else {
          // Create new file
          this.progress.startAction(SERON_ACTIONS.CREATING_FILE, `${file.filename} in ${cwd}`);
          await this.fileSystem.createFile(file.filePath, file.content, file.language);
          this.progress.completeAction(SERON_ACTIONS.CREATING_FILE, `${file.filename} created in ${cwd}`);
        }

        // Verify file exists and is readable
        this.progress.startAction(SERON_ACTIONS.ANALYZING, `verifying ${file.filename}`);
        const exists = await this.fileSystem.fileExists(file.filePath);
        if (!exists) {
          throw new Error(`File verification failed: ${file.filename} was not created`);
        }
        const content = await this.fileSystem.readFile(file.filePath);
        if (!content) {
          throw new Error(`File verification failed: ${file.filename} is empty`);
        }
        this.progress.completeAction(SERON_ACTIONS.ANALYZING, `${file.filename} verified successfully`);
      } catch (error) {
        this.progress.failAction(SERON_ACTIONS.CREATING_FILE, 
          `Failed to process ${file.filename} in ${cwd}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Handle commands after file creation
    const runCommandPattern = /\*\*SERON_RUN_COMMAND:\s*([^\*]+)\*\*/g;
    const commandsToRun = [];
    
    // Collect all commands
    while ((match = runCommandPattern.exec(response)) !== null) {
      commandsToRun.push(match[1].trim());
    }

    // Report command plan
    if (commandsToRun.length > 0) {
      this.progress.startAction(SERON_ACTIONS.ANALYZING, 'planning commands');
      this.progress.completeAction(SERON_ACTIONS.ANALYZING, 
        `Will run ${commandsToRun.length} commands in ${cwd}:\n` +
        commandsToRun.map(cmd => `  - ${cmd}`).join('\n')
      );
    }
    
    // Execute commands
    for (const command of commandsToRun) {
      try {
        this.progress.startAction(SERON_ACTIONS.RUNNING_COMMAND, `${command} in ${cwd}`);
        await this.fileSystem.runCommand(command, cwd);
        this.progress.completeAction(SERON_ACTIONS.RUNNING_COMMAND, `${command} completed successfully in ${cwd}`);
      } catch (error) {
        this.progress.failAction(SERON_ACTIONS.RUNNING_COMMAND, 
          `Failed to run ${command} in ${cwd}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
    
    // Final verification
    this.progress.startAction(SERON_ACTIONS.ANALYZING, 'final verification');
    try {
      for (const file of filesToProcess) {
        const exists = await this.fileSystem.fileExists(file.filePath);
        if (!exists) {
          throw new Error(`Final verification failed: ${file.filename} is missing`);
        }
      }
      this.progress.completeAction(SERON_ACTIONS.ANALYZING, 
        `All operations completed successfully:\n` +
        filesToProcess.map(f => `  ✓ ${f.filename}`).join('\n')
      );
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.ANALYZING, 
        `Final verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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