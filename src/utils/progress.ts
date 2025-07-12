import chalk from 'chalk';
import gradient from 'gradient-string';

export const SERON_ACTIONS = {
  THINKING: 'thinking',
  GENERATING: 'generating',
  CREATING_FILE: 'creating-file',
  EDITING_FILE: 'editing-file',
  SEARCHING: 'searching',
  RUNNING_COMMAND: 'running-command',
  INSTALLING: 'installing',
  BUILDING: 'building',
  ANALYZING: 'analyzing'
} as const;

export type SeronAction = typeof SERON_ACTIONS[keyof typeof SERON_ACTIONS];

export class SeronProgress {
  private currentAction: SeronAction | null = null;
  private startTime: number = 0;
  private gradient = gradient(['#00ff00', '#00ffff', '#0000ff']);

  startAction(action: SeronAction, details?: string): void {
    this.currentAction = action;
    this.startTime = Date.now();
    
    const message = this.getActionMessage(action, 'start', details);
    const prefix = this.gradient('Seron');
    console.log(`${prefix} ${chalk.cyan(message)}`);
  }

  updateAction(action: SeronAction, details?: string): void {
    this.currentAction = action;
    
    const message = this.getActionMessage(action, 'update', details);
    const prefix = this.gradient('Seron');
    console.log(`${prefix} ${chalk.yellow(message)}`);
  }

  completeAction(action: SeronAction, details?: string): void {
    const duration = this.startTime > 0 ? Date.now() - this.startTime : 0;
    const durationText = duration > 0 ? ` ${chalk.gray(`(${duration}ms)`)}` : '';
    
    const message = this.getActionMessage(action, 'complete', details);
    const prefix = this.gradient('Seron');
    console.log(`${prefix} ${chalk.green(message)}${durationText}`);
    
    this.currentAction = null;
    this.startTime = 0;
  }

  failAction(action: SeronAction, error: string): void {
    const message = this.getActionMessage(action, 'fail', error);
    const prefix = this.gradient('Seron');
    console.log(`${prefix} ${chalk.red(message)}`);
    
    this.currentAction = null;
    this.startTime = 0;
  }

  private getActionMessage(action: SeronAction, phase: 'start' | 'update' | 'complete' | 'fail', details?: string): string {
    const detailsText = details ? ` ${details}` : '';
    
    switch (action) {
      case SERON_ACTIONS.THINKING:
        switch (phase) {
          case 'start': return `🤔 Analyzing request...${detailsText}`;
          case 'update': return `🧮 Processing...${detailsText}`;
          case 'complete': return `✨ Analysis complete${detailsText}`;
          case 'fail': return `❌ Analysis failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.ANALYZING:
        switch (phase) {
          case 'start': return `🔍 Checking ${detailsText}`;
          case 'update': return `🔄 Validating ${detailsText}`;
          case 'complete': return `✅ ${detailsText}`;
          case 'fail': return `❌ Check failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.GENERATING:
        switch (phase) {
          case 'start': return `🎯 Planning actions...${detailsText}`;
          case 'update': return `⚡ Generating solution...${detailsText}`;
          case 'complete': return `✨ Plan ready${detailsText}`;
          case 'fail': return `❌ Planning failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.CREATING_FILE:
        switch (phase) {
          case 'start': return `📝 Creating ${detailsText}`;
          case 'update': return `🔄 Writing ${detailsText}`;
          case 'complete': return `✅ Created ${detailsText}`;
          case 'fail': return `❌ Creation failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.EDITING_FILE:
        switch (phase) {
          case 'start': return `✏️ Modifying ${detailsText}`;
          case 'update': return `🔄 Updating ${detailsText}`;
          case 'complete': return `✅ Updated ${detailsText}`;
          case 'fail': return `❌ Update failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.SEARCHING:
        switch (phase) {
          case 'start': return `🔎 ${detailsText}`;
          case 'update': return `🔄 ${detailsText}`;
          case 'complete': return `✅ ${detailsText}`;
          case 'fail': return `❌ ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.RUNNING_COMMAND:
        switch (phase) {
          case 'start': return `⚡ Running: ${detailsText}`;
          case 'update': return `🔄 Executing: ${detailsText}`;
          case 'complete': return `✅ Executed: ${detailsText}`;
          case 'fail': return `❌ Command failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.INSTALLING:
        switch (phase) {
          case 'start': return `📦 Installing ${detailsText}`;
          case 'update': return `🔄 Downloading ${detailsText}`;
          case 'complete': return `✅ Installed ${detailsText}`;
          case 'fail': return `❌ Installation failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.BUILDING:
        switch (phase) {
          case 'start': return `🔨 Building ${detailsText}`;
          case 'update': return `🔄 Compiling ${detailsText}`;
          case 'complete': return `✅ Built ${detailsText}`;
          case 'fail': return `❌ Build failed: ${detailsText}`;
        }
        break;
    }

    return `${phase}: ${detailsText}`;
  }

  getCurrentAction(): SeronAction | null {
    return this.currentAction;
  }
}