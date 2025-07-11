export const huggingfaceConfig = {
  name: 'HuggingFace',
  description: 'Community-driven open source AI models',
  baseUrl: 'https://api-inference.huggingface.co/models',
  requiresApiKey: true,
  supportsStreaming: false,
  rateLimits: {
    requestsPerMinute: 1000,
    tokensPerMinute: 100000
  },
  models: [
    {
      id: 'microsoft/DialoGPT-large',
      name: 'DialoGPT Large',
      description: 'Conversational AI model from Microsoft',
      maxTokens: 1024,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: false,
      supportsFunction: false
    },
    {
      id: 'meta-llama/Llama-2-7b-chat-hf',
      name: 'Llama 2 Chat (HF)',
      description: 'Llama 2 hosted on HuggingFace',
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: false,
      supportsFunction: false
    },
    {
      id: 'mistralai/Mistral-7B-Instruct-v0.1',
      name: 'Mistral 7B Instruct (HF)',
      description: 'Mistral instruction model on HuggingFace',
      maxTokens: 8192,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: false,
      supportsFunction: false
    },
    {
      id: 'codellama/CodeLlama-7b-Instruct-hf',
      name: 'Code Llama Instruct (HF)',
      description: 'Code-specialized Llama on HuggingFace',
      maxTokens: 4096,
      costPer1kTokens: {
        input: 0,
        output: 0
      },
      supportsVision: false,
      supportsFunction: false
    }
  ]
};