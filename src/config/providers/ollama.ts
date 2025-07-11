export const ollamaConfig = {
  name: 'Ollama',
  description: 'Local AI models running through Ollama',
  baseUrl: 'http://localhost:11434',
  requiresApiKey: false,
  supportsStreaming: true,
  rateLimits: {
    requestsPerMinute: 1000, // No limits for local
    tokensPerMinute: 1000000
  },
  models: [
    {
      id: 'llama2',
      name: 'Llama 2',
      description: 'Meta\'s open-source large language model',
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: false,
      supportsFunction: false,
      downloadSize: '3.8GB'
    },
    {
      id: 'codellama',
      name: 'Code Llama',
      description: 'Code-specialized version of Llama 2',
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: false,
      supportsFunction: false,
      downloadSize: '3.8GB'
    },
    {
      id: 'mistral',
      name: 'Mistral',
      description: 'High-performance open-source model',
      maxTokens: 8192,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: false,
      supportsFunction: false,
      downloadSize: '4.1GB'
    },
    {
      id: 'llava',
      name: 'LLaVA',
      description: 'Large Language and Vision Assistant',
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: true,
      supportsFunction: false,
      downloadSize: '4.5GB'
    }
  ]
};