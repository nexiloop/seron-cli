export { AIService } from './services/ai-service';
export { ConfigService } from './services/config';
export { AIModel, ChatMessage, ChatResponse, AVAILABLE_MODELS } from './services/ai-models';

// Re-export commands for programmatic use
export { setupCommand } from './commands/setup';
export { chatCommand } from './commands/chat';
export { modelsCommand } from './commands/models';
export { configCommand } from './commands/config';