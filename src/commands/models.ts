import chalk from 'chalk';
import { AIService } from '../services/ai-service.js';
import { AVAILABLE_MODELS } from '../services/ai-models.js';
import { getSeronSmall } from '../utils/banner.js';

export async function modelsCommand() {
  console.log(getSeronSmall() + ' ' + chalk.cyan('Available AI Models'));
  console.log(chalk.gray('Checking model availability...\n'));

  const aiService = new AIService();

  for (const model of AVAILABLE_MODELS) {
    const isAvailable = await aiService.isModelAvailable(model.id);
    const status = isAvailable ? chalk.green('✅ Available') : chalk.red('❌ Not available');
    const provider = chalk.blue(`[${model.provider.toUpperCase()}]`);
    
    console.log(`${provider} ${chalk.bold(model.name)} - ${model.description}`);
    console.log(`  Model ID: ${model.id}`);
    console.log(`  Status: ${status}`);
    console.log(`  Max tokens: ${model.maxTokens.toLocaleString()}`);
    console.log(`  Streaming: ${model.supportsStreaming ? '✅' : '❌'}`);
    console.log('');
  }

  console.log(chalk.gray('💡 Use "seron config" to set API keys for unavailable models'));
  console.log(chalk.gray('💡 For Ollama models, make sure Ollama is running locally'));
}