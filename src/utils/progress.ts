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
          case 'start': return `is thinking...${detailsText}`;
          case 'update': return `is processing...${detailsText}`;
          case 'complete': return `finished thinking${detailsText}`;
          case 'fail': return `encountered an error while thinking: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.GENERATING:
        switch (phase) {
          case 'start': return `is generating response...${detailsText}`;
          case 'update': return `is still generating...${detailsText}`;
          case 'complete': return `finished generating response${detailsText}`;
          case 'fail': return `failed to generate response: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.CREATING_FILE:
        switch (phase) {
          case 'start': return `is creating file${detailsText}`;
          case 'update': return `is writing file${detailsText}`;
          case 'complete': return `created file${detailsText}`;
          case 'fail': return `failed to create file: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.EDITING_FILE:
        switch (phase) {
          case 'start': return `is editing file${detailsText}`;
          case 'update': return `is modifying file${detailsText}`;
          case 'complete': return `edited file${detailsText}`;
          case 'fail': return `failed to edit file: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.SEARCHING:
        switch (phase) {
          case 'start': return `is searching${detailsText}`;
          case 'update': return `is looking through files${detailsText}`;
          case 'complete': return `completed search${detailsText}`;
          case 'fail': return `search failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.RUNNING_COMMAND:
        switch (phase) {
          case 'start': return `is running command${detailsText}`;
          case 'update': return `is executing${detailsText}`;
          case 'complete': return `finished running command${detailsText}`;
          case 'fail': return `command failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.INSTALLING:
        switch (phase) {
          case 'start': return `is installing packages${detailsText}`;
          case 'update': return `is downloading dependencies${detailsText}`;
          case 'complete': return `installed packages${detailsText}`;
          case 'fail': return `package installation failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.BUILDING:
        switch (phase) {
          case 'start': return `is building project${detailsText}`;
          case 'update': return `is compiling${detailsText}`;
          case 'complete': return `built project${detailsText}`;
          case 'fail': return `build failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.ANALYZING:
        switch (phase) {
          case 'start': return `is analyzing${detailsText}`;
          case 'update': return `is examining code${detailsText}`;
          case 'complete': return `finished analysis${detailsText}`;
          case 'fail': return `analysis failed: ${detailsText}`;
        }
        break;

      default:
        return `is working${detailsText}`;
    }
  }

  getCurrentAction(): SeronAction | null {
    return this.currentAction;
  }
}