export const anthropicConfig = {
  name: 'Anthropic',
  description: 'Constitutional AI models from Anthropic',
  baseUrl: 'https://api.anthropic.com/v1',
  requiresApiKey: true,
  supportsStreaming: true,
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000
  },
  models: [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      description: 'Most capable Claude model for complex reasoning',
      maxTokens: 200000,
      costPer1kTokens: {
        input: 0.015,
        output: 0.075
      },
      supportsVision: true,
      supportsFunction: false
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      description: 'Balanced performance and speed',
      maxTokens: 200000,
      costPer1kTokens: {
        input: 0.003,
        output: 0.015
      },
      supportsVision: true,
      supportsFunction: false
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      description: 'Fast and lightweight Claude model',
      maxTokens: 200000,
      costPer1kTokens: {
        input: 0.00025,
        output: 0.00125
      },
      supportsVision: true,
      supportsFunction: false
    }
  ]
};