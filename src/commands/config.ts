import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigService } from '../services/config.js';
import { AVAILABLE_MODELS } from '../services/ai-models.js';
import { getSeronSmall } from '../utils/banner.js';

interface ConfigOptions {
  key?: string;
  model?: string;
}

export async function configCommand(options: ConfigOptions) {
  const config = new ConfigService();

  if (options.key && options.model) {
    // Set API key for specific model
    const keyName = getKeyNameForModel(options.model);
    if (keyName) {
      config.set(keyName, options.key);
      console.log(chalk.green(`✅ API key set for ${options.model}`));
    } else {
      console.log(chalk.red(`❌ Unknown model: ${options.model}`));
    }
    return;
  }

  if (options.model) {
    // Set default model
    const model = AVAILABLE_MODELS.find(m => m.id === options.model);
    if (model) {
      config.set('default_model', options.model);
      console.log(chalk.green(`✅ Default model set to ${options.model}`));
    } else {
      console.log(chalk.red(`❌ Unknown model: ${options.model}`));
    }
    return;
  }

  // Interactive configuration
  console.log(getSeronSmall() + ' ' + chalk.cyan('Configuration'));
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to configure?',
      choices: [
        { name: 'API Keys', value: 'keys' },
        { name: 'Default Model', value: 'model' },
        { name: 'System Prompt', value: 'prompt' },
        { name: 'View Current Config', value: 'view' },
        { name: 'Reset Configuration', value: 'reset' }
      ]
    }
  ]);

  switch (action) {
    case 'keys':
      await configureApiKeys(config);
      break;
    case 'model':
      await configureDefaultModel(config);
      break;
    case 'prompt':
      await configureSystemPrompt(config);
      break;
    case 'view':
      viewCurrentConfig(config);
      break;
    case 'reset':
      await resetConfiguration(config);
      break;
  }
}

async function configureApiKeys(config: ConfigService) {
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Which provider API key do you want to set?',
      choices: [
        { name: 'OpenAI', value: 'openai' },
        { name: 'Anthropic (Claude)', value: 'anthropic' }
      ]
    }
  ]);

  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: `Enter your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key:`,
      mask: '*'
    }
  ]);

  const keyName = provider === 'openai' ? 'openai_api_key' : 'anthropic_api_key';
  config.set(keyName, apiKey);
  console.log(chalk.green(`✅ ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key saved!`));
}

async function configureDefaultModel(config: ConfigService) {
  const { model } = await inquirer.prompt([
    {
      type: 'list',
      name: 'model',
      message: 'Choose your default AI model:',
      choices: AVAILABLE_MODELS.map(m => ({
        name: `${m.name} (${m.provider}) - ${m.description}`,
        value: m.id
      }))
    }
  ]);

  config.set('default_model', model);
  console.log(chalk.green(`✅ Default model set to ${model}`));
}

async function configureSystemPrompt(config: ConfigService) {
  const currentPrompt = config.get('system_prompt') || 'You are Seron, a helpful AI assistant created by NexiLoop.';
  
  const { prompt } = await inquirer.prompt([
    {
      type: 'input',
      name: 'prompt',
      message: 'Enter your system prompt:',
      default: currentPrompt
    }
  ]);

  config.set('system_prompt', prompt);
  console.log(chalk.green('✅ System prompt updated!'));
}

function viewCurrentConfig(config: ConfigService) {
  const configData = config.getAll();
  
  console.log(chalk.cyan('\n📋 Current Configuration:'));
  console.log(chalk.gray('─'.repeat(40)));
  
  console.log(`Default Model: ${chalk.yellow(configData.default_model || 'Not set')}`);
  console.log(`System Prompt: ${chalk.yellow(configData.system_prompt || 'Default')}`);
  console.log(`OpenAI API Key: ${configData.openai_api_key ? chalk.green('Set') : chalk.red('Not set')}`);
  console.log(`Anthropic API Key: ${configData.anthropic_api_key ? chalk.green('Set') : chalk.red('Not set')}`);
  
  if (configData.user_session) {
    console.log(`Logged in as: ${chalk.green(configData.user_session.email)}`);
  } else {
    console.log(`Login Status: ${chalk.red('Not logged in')}`);
  }
}

async function resetConfiguration(config: ConfigService) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to reset all configuration? This cannot be undone.',
      default: false
    }
  ]);

  if (confirm) {
    config.clear();
    console.log(chalk.green('✅ Configuration reset successfully!'));
    console.log(chalk.gray('Run "seron setup" to configure the CLI again.'));
  } else {
    console.log(chalk.gray('Configuration reset cancelled.'));
  }
}

function getKeyNameForModel(modelId: string): string | null {
  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!model) return null;
  
  switch (model.provider) {
    case 'openai':
      return 'openai_api_key';
    case 'anthropic':
      return 'anthropic_api_key';
    default:
      return null;
  }
}