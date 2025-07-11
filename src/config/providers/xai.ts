export const xaiConfig = {
  name: 'xAI',
  description: 'Elon\'s unhinged AI with attitude',
  baseUrl: 'https://api.x.ai/v1',
  requiresApiKey: true,
  supportsStreaming: true,
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000
  },
  models: [
    {
      id: 'grok-1',
      name: 'Grok-1',
      description: 'The one with attitude - unfiltered and direct',
      maxTokens: 8192,
      costPer1kTokens: {
        input: 0.01,
        output: 0.03
      },
      supportsVision: false,
      supportsFunction: false
    },
    {
      id: 'grok-2',
      name: 'Grok-2',
      description: 'Even more unhinged and capable with vision',
      maxTokens: 32768,
      costPer1kTokens: {
        input: 0.02,
        output: 0.06
      },
      supportsVision: true,
      supportsFunction: true
    }
  ]
};