import chalk from 'chalk';

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

  startAction(action: SeronAction, details?: string): void {
    this.currentAction = action;
    this.startTime = Date.now();
    
    const message = this.getActionMessage(action, 'start', details);
    console.log(chalk.blue('Seron ') + chalk.cyan(message));
  }

  updateAction(action: SeronAction, details?: string): void {
    this.currentAction = action;
    
    const message = this.getActionMessage(action, 'update', details);
    console.log(chalk.blue('Seron ') + chalk.yellow(message));
  }

  completeAction(action: SeronAction, details?: string): void {
    const duration = this.startTime > 0 ? Date.now() - this.startTime : 0;
    const durationText = duration > 0 ? ` (${duration}ms)` : '';
    
    const message = this.getActionMessage(action, 'complete', details) + chalk.gray(durationText);
    console.log(chalk.blue('Seron ') + chalk.green(message));
    
    this.currentAction = null;
    this.startTime = 0;
  }

  failAction(action: SeronAction, error: string): void {
    const message = this.getActionMessage(action, 'fail', error);
    console.log(chalk.blue('Seron ') + chalk.red(message));
    
    this.currentAction = null;
    this.startTime = 0;
  }

  private getActionMessage(action: SeronAction, phase: 'start' | 'update' | 'complete' | 'fail', details?: string): string {
    const detailsText = details ? ` ${details}` : '';
    
    switch (action) {
      case SERON_ACTIONS.THINKING:
        switch (phase) {
          case 'start': return `Planning what to do...${detailsText}`;
          case 'update': return `Still planning...${detailsText}`;
          case 'complete': return `Finished planning${detailsText}`;
          case 'fail': return `Failed to plan: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.ANALYZING:
        switch (phase) {
          case 'start': return `Analyzing ${detailsText}`;
          case 'update': return `Still analyzing...${detailsText}`;
          case 'complete': return `✓ ${detailsText}`;
          case 'fail': return `Failed to analyze: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.GENERATING:
        switch (phase) {
          case 'start': return `Preparing to create files and run commands...${detailsText}`;
          case 'update': return `Working on the solution...${detailsText}`;
          case 'complete': return `Ready to execute plan${detailsText}`;
          case 'fail': return `Failed to generate solution: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.CREATING_FILE:
        switch (phase) {
          case 'start': return `📝 Creating ${detailsText}`;
          case 'update': return `Still creating ${detailsText}`;
          case 'complete': return `✓ Created ${detailsText}`;
          case 'fail': return `❌ Failed to create: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.EDITING_FILE:
        switch (phase) {
          case 'start': return `✏️ Editing ${detailsText}`;
          case 'update': return `Still editing ${detailsText}`;
          case 'complete': return `✓ Updated ${detailsText}`;
          case 'fail': return `❌ Failed to edit: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.SEARCHING:
        switch (phase) {
          case 'start': return `🔍 ${detailsText}`;
          case 'update': return `Still searching ${detailsText}`;
          case 'complete': return `✓ ${detailsText}`;
          case 'fail': return `❌ Search failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.RUNNING_COMMAND:
        switch (phase) {
          case 'start': return `⚡ Running: ${detailsText}`;
          case 'update': return `Still running: ${detailsText}`;
          case 'complete': return `✓ Finished: ${detailsText}`;
          case 'fail': return `❌ Command failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.INSTALLING:
        switch (phase) {
          case 'start': return `📦 Installing ${detailsText}`;
          case 'update': return `Still installing ${detailsText}`;
          case 'complete': return `✓ Installed ${detailsText}`;
          case 'fail': return `❌ Installation failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.BUILDING:
        switch (phase) {
          case 'start': return `🔨 Building ${detailsText}`;
          case 'update': return `Still building ${detailsText}`;
          case 'complete': return `✓ Built ${detailsText}`;
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