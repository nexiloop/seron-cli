import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SeronProgress, SERON_ACTIONS } from '../utils/progress.js';

const execAsync = promisify(exec);

export class FileSystemService {
  private progress: SeronProgress;

  constructor() {
    this.progress = new SeronProgress();
  }

  async createFile(filePath: string, content: string): Promise<void> {
    const fileName = path.basename(filePath);
    this.progress.startAction(SERON_ACTIONS.CREATING_FILE, fileName);

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.writeFile(filePath, content, 'utf8');
      
      this.progress.completeAction(SERON_ACTIONS.CREATING_FILE, fileName);
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.CREATING_FILE, `${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async editFile(filePath: string, content: string): Promise<void> {
    const fileName = path.basename(filePath);
    this.progress.startAction(SERON_ACTIONS.EDITING_FILE, fileName);

    try {
      await fs.writeFile(filePath, content, 'utf8');
      this.progress.completeAction(SERON_ACTIONS.EDITING_FILE, fileName);
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.EDITING_FILE, `${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);
    this.progress.startAction(SERON_ACTIONS.SEARCHING, `reading ${fileName}`);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      this.progress.completeAction(SERON_ACTIONS.SEARCHING, `read ${fileName}`);
      return content;
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.SEARCHING, `${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    this.progress.startAction(SERON_ACTIONS.SEARCHING, `listing ${path.basename(dirPath)}`);

    try {
      const files = await fs.readdir(dirPath);
      this.progress.completeAction(SERON_ACTIONS.SEARCHING, `found ${files.length} items`);
      return files;
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.SEARCHING, `${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async runCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
    this.progress.startAction(SERON_ACTIONS.RUNNING_COMMAND, command);

    try {
      const result = await execAsync(command, { cwd: cwd || process.cwd() });
      this.progress.completeAction(SERON_ACTIONS.RUNNING_COMMAND, command);
      return result;
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.RUNNING_COMMAND, `${command}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async installPackage(packageName: string, dev: boolean = false): Promise<void> {
    const command = `npm install ${packageName}${dev ? ' --save-dev' : ''}`;
    this.progress.startAction(SERON_ACTIONS.INSTALLING, packageName);

    try {
      await execAsync(command);
      this.progress.completeAction(SERON_ACTIONS.INSTALLING, packageName);
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.INSTALLING, `${packageName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async initializeProject(projectType: 'npm' | 'typescript' | 'vite' = 'npm', cwd?: string): Promise<void> {
    const workingDir = cwd || process.cwd();
    
    switch (projectType) {
      case 'npm':
        this.progress.startAction(SERON_ACTIONS.BUILDING, 'initializing npm project');
        try {
          await execAsync('npm init -y', { cwd: workingDir });
          this.progress.completeAction(SERON_ACTIONS.BUILDING, 'npm project initialized');
        } catch (error) {
          this.progress.failAction(SERON_ACTIONS.BUILDING, `npm init failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
        break;

      case 'typescript':
        this.progress.startAction(SERON_ACTIONS.BUILDING, 'initializing TypeScript project');
        try {
          await execAsync('npm init -y', { cwd: workingDir });
          await this.installPackage('typescript', true);
          await this.installPackage('@types/node', true);
          await execAsync('npx tsc --init', { cwd: workingDir });
          this.progress.completeAction(SERON_ACTIONS.BUILDING, 'TypeScript project initialized');
        } catch (error) {
          this.progress.failAction(SERON_ACTIONS.BUILDING, `TypeScript init failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
        break;

      case 'vite':
        this.progress.startAction(SERON_ACTIONS.BUILDING, 'initializing Vite project');
        try {
          await execAsync('npm create vite@latest . -- --template vanilla-ts', { cwd: workingDir });
          await execAsync('npm install', { cwd: workingDir });
          this.progress.completeAction(SERON_ACTIONS.BUILDING, 'Vite project initialized');
        } catch (error) {
          this.progress.failAction(SERON_ACTIONS.BUILDING, `Vite init failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
        break;
    }
  }

  async searchFiles(pattern: string, directory?: string): Promise<string[]> {
    const searchDir = directory || process.cwd();
    this.progress.startAction(SERON_ACTIONS.SEARCHING, `for "${pattern}"`);

    try {
      const command = process.platform === 'win32' 
        ? `dir /s /b "${pattern}"` 
        : `find "${searchDir}" -name "${pattern}"`;
      
      const { stdout } = await execAsync(command, { cwd: searchDir });
      const files = stdout.trim().split('\n').filter(line => line.length > 0);
      
      this.progress.completeAction(SERON_ACTIONS.SEARCHING, `found ${files.length} files`);
      return files;
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.SEARCHING, `pattern "${pattern}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    const dirName = path.basename(dirPath);
    this.progress.startAction(SERON_ACTIONS.CREATING_FILE, `directory ${dirName}`);

    try {
      await fs.mkdir(dirPath, { recursive: true });
      this.progress.completeAction(SERON_ACTIONS.CREATING_FILE, `directory ${dirName}`);
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.CREATING_FILE, `directory ${dirName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}