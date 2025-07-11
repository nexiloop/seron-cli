import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import { AIService } from '../services/ai-service.js';
import { ConfigService } from '../services/config.js';
import { ChatMessage } from '../services/ai-models.js';
import { getSeronSmall } from '../utils/banner.js';

interface ChatOptions {
  model?: string;
  system?: string;
}

export async function chatCommand(options: ChatOptions) {
  const config = new ConfigService();
  const aiService = new AIService();
  
  let currentModel = options.model || config.get('default_model');
  let systemPrompt = options.system || config.get('system_prompt');

  if (!currentModel) {
    console.log(chalk.red('❌ No model configured. Please run "seron setup" first.'));
    return;
  }

  // Check if model is available
  const isAvailable = await aiService.isModelAvailable(currentModel);
  if (!isAvailable) {
    console.log(chalk.red(`❌ Model ${currentModel} is not available. Please check your configuration.`));
    return;
  }

  console.log(getSeronSmall() + ' ' + chalk.cyan('Chat Session'));
  console.log(chalk.gray(`Using model: ${currentModel}`));
  console.log(chalk.gray('Commands: /exit, /clear, /help, /model <name>, /system <prompt>'));
  console.log(chalk.gray('Press Ctrl+C anytime to exit\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.blue('You: ')
  });

  const messages: ChatMessage[] = [];
  
  // Add system message if provided
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // Handle Ctrl+C gracefully
  rl.on('SIGINT', () => {
    console.log(chalk.cyan('\n\n👋 Thanks for chatting with Seron! See you next time.'));
    rl.close();
    process.exit(0);
  });

  // Handle line input
  rl.on('line', async (input) => {
    const userInput = input.trim();

    // Handle exit commands
    if (userInput === '/exit' || userInput === 'exit') {
      console.log(chalk.cyan('👋 Thanks for chatting with Seron! See you next time.'));
      rl.close();
      return;
    }

    // Handle clear command
    if (userInput === '/clear' || userInput === 'clear') {
      messages.length = 0;
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      console.log(chalk.yellow('✨ Chat history cleared!'));
      rl.prompt();
      return;
    }

    // Handle help command
    if (userInput === '/help' || userInput === 'help') {
      console.log(chalk.cyan('\n🔥 Available commands:'));
      console.log(chalk.gray('  /exit or exit       - Quit the chat'));
      console.log(chalk.gray('  /clear or clear     - Clear chat history'));
      console.log(chalk.gray('  /help or help       - Show this help'));
      console.log(chalk.gray('  /model <model-id>   - Switch AI model'));
      console.log(chalk.gray('  /system <prompt>    - Change system prompt'));
      console.log(chalk.gray('  Ctrl+C              - Quick exit\n'));
      rl.prompt();
      return;
    }

    // Handle model switching
    if (userInput.startsWith('/model ')) {
      const newModel = userInput.slice(7).trim();
      if (!newModel) {
        console.log(chalk.red('❌ Please specify a model. Example: /model gpt-4'));
        rl.prompt();
        return;
      }
      
      const available = await aiService.isModelAvailable(newModel);
      if (available) {
        currentModel = newModel;
        config.set('default_model', newModel);
        console.log(chalk.green(`✅ Switched to model: ${newModel}`));
      } else {
        console.log(chalk.red(`❌ Model ${newModel} is not available. Run "seron models" to see what's available.`));
      }
      rl.prompt();
      return;
    }

    // Handle system prompt changes
    if (userInput.startsWith('/system ')) {
      const newSystemPrompt = userInput.slice(8).trim();
      if (!newSystemPrompt) {
        console.log(chalk.red('❌ Please specify a system prompt. Example: /system You are a helpful coding assistant'));
        rl.prompt();
        return;
      }
      
      systemPrompt = newSystemPrompt;
      config.set('system_prompt', newSystemPrompt);
      
      // Update current conversation
      const systemIndex = messages.findIndex(m => m.role === 'system');
      if (systemIndex >= 0) {
        messages[systemIndex].content = newSystemPrompt;
      } else {
        messages.unshift({ role: 'system', content: newSystemPrompt });
      }
      console.log(chalk.green('✅ System prompt updated!'));
      rl.prompt();
      return;
    }

    // Skip empty input
    if (!userInput) {
      rl.prompt();
      return;
    }

    // Add user message
    messages.push({ role: 'user', content: userInput });

    const spinner = ora('🤔 Thinking...').start();
    
    try {
      // Use streaming for better UX
      spinner.stop();
      process.stdout.write(chalk.green('Seron: '));
      let response = '';
      
      for await (const chunk of aiService.chatStream(messages, currentModel)) {
        process.stdout.write(chunk);
        response += chunk;
      }
      
      console.log('\n');
      
      // Add AI response to history
      messages.push({ role: 'assistant', content: response });
      
    } catch (error) {
      spinner.stop();
      console.log(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }

    // Always prompt for next input
    rl.prompt();
  });

  // Start the conversation
  rl.prompt();
}