#!/usr/bin/env node

// Suppress punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return; // Ignore punycode deprecation warnings
  }
  console.warn(warning.name + ': ' + warning.message);
});

import { Command } from 'commander';
import inquirer from 'inquirer';
import { setupCommand } from './commands/setup.js';
import { chatCommand } from './commands/chat.js';
import { modelsCommand } from './commands/models.js';
import { configCommand } from './commands/config.js';
import { getSeronBanner, getSeronTitle } from './utils/banner.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('seron')
  .description('Seron CLI - Chat with multiple AI models with automatic code execution')
  .version('1.0.1');

// Interactive main menu function
async function showMainMenu() {
  console.log(getSeronBanner());
  console.log('\n' + getSeronTitle());
  console.log(chalk.gray('A powerful CLI with multiple model support\n'));

  const choices = [
    {
      name: '🚀 Setup - Configure your AI models and API keys',
      value: 'setup',
      short: 'Setup'
    },
    {
      name: '💬 Chat - Start chatting with AI',
      value: 'chat',
      short: 'Chat'
    },
    {
      name: '📋 Models - List available AI models',
      value: 'models',
      short: 'Models'
    },
    {
      name: '⚙️ Config - Configure API keys and settings',
      value: 'config',
      short: 'Config'
    },
    {
      name: '❓ Help - Show all available commands',
      value: 'help',
      short: 'Help'
    },
    {
      name: '👋 Exit',
      value: 'exit',
      short: 'Exit'
    }
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices,
      pageSize: 10
    }
  ]);

  switch (action) {
    case 'setup':
      await setupCommand();
      break;
    case 'chat':
      await chatCommand({});
      break;
    case 'models':
      await modelsCommand();
      break;
    case 'config':
      await configCommand({});
      break;
    case 'help':
      program.help();
      break;
    case 'exit':
      console.log(chalk.cyan('👋 Thanks for using Seron! See you next time.'));
      process.exit(0);
      break;
  }
}

program
  .command('setup')
  .description('Setup Seron with your preferred models and API keys')
  .action(setupCommand);

program
  .command('chat')
  .alias('c')
  .description('Start a chat session with AI')
  .option('-m, --model <model>', 'Specify AI model to use')
  .option('-s, --system <prompt>', 'Set system prompt')
  .action(chatCommand);

program
  .command('models')
  .description('List available AI models and their status')
  .action(modelsCommand);

program
  .command('config')
  .description('Configure API keys and settings')
  .option('-k, --key <key>', 'Set API key for current model')
  .option('-m, --model <model>', 'Set default model')
  .action(configCommand);

// Default action - show interactive menu
program
  .action(async () => {
    await showMainMenu();
  });

program.parse();