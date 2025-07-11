import Conf from 'conf';
import path from 'path';
import os from 'os';

export class ConfigService {
  private config: Conf<any>;

  constructor() {
    this.config = new Conf({
      projectName: 'seron-cli',
      configName: 'config',
      cwd: path.join(os.homedir(), '.seron-cli'),
      schema: {
        openai_api_key: {
          type: 'string'
        },
        anthropic_api_key: {
          type: 'string'
        },
        xai_api_key: {
          type: 'string'
        },
        huggingface_api_key: {
          type: 'string'
        },
        default_model: {
          type: 'string',
          default: 'gpt-4o-mini'
        },
        system_prompt: {
          type: 'string',
          default: 'You are Seron, a helpful AI assistant created by NexiLoop.'
        }
      }
    });
  }

  get(key: string): any {
    return this.config.get(key);
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  delete(key: string): void {
    this.config.delete(key);
  }

  clear(): void {
    this.config.clear();
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  getAll(): Record<string, any> {
    return this.config.store;
  }
}