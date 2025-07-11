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
    console.log(chalk.blue('🤖 ') + chalk.cyan(message));
  }

  updateAction(action: SeronAction, details?: string): void {
    this.currentAction = action;
    
    const message = this.getActionMessage(action, 'update', details);
    console.log(chalk.blue('🤖 ') + chalk.yellow(message));
  }

  completeAction(action: SeronAction, details?: string): void {
    const duration = this.startTime > 0 ? Date.now() - this.startTime : 0;
    const durationText = duration > 0 ? ` (${duration}ms)` : '';
    
    const message = this.getActionMessage(action, 'complete', details) + chalk.gray(durationText);
    console.log(chalk.blue('🤖 ') + chalk.green(message));
    
    this.currentAction = null;
    this.startTime = 0;
  }

  failAction(action: SeronAction, error: string): void {
    const message = this.getActionMessage(action, 'fail', error);
    console.log(chalk.blue('🤖 ') + chalk.red(message));
    
    this.currentAction = null;
    this.startTime = 0;
  }

  private getActionMessage(action: SeronAction, phase: 'start' | 'update' | 'complete' | 'fail', details?: string): string {
    const detailsText = details ? ` ${details}` : '';
    
    switch (action) {
      case SERON_ACTIONS.THINKING:
        switch (phase) {
          case 'start': return `Seron is thinking...${detailsText}`;
          case 'update': return `Seron is processing...${detailsText}`;
          case 'complete': return `Seron finished thinking${detailsText}`;
          case 'fail': return `Seron encountered an error while thinking: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.GENERATING:
        switch (phase) {
          case 'start': return `Seron is generating response...${detailsText}`;
          case 'update': return `Seron is still generating...${detailsText}`;
          case 'complete': return `Seron finished generating response${detailsText}`;
          case 'fail': return `Seron failed to generate response: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.CREATING_FILE:
        switch (phase) {
          case 'start': return `Seron is creating file${detailsText}`;
          case 'update': return `Seron is writing file${detailsText}`;
          case 'complete': return `Seron created file${detailsText}`;
          case 'fail': return `Seron failed to create file: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.EDITING_FILE:
        switch (phase) {
          case 'start': return `Seron is editing file${detailsText}`;
          case 'update': return `Seron is modifying file${detailsText}`;
          case 'complete': return `Seron edited file${detailsText}`;
          case 'fail': return `Seron failed to edit file: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.SEARCHING:
        switch (phase) {
          case 'start': return `Seron is searching${detailsText}`;
          case 'update': return `Seron is looking through files${detailsText}`;
          case 'complete': return `Seron completed search${detailsText}`;
          case 'fail': return `Seron search failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.RUNNING_COMMAND:
        switch (phase) {
          case 'start': return `Seron is running command${detailsText}`;
          case 'update': return `Seron is executing${detailsText}`;
          case 'complete': return `Seron finished running command${detailsText}`;
          case 'fail': return `Seron command failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.INSTALLING:
        switch (phase) {
          case 'start': return `Seron is installing packages${detailsText}`;
          case 'update': return `Seron is downloading dependencies${detailsText}`;
          case 'complete': return `Seron installed packages${detailsText}`;
          case 'fail': return `Seron package installation failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.BUILDING:
        switch (phase) {
          case 'start': return `Seron is building project${detailsText}`;
          case 'update': return `Seron is compiling${detailsText}`;
          case 'complete': return `Seron built project${detailsText}`;
          case 'fail': return `Seron build failed: ${detailsText}`;
        }
        break;

      case SERON_ACTIONS.ANALYZING:
        switch (phase) {
          case 'start': return `Seron is analyzing${detailsText}`;
          case 'update': return `Seron is examining code${detailsText}`;
          case 'complete': return `Seron finished analysis${detailsText}`;
          case 'fail': return `Seron analysis failed: ${detailsText}`;
        }
        break;

      default:
        return `Seron is working${detailsText}`;
    }
  }

  getCurrentAction(): SeronAction | null {
    return this.currentAction;
  }
}