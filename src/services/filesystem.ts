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

  private getLanguageSpecificSettings(language: string, filePath: string): { indent: string; lineEnding: string; template?: string } {
    // Default settings
    let indent = '  ';
    let lineEnding = '\n';
    let template: string | undefined;

    // Detect file extension
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    // Language-specific settings
    switch (ext) {
      case '.py':
        indent = '    ';
        break;
      
      case '.rb':
        indent = '  ';
        break;
      
      case '.go':
        indent = '\t';
        break;
      
      case '.html':
        template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

</body>
</html>`;
        break;
      
      case '.css':
        template = `/* ${fileName} styles */
:root {
    /* Define your variables here */
}

/* Reset default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
}`;
        break;
      
      case '.jsx':
      case '.tsx':
        template = `import React from 'react';

interface Props {
    // Define your props here
}

export const ${fileName.replace(/\.[^/.]+$/, '')} = ({}: Props) => {
    return (
        <div>
            
        </div>
    );
};`;
        break;
      
      case '.js':
      case '.ts':
        if (fileName.includes('.config.')) {
          // Config file template
          template = `module.exports = {
    // Configuration options
};`;
        } else if (fileName.includes('.test.') || fileName.includes('.spec.')) {
          // Test file template
          const testName = fileName.replace(/\.(test|spec)\.[^/.]+$/, '');
          template = `describe('${testName}', () => {
    test('should work correctly', () => {
        // Add your test here
    });
});`;
        }
        break;
      
      case '.json':
        template = `{
    
}`;
        break;
      
      case '.md':
        template = `# ${fileName.replace(/\.[^/.]+$/, '')}

## Description

## Usage

## Examples
`;
        break;
      
      case '.scss':
      case '.sass':
        template = `// ${fileName} styles
@use 'sass:math';

// Variables
$primary-color: #000;

// Mixins
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

// Styles
body {
    font-family: system-ui, -apple-system, sans-serif;
}`;
        break;
      
      case '.vue':
        template = `<template>
    <div>
        
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: '${fileName.replace(/\.[^/.]+$/, '')}',
    props: {
        // Define props here
    },
    setup() {
        return {
            // Component logic here
        };
    },
});
</script>

<style scoped>
/* Component styles */
</style>`;
        break;
    }

    // Windows-specific files use CRLF
    if (['.bat', '.ps1', '.cmd'].includes(ext)) {
      lineEnding = '\r\n';
    }

    return { indent, lineEnding, template };
  }

  async createFile(filePath: string, content: string, language?: string): Promise<void> {
    const fileName = path.basename(filePath);
    this.progress.startAction(SERON_ACTIONS.CREATING_FILE, fileName);

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Get language-specific settings
      const { indent, lineEnding, template } = this.getLanguageSpecificSettings(language || '', filePath);
      
      // Use template if provided and content is empty
      let finalContent = content.trim().length > 0 ? content : template || '';
      
      // Format content with proper indentation and line endings
      finalContent = finalContent
        .split('\n')
        .map(line => line.replace(/^\s+/, match => match.replace(/\t/g, indent)))
        .join(lineEnding);
      
      // Ensure final newline
      if (!finalContent.endsWith(lineEnding)) {
        finalContent += lineEnding;
      }
      
      // Add language-specific headers
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.py' && !finalContent.startsWith('#!')) {
        finalContent = '#!/usr/bin/env python3\n' + finalContent;
      } else if (ext === '.sh' && !finalContent.startsWith('#!')) {
        finalContent = '#!/bin/bash\n' + finalContent;
      } else if (ext === '.rb' && !finalContent.startsWith('#!')) {
        finalContent = '#!/usr/bin/env ruby\n' + finalContent;
      } else if (['.js', '.ts'].includes(ext) && !finalContent.includes('use strict')) {
        finalContent = "'use strict';\n\n" + finalContent;
      }
      
      // Write file
      await fs.writeFile(filePath, finalContent, 'utf8');
      
      // Make scripts executable on Unix-like systems
      if (process.platform !== 'win32' && ['.sh', '.py', '.rb', ''].includes(ext)) {
        try {
          await fs.chmod(filePath, 0o755);
        } catch (error) {
          console.error(`Warning: Could not make ${fileName} executable:`, error);
        }
      }
      
      this.progress.completeAction(SERON_ACTIONS.CREATING_FILE, fileName);
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.CREATING_FILE, `${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async editFile(filePath: string, content: string, language?: string): Promise<void> {
    const fileName = path.basename(filePath);
    this.progress.startAction(SERON_ACTIONS.EDITING_FILE, fileName);

    try {
      // Get language-specific settings
      const { indent, lineEnding } = this.getLanguageSpecificSettings(language || '', filePath);
      
      // Format content with proper indentation and line endings
      const formattedContent = content
        .split('\n')
        .map(line => line.replace(/^\s+/, match => match.replace(/\t/g, indent)))
        .join(lineEnding) + lineEnding;
      
      await fs.writeFile(filePath, formattedContent, 'utf8');
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
    const fileName = command.split(' ')[0];
    this.progress.startAction(SERON_ACTIONS.RUNNING_COMMAND, command);

    // Special handling for npm/npx commands
    if (command.startsWith('npx create-next-app') || 
        command.startsWith('npm install') || 
        command.startsWith('cd ')) {
      
      const parts = command.split('&&').map(cmd => cmd.trim());
      
      for (const part of parts) {
        try {
          if (part.startsWith('cd ')) {
            // Handle directory change
            const dir = part.slice(3).trim();
            process.chdir(path.resolve(cwd || process.cwd(), dir));
            this.progress.completeAction(SERON_ACTIONS.RUNNING_COMMAND, `Changed directory to ${dir}`);
            continue;
          }
          
          const result = await execAsync(part, { cwd: process.cwd() });
          this.progress.completeAction(SERON_ACTIONS.RUNNING_COMMAND, part);
          
          // For npm install, also show package installation progress
          if (part.startsWith('npm install')) {
            const packages = part.replace('npm install', '').trim().split(' ').filter(Boolean);
            for (const pkg of packages) {
              this.progress.completeAction(SERON_ACTIONS.INSTALLING, pkg);
            }
          }
        } catch (error) {
          this.progress.failAction(SERON_ACTIONS.RUNNING_COMMAND, `${part}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      }
      return { stdout: '', stderr: '' };
    }

    try {
      const result = await execAsync(command, { cwd: cwd || process.cwd() });
      this.progress.completeAction(SERON_ACTIONS.RUNNING_COMMAND, command);
      return result;
    } catch (error) {
      this.progress.failAction(SERON_ACTIONS.RUNNING_COMMAND, `${command}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Add handling for file editing based on commands
  async handleFileOperation(operation: string, filename: string, content: string): Promise<void> {
    const filePath = path.resolve(process.cwd(), filename);

    switch (operation) {
      case 'create':
        await this.createFile(filePath, content);
        break;
      case 'edit':
        await this.editFile(filePath, content);
        break;
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }

  // Execute multiple commands in sequence
  async executeCommands(commands: string[], cwd?: string): Promise<void> {
    for (const command of commands) {
      await this.runCommand(command, cwd);
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