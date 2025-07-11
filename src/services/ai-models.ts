export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'huggingface' | 'xai';
  description: string;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision?: boolean;
  supportsFunction?: boolean;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const AVAILABLE_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Affordable and intelligent small model for fast, lightweight tasks',
    maxTokens: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: true,
    costPer1kTokens: { input: 0.00015, output: 0.0006 }
  },
  {
    id: 'gpt-4-turbo-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Latest mini model with enhanced capabilities and speed',
    maxTokens: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: true,
    costPer1kTokens: { input: 0.0002, output: 0.0008 }
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Most capable OpenAI model, best for complex tasks',
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: true,
    costPer1kTokens: { input: 0.03, output: 0.06 }
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Latest GPT-4 model with improved performance',
    maxTokens: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: true,
    costPer1kTokens: { input: 0.01, output: 0.03 }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Omni-modal GPT-4 with vision and voice capabilities',
    maxTokens: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: true,
    costPer1kTokens: { input: 0.005, output: 0.015 }
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient for most tasks',
    maxTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: true,
    costPer1kTokens: { input: 0.0015, output: 0.002 }
  },
  
  // Anthropic Models
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'The balanced king - fast, smart, and efficient',
    maxTokens: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: false,
    costPer1kTokens: { input: 0.003, output: 0.015 }
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most capable Claude model for complex reasoning',
    maxTokens: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: false,
    costPer1kTokens: { input: 0.015, output: 0.075 }
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and lightweight Claude model',
    maxTokens: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: false,
    costPer1kTokens: { input: 0.00025, output: 0.00125 }
  },
  {
    id: 'claude-4',
    name: 'Claude 4',
    provider: 'anthropic',
    description: 'Next generation Claude model (coming soon)',
    maxTokens: 300000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: true,
    costPer1kTokens: { input: 0.02, output: 0.1 }
  },

  // xAI Models (Grok)
  {
    id: 'grok-1',
    name: 'Grok-1',
    provider: 'xai',
    description: 'The one with attitude - Elon\'s unhinged AI',
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0.01, output: 0.03 }
  },
  {
    id: 'grok-2',
    name: 'Grok-2',
    provider: 'xai',
    description: 'Even more unhinged and capable',
    maxTokens: 32768,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunction: true,
    costPer1kTokens: { input: 0.02, output: 0.06 }
  },
  
  // Ollama Models (local)
  {
    id: 'llama3',
    name: 'Llama 3',
    provider: 'ollama',
    description: 'Meta\'s latest open-source model',
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  },
  {
    id: 'llama3:70b',
    name: 'Llama 3 70B',
    provider: 'ollama',
    description: 'Larger version of Llama 3 with better performance',
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  },
  {
    id: 'codellama',
    name: 'Code Llama',
    provider: 'ollama',
    description: 'Code-specialized version of Llama',
    maxTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'ollama',
    description: 'European excellence in open-source AI',
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  },
  {
    id: 'mixtral',
    name: 'Mixtral 8x7B',
    provider: 'ollama',
    description: 'Mixture of experts model with great performance',
    maxTokens: 32768,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  },

  // HuggingFace Models
  {
    id: 'microsoft/DialoGPT-large',
    name: 'DialoGPT Large',
    provider: 'huggingface',
    description: 'Conversational AI model from Microsoft',
    maxTokens: 1024,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  },
  {
    id: 'meta-llama/Llama-2-7b-chat-hf',
    name: 'Llama 2 Chat (HF)',
    provider: 'huggingface',
    description: 'Llama 2 hosted on HuggingFace',
    maxTokens: 4096,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.1',
    name: 'Mistral 7B Instruct (HF)',
    provider: 'huggingface',
    description: 'Mistral instruction model on HuggingFace',
    maxTokens: 8192,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunction: false,
    costPer1kTokens: { input: 0, output: 0 }
  }
];