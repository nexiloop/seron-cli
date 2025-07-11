export const openAIConfig = {
  name: 'OpenAI',
  description: 'Advanced AI models from OpenAI',
  baseUrl: 'https://api.openai.com/v1',
  requiresApiKey: true,
  supportsStreaming: true,
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000
  },
  models: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable OpenAI model, best for complex tasks',
      maxTokens: 8192,
      costPer1kTokens: {
        input: 0.03,
        output: 0.06
      },
      supportsVision: false,
      supportsFunction: true
    },
    {
      id: 'gpt-4-turbo-preview',
      name: 'GPT-4 Turbo',
      description: 'Latest GPT-4 model with improved performance',
      maxTokens: 128000,
      costPer1kTokens: {
        input: 0.01,
        output: 0.03
      },
      supportsVision: true,
      supportsFunction: true
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most tasks',
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0.0015,
        output: 0.002
      },
      supportsVision: false,
      supportsFunction: true
    }
  ]
};