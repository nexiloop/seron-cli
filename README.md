# Seron CLI v1.0.2

*A powerful CLI for chatting with multiple AI models - now with automatic code execution*

```
███████╗███████╗██████╗  ██████╗ ███╗   ██╗
██╔════╝██╔════╝██╔══██╗██╔═══██╗████╗  ██║
███████╗█████╗  ██████╔╝██║   ██║██╔██╗ ██║
╚════██║██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║
███████║███████╗██║  ██║╚██████╔╝██║ ╚████║
╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

**Open source** | **Multiple AI providers** | **Automatic code execution**

---

## What's New in v1.0.2?

**Bug fixes and improvements:**

- **Clean User Interface**: Fixed issue where internal command syntax was shown to users
- **Smart File Handling**: Automatically detects existing files and edits them instead of creating duplicates
- **Better Error Handling**: Improved file operations and command execution
- **Enhanced AI Instructions**: Cleaner separation between user messages and background operations

## About Seron

Seron is a CLI tool that lets you chat with multiple AI models from your terminal. It can automatically create files, install packages, and run commands based on your conversations. No more switching between different AI websites or copying terminal commands.

## Installation

```bash
npm install -g seron-cli
```

Or install from source:
```bash
git clone https://github.com/nexiloop/seron-cli.git
cd seron-cli
npm install && npm run build && npm link
```

## Configuration

Seron saves all configuration locally in `~/.seron-cli/config.json`. Your data stays on your machine.

### API Keys you'll need:
- **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: Get from [Anthropic Console](https://console.anthropic.com/)
- **xAI**: Available at [x.ai](https://x.ai)
- **HuggingFace**: Free from [HuggingFace](https://huggingface.co/settings/tokens)

### Local models:
Install [Ollama](https://ollama.ai) for local models that don't require API keys.

## Commands

### `seron` 
Shows the banner and interactive menu

### `seron setup`
Configuration wizard for API keys and default model

### `seron chat` or `seron c`
Start chatting with AI that can create files and run commands automatically

**New Features:**
- **Automatic file creation**: Just say "create a React app" and watch it happen
- **Auto command execution**: Seron runs npm install, builds, and more
- **Real-time progress**: See exactly what Seron is doing
- **Zero copy-paste**: Everything happens automatically in your directory

**Options:**
- `-m, --model <model>` - Choose AI model for this session
- `-s, --system <prompt>` - Set custom system prompt

**Examples:**
```bash
# Basic enhanced chat
seron chat

# Build a complete React app automatically
seron chat -m gpt-4
# Then say: "Create a React todo app with TypeScript and Tailwind CSS"

# Code review mode
seron chat -m gpt-4 -s "universal-code"

# Creative writing with Claude
seron chat -m claude-3.5-sonnet -s "creative"

# Local model
seron chat -m llama3
```

### `seron models`
List all available models and their status

### `seron config`
Change settings

**Options:**
- `-k, --key <key>` - Set an API key
- `-m, --model <model>` - Change default model

## Real Examples

### Create a complete Next.js app:
```bash
seron chat -m gpt-4
```
Then say: *"Create a Next.js blog with TypeScript, Tailwind CSS, and sample posts"*

**Watch Seron:**
- Create package.json
- Install next, react, typescript...
- Create app/page.tsx
- Create tailwind.config.js
- Run npm run build
- Your blog is ready!

### Build a Python web scraper:
```bash
seron chat -m claude-3.5-sonnet
```
Then say: *"Create a Python script that scrapes Reddit posts and saves them to CSV"*

**Watch Seron:**
- Create scraper.py
- Create requirements.txt
- Run pip install -r requirements.txt
- Your scraper is ready!

## Supported Models

### OpenAI
- **GPT-4** - Most capable model
- **GPT-4 Turbo** - Faster and more efficient
- **GPT-3.5 Turbo** - Good for most tasks
- **GPT-4o** - Latest model with vision

### Anthropic
- **Claude 3.5 Sonnet** - Balanced performance
- **Claude 3 Opus** - Most capable Claude model
- **Claude 3 Haiku** - Fastest responses

### xAI
- **Grok-1** - Conversational AI
- **Grok-2** - Latest Grok model

### Local Models (via Ollama)
- **Llama 3** - Meta's open source model
- **Code Llama** - Specialized for coding
- **Mistral** - European AI model
- **Mixtral** - Mixture of experts model

### HuggingFace
- **Any model** - Thousands of community models
- **Custom models** - Your own fine-tuned models

## Chat Commands

While chatting:
- `exit` - Exit the chat
- `clear` - Clear chat history  
- `help` - Show help and features
- `/model <model-id>` - Switch models
- `/system <prompt>` - Change AI personality

## Progress Messages

Seron shows what it's doing:

- **Seron is thinking** - Processing your request
- **Seron is generating** - Creating the response
- **Seron is creating file** `filename.js` - Making new files
- **Seron is editing file** `package.json` - Modifying files
- **Seron is running command** `npm install react` - Executing commands
- **Seron is installing packages** - Managing dependencies
- **Success messages** - When operations complete

## Development

### Setup:
```bash
git clone https://github.com/nexiloop/seron-cli.git
cd seron-cli
npm install
```

### Development mode:
```bash
npm run dev
```

### Build:
```bash
npm run build
```

### Test:
```bash
npm run build
node dist/cli.js chat -m gpt-4
```

## Project Structure

```
seron-cli/
├── src/
│   ├── cli.ts              # Main entry point
│   ├── commands/           # All commands (enhanced chat)
│   ├── services/           # AI integrations + file system
│   ├── utils/             # Progress messages + banner
│   ├── config/            # Model configs and prompts
└── README.md              # You are here
```

## Contributing

1. Star this repository
2. Fork it
3. Make improvements
4. Send a pull request
5. Get credited as a contributor

## Issues and Support

- **Report bugs**: [GitHub Issues](https://github.com/nexiloop/seron-cli/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/nexiloop/seron-cli/discussions)

## License

MIT License - use this code however you want.

## Give us a star

If Seron helped you, please star the repository!

---

**Built by developers, for developers**  
**Maintained by NexiLoop**  
**Enhanced with AI automation**

*v1.0.2 includes important bug fixes for better user experience.*