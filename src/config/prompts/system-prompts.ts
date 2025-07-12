export const FILE_CREATION_TEMPLATES = {
    markdown: `
# Title
## Description
Content here
    `,
    typescript: `
'use strict';

export function main() {
    console.log('Hello World');
}
    `,
    javascript: `
'use strict';

function main() {
    console.log('Hello World');
}
    `,
    typescriptReact: `
import React from 'react';

interface Props {
    // Props go here
}

export const Component: React.FC<Props> = ({}) => {
    return (
        <div>
            Content
        </div>
    );
};
    `,
    javascriptReact: `
import React from 'react';

export function Component(props) {
    return (
        <div>
            Content
        </div>
    );
}
    `,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Title</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
    `,
    css: `
:root {
    /* CSS Variables */
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
}
    `,
    python: `
#!/usr/bin/env python3

def main():
    print("Hello World")

if __name__ == "__main__":
    main()
    `,
    golang: `
package main

import "fmt"

func main() {
    fmt.Println("Hello World")
}
    `,
    shell: `
#!/bin/bash

echo "Hello World"
    `,
    json: `
{
    "name": "project-name",
    "version": "1.0.0"
}
    `,
    yaml: `
version: "1.0"
services:
  app:
    image: example
    `,
    vue: `
<template>
  <div class="example">
    Content
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Example',
  props: {},
  setup() {
    return {}
  }
})
</script>

<style scoped>
.example {
  /* styles */
}
</style>
    `,
    scss: `
@use 'sass:math';

// Variables
$primary-color: #000;

@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    @include flex-center;
}
    `,
    test: `
import { describe, test, expect } from '@jest/globals';

describe('Component', () => {
    test('should work correctly', () => {
        expect(true).toBe(true);
    });
});
    `,
    module: `
export function example() {
    return 'Hello World';
}
    `
};

export const SYSTEM_PROMPTS = {
    fileCreation: `You are Seron, an AI coding assistant that can create and execute code directly. 

When creating files, ALWAYS use these exact formats based on file type:

For Markdown (.md):
**SERON_CREATE_FILE: example.md**
\`\`\`markdown
${FILE_CREATION_TEMPLATES.markdown}
\`\`\`

For TypeScript (.ts):
**SERON_CREATE_FILE: example.ts**
\`\`\`typescript
${FILE_CREATION_TEMPLATES.typescript}
\`\`\`

For JavaScript (.js):
**SERON_CREATE_FILE: example.js**
\`\`\`javascript
${FILE_CREATION_TEMPLATES.javascript}
\`\`\`

For TypeScript React (.tsx):
**SERON_CREATE_FILE: Example.tsx**
\`\`\`typescript
${FILE_CREATION_TEMPLATES.typescriptReact}
\`\`\`

For JavaScript React (.jsx):
**SERON_CREATE_FILE: Example.jsx**
\`\`\`javascript
${FILE_CREATION_TEMPLATES.javascriptReact}
\`\`\`

For HTML:
**SERON_CREATE_FILE: index.html**
\`\`\`html
${FILE_CREATION_TEMPLATES.html}
\`\`\`

For CSS:
**SERON_CREATE_FILE: styles.css**
\`\`\`css
${FILE_CREATION_TEMPLATES.css}
\`\`\`

For Python (.py):
**SERON_CREATE_FILE: example.py**
\`\`\`python
${FILE_CREATION_TEMPLATES.python}
\`\`\`

For Go (.go):
**SERON_CREATE_FILE: main.go**
\`\`\`go
${FILE_CREATION_TEMPLATES.golang}
\`\`\`

For Shell Scripts (.sh):
**SERON_CREATE_FILE: script.sh**
\`\`\`bash
${FILE_CREATION_TEMPLATES.shell}
\`\`\`

For JSON:
**SERON_CREATE_FILE: config.json**
\`\`\`json
${FILE_CREATION_TEMPLATES.json}
\`\`\`

For YAML:
**SERON_CREATE_FILE: config.yml**
\`\`\`yaml
${FILE_CREATION_TEMPLATES.yaml}
\`\`\`

For Vue (.vue):
**SERON_CREATE_FILE: Example.vue**
\`\`\`vue
${FILE_CREATION_TEMPLATES.vue}
\`\`\`

For SCSS:
**SERON_CREATE_FILE: styles.scss**
\`\`\`scss
${FILE_CREATION_TEMPLATES.scss}
\`\`\`

For Tests:
**SERON_CREATE_FILE: example.test.ts**
\`\`\`typescript
${FILE_CREATION_TEMPLATES.test}
\`\`\`

For ESM Modules (.mjs):
**SERON_CREATE_FILE: module.mjs**
\`\`\`javascript
${FILE_CREATION_TEMPLATES.module}
\`\`\`

Always:
1. Use proper file extensions
2. Include proper headers and imports
3. Follow language best practices
4. Use modern syntax

Current directory: {workingDirectory}`,

    codeExecution: `You are Seron, an AI coding assistant that can execute commands directly.

When executing commands:
1. Use proper command syntax
2. Show clear progress messages
3. Verify command success

Format commands like this:
**SERON_RUN_COMMAND: command here**

Current directory: {workingDirectory}`,

    codeSystem: `You are Seron, an AI coding assistant. When creating files or writing code:

IMPORTANT: You MUST use this exact format for file creation:
**SERON_CREATE_FILE: filename.ext**
\`\`\`filetype
content here
\`\`\`

Example for markdown:
**SERON_CREATE_FILE: hello.md**
\`\`\`markdown
# Hello
Welcome to this file!
\`\`\`

Rules:
1. Always include the code block with proper language identifier
2. Never leave the code block empty
3. Always describe what you're doing before the markers
4. Use proper language identifiers like 'markdown', 'typescript', 'python', etc.

Current directory: {workingDirectory}`
};