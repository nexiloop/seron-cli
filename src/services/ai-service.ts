import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Ollama } from 'ollama';
import { HfInference } from '@huggingface/inference';
import axios from 'axios';
import { AIModel, ChatMessage, ChatResponse, AVAILABLE_MODELS } from './ai-models.js';
import { ConfigService } from './config.js';

export class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private ollama: Ollama | null = null;
  private huggingface: HfInference | null = null;
  private config: ConfigService;

  constructor() {
    this.config = new ConfigService();
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