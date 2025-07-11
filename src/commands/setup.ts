import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigService } from '../services/config.js';
import { AVAILABLE_MODELS } from '../services/ai-models.js';
import { getSeronTitle } from '../utils/banner.js';
import { gptPrompts } from '../config/prompts/gpt-prompts.js';
import { claudePrompts } from '../config/prompts/claude-prompts.js';
import { ollamaPrompts } from '../config/prompts/ollama-prompts.js';

export async function setupCommand() {
  console.log(getSeronTitle());
  console.log(chalk.gray('Let\'s configure your AI models and API keys.\n'));

  const config = new ConfigService();

  // Ask which models the user wants to configure
  const { selectedProviders } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedProviders',
      message: 'Which AI providers would you like to configure?',
      choices: [
        { name: '🤖 OpenAI (GPT-4, GPT-3.5, GPT-4o)', value: 'openai' },
        { name: '🧠 Anthropic (Claude 3.5, Opus, Haiku)', value: 'anthropic' },
        { name: '🚀 xAI (Grok-1, Grok-2)', value: 'xai' },
        { name: '🤗 HuggingFace (Open source models)', value: 'huggingface' },
        { name: '🏠 Ollama (Local models)', value: 'ollama' }
      ]
    }
  ]);

  // Configure OpenAI
  if (selectedProviders.includes('openai')) {
    console.log(chalk.yellow('\n🔑 OpenAI Configuration'));
    const { openaiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'openaiKey',
        message: 'Enter your OpenAI API key:',
        mask: '*'
      }
    ]);
    config.set('openai_api_key', openaiKey);
    console.log(chalk.green('✅ OpenAI API key saved!'));
  }

  // Configure Anthropic
  if (selectedProviders.includes('anthropic')) {
    console.log(chalk.yellow('\n🔑 Anthropic Configuration'));
    const { anthropicKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'anthropicKey',
        message: 'Enter your Anthropic API key:',
        mask: '*'
      }
    ]);
    config.set('anthropic_api_key', anthropicKey);
    console.log(chalk.green('✅ Anthropic API key saved!'));
  }

  // Configure xAI (Grok)
  if (selectedProviders.includes('xai')) {
    console.log(chalk.yellow('\n🔑 xAI (Grok) Configuration'));
    const { xaiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'xaiKey',
        message: 'Enter your xAI API key:',
        mask: '*'
      }
    ]);
    config.set('xai_api_key', xaiKey);
    console.log(chalk.green('✅ xAI API key saved!'));
  }

  // Configure HuggingFace
  if (selectedProviders.includes('huggingface')) {
    console.log(chalk.yellow('\n🔑 HuggingFace Configuration'));
    const { huggingfaceKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'huggingfaceKey',
        message: 'Enter your HuggingFace API token (free):',
        mask: '*'
      }
    ]);
    config.set('huggingface_api_key', huggingfaceKey);
    console.log(chalk.green('✅ HuggingFace API token saved!'));
  }

  // Configure Ollama
  if (selectedProviders.includes('ollama')) {
    console.log(chalk.yellow('\n🐋 Ollama Configuration'));
    console.log(chalk.gray('Make sure Ollama is installed and running on localhost:11434'));
    console.log(chalk.gray('Visit https://ollama.ai to download and install Ollama'));
    
    const { ollamaSetup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ollamaSetup',
        message: 'Is Ollama installed and running?',
        default: false
      }
    ]);

    if (ollamaSetup) {
      console.log(chalk.green('✅ Ollama configured!'));
    } else {
      console.log(chalk.yellow('⚠️  Please install Ollama and run this setup again.'));
    }
  }

  // Set default model
  const availableModels = AVAILABLE_MODELS.filter(model => 
    selectedProviders.includes(model.provider)
  );

  if (availableModels.length > 0) {
    const { defaultModel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultModel',
        message: 'Choose your default AI model:',
        choices: availableModels.map(model => ({
          name: `${model.name} (${model.provider}) - ${model.description}`,
          value: model.id
        }))
      }
    ]);
    config.set('default_model', defaultModel);
    console.log(chalk.green(`✅ Default model set to ${defaultModel}`));
  }

  // Prompt style configuration
  const { promptStyle } = await inquirer.prompt([
    {
      type: 'list',
      name: 'promptStyle',
      message: 'Choose your preferred prompt style:',
      choices: [
        { name: 'Default - General purpose assistant', value: 'default' },
        { name: 'Universal Code - Can build ANYTHING (🔥 RECOMMENDED)', value: 'universal-code' },
        { name: 'Coding - Programming and development focus', value: 'coding' },
        { name: 'Creative - Writing and creative tasks', value: 'creative' },
        { name: 'Analytical - Data analysis and problem solving', value: 'analytical' },
        { name: 'Educational - Teaching and explanations', value: 'educational' },
        { name: 'Professional - Business and formal communication', value: 'professional' },
        { name: 'Custom - Set your own system prompt', value: 'custom' }
      ]
    }
  ]);

  if (promptStyle === 'custom') {
    const { customPrompt } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customPrompt',
        message: 'Enter your custom system prompt:',
        default: 'You are Seron, a helpful AI assistant created by NexiLoop.'
      }
    ]);
    config.set('system_prompt', customPrompt);
  } else {
    // Set appropriate prompt based on the default model's provider
    const defaultModel = config.get('default_model');
    const model = AVAILABLE_MODELS.find(m => m.id === defaultModel);
    
    let prompt = 'You are Seron, a helpful AI assistant created by NexiLoop.';
    
    if (model) {
      switch (model.provider) {
        case 'openai':
          prompt = (gptPrompts as any)[promptStyle] || gptPrompts.default;
          break;
        case 'anthropic':
          prompt = (claudePrompts as any)[promptStyle] || claudePrompts.default;
          break;
        case 'ollama':
          prompt = (ollamaPrompts as any)[promptStyle] || ollamaPrompts.default;
          break;
        case 'xai':
          prompt = (gptPrompts as any)[promptStyle] || gptPrompts.default; // Use GPT prompts for Grok
          break;
        case 'huggingface':
          prompt = (ollamaPrompts as any)[promptStyle] || ollamaPrompts.default; // Use Ollama prompts for HF
          break;
      }
    }
    
    config.set('system_prompt', prompt);
  }
  
  console.log(chalk.green('✅ Prompt style configured!'));

  if (promptStyle === 'universal-code') {
    console.log(chalk.cyan('\n🧙‍♂️ Universal Code Mode Activated!'));
    console.log(chalk.gray('You can now ask Seron to build literally anything:'));
    console.log(chalk.gray('• "Build me a React todo app with Firebase"'));
    console.log(chalk.gray('• "Create a Python web scraper"'));
    console.log(chalk.gray('• "Make a Discord bot in Node.js"'));
    console.log(chalk.gray('• Anything you can imagine!'));
  }

  console.log(chalk.cyan('\n🎉 Setup complete!'));
  console.log(chalk.gray('You can now start chatting with: seron chat'));
  console.log(chalk.gray('Or run: seron --help for more commands'));
}