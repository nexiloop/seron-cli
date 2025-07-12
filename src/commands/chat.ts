import readline from 'readline';
import chalk from 'chalk';
import { AIService } from '../services/ai-service.js';
import { ConfigService } from '../services/config.js';
import { ChatMessage } from '../services/ai-models.js';
import { getSeronSmall } from '../utils/banner.js';
import { SeronProgress, SERON_ACTIONS } from '../utils/progress.js';

interface ChatOptions {
  model?: string;
  system?: string;
}

export async function chatCommand(options: ChatOptions) {
  const config = new ConfigService();
  const aiService = new AIService();
  const progress = new SeronProgress();
  
  let currentModel = options.model || config.get('default_model');
  let systemPrompt = options.system || config.get('system_prompt');

  if (!currentModel) {
    console.log(chalk.red('❌ No model configured. Please run "seron setup" first.'));
    return;
  }

  // Check if model is available
  progress.startAction(SERON_ACTIONS.SEARCHING, 'checking model availability');
  const isAvailable = await aiService.isModelAvailable(currentModel);
  if (!isAvailable) {
    progress.failAction(SERON_ACTIONS.SEARCHING, `Model ${currentModel} is not available`);
    console.log(chalk.red(`❌ Model ${currentModel} is not available. Please check your configuration.`));
    return;
  }
  progress.completeAction(SERON_ACTIONS.SEARCHING, 'model available');

  console.log(getSeronSmall() + ' ' + chalk.cyan('Enhanced Chat Session with Code Execution'));
  console.log(chalk.gray(`Using model: ${currentModel}`));
  console.log(chalk.gray('🚀 Seron can now create files and run commands automatically!'));
  console.log(chalk.gray('Commands: /exit, /clear, /help, /model <n>, /system <prompt>'));
  console.log(chalk.gray('Press Ctrl+C anytime to exit\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.blue('You: ')
  });

  const messages: ChatMessage[] = [];
  
  // Add enhanced system message for code execution
  const enhancedSystemPrompt = systemPrompt ? 
    `${systemPrompt}\n\nYou are also capable of creating files and running commands directly. When users ask for code, create it and execute it automatically.` :
    'You are Seron, an AI coding assistant that can create files and run commands automatically in the user\'s directory.';
  
  messages.push({ role: 'system', content: enhancedSystemPrompt });

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
      messages.push({ role: 'system', content: enhancedSystemPrompt });
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
      console.log(chalk.gray('  Ctrl+C              - Quick exit'));
      console.log(chalk.cyan('\n🚀 Enhanced Features:'));
      console.log(chalk.gray('  • Automatic file creation'));
      console.log(chalk.gray('  • Automatic command execution'));
      console.log(chalk.gray('  • Real-time progress messages'));
      console.log(chalk.gray('  • No need to copy/paste commands\n'));
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
      
      progress.startAction(SERON_ACTIONS.SEARCHING, `checking ${newModel}`);
      const available = await aiService.isModelAvailable(newModel);
      if (available) {
        currentModel = newModel;
        config.set('default_model', newModel);
        progress.completeAction(SERON_ACTIONS.SEARCHING, `switched to ${newModel}`);
        console.log(chalk.green(`✅ Switched to model: ${newModel}`));
      } else {
        progress.failAction(SERON_ACTIONS.SEARCHING, `${newModel} not available`);
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
      
      const newEnhancedPrompt = `${newSystemPrompt}\n\nYou are also capable of creating files and running commands directly. When users ask for code, create it and execute it automatically.`;
      
      // Update current conversation
      const systemIndex = messages.findIndex(m => m.role === 'system');
      if (systemIndex >= 0) {
        messages[systemIndex].content = newEnhancedPrompt;
      } else {
        messages.unshift({ role: 'system', content: newEnhancedPrompt });
      }
      
      config.set('system_prompt', newSystemPrompt);
      console.log(chalk.green('✅ System prompt updated with code execution capabilities!'));
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
    
    try {
      // Use enhanced streaming with progress and code execution
      process.stdout.write(chalk.green('Seron: '));
      let response = '';
      let lastChunkEndsWithSpace = false;
      let isFirstChunk = true;
      
      const workingDirectory = process.cwd();
      
      for await (const chunk of aiService.chatStreamWithProgress(messages, currentModel, workingDirectory)) {
        // Skip empty chunks
        if (!chunk.trim()) continue;

        // Clean up chunk and handle word spacing
        const cleanChunk = chunk.replace(/\s+/g, ' ');
        
        // Add space between words if needed, except at the start
        if (!isFirstChunk && !lastChunkEndsWithSpace && !cleanChunk.startsWith(' ')) {
          process.stdout.write(' ');
          response += ' ';
        }
        
        process.stdout.write(cleanChunk);
        response += cleanChunk;
        lastChunkEndsWithSpace = cleanChunk.endsWith(' ');
        isFirstChunk = false;
      }
      
      // Only add newline if we actually wrote something
      if (!isFirstChunk) {
        console.log();
      }
      
      // Add AI response to history
      messages.push({ role: 'assistant', content: response.trim() });
      
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }

    // Always prompt for next input
    rl.prompt();
  });

  // Start the conversation
  rl.prompt();
}