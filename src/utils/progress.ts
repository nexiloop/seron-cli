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
    if (message) {
      const prefix = this.gradient('Seron');
      console.log(`${prefix} ${chalk.cyan(message)}`);
    }
  }

  updateAction(action: SeronAction, details?: string): void {
    this.currentAction = action;
    
    const message = this.getActionMessage(action, 'update', details);
    if (message) {
      const prefix = this.gradient('Seron');
      console.log(`${prefix} ${chalk.yellow(message)}`);
    }
  }

  completeAction(action: SeronAction, details?: string): void {
    const message = this.getActionMessage(action, 'complete', details);
    if (message) {
      const prefix = this.gradient('Seron');
      console.log(`${prefix} ${chalk.green(message)}`);
    }
    
    this.currentAction = null;
    this.startTime = 0;
  }

  failAction(action: SeronAction, error: string): void {
    const message = this.getActionMessage(action, 'fail', error);
    if (message) {
      const prefix = this.gradient('Seron');
      console.log(`${prefix} ${chalk.red(message)}`);
    }
    
    this.currentAction = null;
    this.startTime = 0;
  }

  private getActionMessage(action: SeronAction, phase: 'start' | 'update' | 'complete' | 'fail', details?: string): string {
    switch (action) {
      case SERON_ACTIONS.THINKING:
        if (phase === 'start') return 'Analyzing request...';
        if (phase === 'complete') return 'Done';
        if (phase === 'fail') return `Failed: ${details}`;
        return '';

      case SERON_ACTIONS.GENERATING:
        if (phase === 'start') return 'Working...';
        if (phase === 'complete') return 'Done';
        if (phase === 'fail') return `Failed: ${details}`;
        return '';

      case SERON_ACTIONS.CREATING_FILE:
        if (phase === 'start') return details ? `Creating ${details}` : '';
        if (phase === 'complete') return details ? `✓ Created ${details}` : '';
        if (phase === 'fail') return `Failed: ${details}`;
        return '';

      case SERON_ACTIONS.EDITING_FILE:
        if (phase === 'start') return details ? `Editing ${details}` : '';
        if (phase === 'complete') return details ? `✓ Updated ${details}` : '';
        if (phase === 'fail') return `Failed: ${details}`;
        return '';

      case SERON_ACTIONS.SEARCHING:
        if (phase === 'start' && details) return details;
        if (phase === 'complete' && details) return details;
        if (phase === 'fail') return `Not found: ${details}`;
        return '';

      case SERON_ACTIONS.RUNNING_COMMAND:
        if (phase === 'start' && details) return `Running: ${details}`;
        if (phase === 'complete') return '✓ Done';
        if (phase === 'fail') return `Failed: ${details}`;
        return '';

      case SERON_ACTIONS.INSTALLING:
        if (phase === 'start' && details) return `Installing ${details}`;
        if (phase === 'complete') return details ? `✓ Installed ${details}` : '✓ Done';
        if (phase === 'fail') return `Failed: ${details}`;
        return '';

      case SERON_ACTIONS.BUILDING:
        if (phase === 'start' && details) return `Building ${details}`;
        if (phase === 'complete') return '✓ Built successfully';
        if (phase === 'fail') return `Failed: ${details}`;
        return '';

      case SERON_ACTIONS.ANALYZING:
        if (phase === 'start' && details) return details;
        if (phase === 'complete' && details) return details;
        if (phase === 'fail') return `Failed: ${details}`;
        return '';
    }

    return '';
  }

  getCurrentAction(): SeronAction | null {
    return this.currentAction;
  }
}