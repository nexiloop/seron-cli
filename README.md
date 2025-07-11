# Seron CLI ⚡ v1.0.1

*The dopest CLI that actually slaps - now with automatic code execution* 🔥

```
███████╗███████╗██████╗  ██████╗ ███╗   ██╗
██╔════╝██╔════╝██╔══██╗██╔═══██╗████╗  ██║
███████╗█████╗  ██████╔╝██║   ██║██╔██╗ ██║
╚════██║██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║
███████║███████╗██║  ██║╚██████╔╝██║ ╚████║
╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

**Open source AF** 🌟 **No cap, just pure vibes** ✨ **Now with AI that codes for you** 🚀

---

## 🆕 What's New in v1.0.1? 

**SERON JUST GOT SUPERPOWERS** 💪

- **🤖 Smart Progress Messages**: Watch Seron tell you exactly what it's doing
  - "Seron is creating file..."
  - "Seron is editing file..."
  - "Seron is running command..."
  - "Seron is installing packages..."

- **⚡ Automatic Code Execution**: No more copy-paste! Seron creates files and runs commands automatically
  - Creates files directly in your directory
  - Installs npm packages automatically
  - Runs build commands
  - Sets up entire projects with one command

- **🎯 Enhanced Chat Experience**: Real-time feedback on everything Seron does
- **🛠️ Zero Manual Work**: Just describe what you want, Seron builds it

## Yo, what's this? 🤔

Seron is that CLI tool that lets you chat with literally ANY AI model from your terminal AND now it can code for you automatically. No more switching between 50 different websites OR copying terminal commands - just tell Seron what you want and watch it create entire projects, install dependencies, and get everything running. It's giving main character energy fr 💯

## Get it running (it's easy bestie) 📦

```bash
npm install -g seron-cli
```

Or if you're feeling spicy and want the latest:
```bash
git clone https://github.com/nexiloop/seron-cli.git
cd seron-cli
npm install && npm run build && npm link
```

## Configuration (set your vibes) ⚙️

Seron saves everything locally in `~/.seron-cli/config.json`. No cloud BS, just your stuff on your machine.

### API Keys you might need:
- **OpenAI**: Get it from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: Grab one from [Anthropic Console](https://console.anthropic.com/)
- **xAI**: Coming soon to [x.ai](https://x.ai)
- **HuggingFace**: Free from [HuggingFace](https://huggingface.co/settings/tokens)

### Local models:
Install [Ollama](https://ollama.ai) and you're good to go. No keys needed, just vibes.

## Commands that actually work 🛠️

### `seron` 
Shows the fire banner and gets you started

### `seron setup`
The setup wizard that doesn't suck. Configure your API keys and pick your default model.

### `seron chat` or `seron c` 🚀 **NOW WITH SUPERPOWERS**
Start chatting with AI that can create files and run commands automatically!

**New Features:**
- ✨ **Automatic file creation**: Just say "create a React app" and watch it happen
- 🏃‍♂️ **Auto command execution**: Seron runs npm install, builds, and more
- 📊 **Real-time progress**: See exactly what Seron is doing
- 🎯 **Zero copy-paste**: Everything happens automatically in your directory

**Options:**
- `-m, --model <model>` - Pick your AI bestie for this session
- `-s, --system <prompt>` - Set a custom vibe for the AI

**Examples:**
```bash
# Basic enhanced chat (with auto code execution)
seron chat

# Build a complete React app automatically
seron chat -m gpt-4
# Then say: "Create a React todo app with TypeScript and Tailwind CSS"
# Watch Seron create files, install packages, and set everything up!

# Code review mode (it's actually good)
seron chat -m gpt-4 -s "universal-code"

# Creative writing with Claude
seron chat -m claude-3.5-sonnet -s "creative"

# Local model vibes
seron chat -m llama3
```

### `seron models`
See all available models and their status (online/offline vibes)

### `seron config`
Change your settings when you're feeling different

**Options:**
- `-k, --key <key>` - Set an API key
- `-m, --model <model>` - Change your default model

## 🔥 Real Examples That Will Blow Your Mind

### Create a complete Next.js app in seconds:
```bash
seron chat -m gpt-4
```
Then say: *"Create a Next.js blog with TypeScript, Tailwind CSS, and a posts directory with some sample posts"*

**Watch Seron:**
- 🤖 Seron is creating file package.json
- 🤖 Seron is installing packages next, react, typescript...
- 🤖 Seron is creating file app/page.tsx
- 🤖 Seron is creating file tailwind.config.js
- 🤖 Seron is running command npm run build
- ✅ Your blog is ready!

### Build a Python web scraper:
```bash
seron chat -m claude-3.5-sonnet
```
Then say: *"Create a Python script that scrapes Reddit posts and saves them to CSV"*

**Watch Seron:**
- 🤖 Seron is creating file scraper.py
- 🤖 Seron is creating file requirements.txt
- 🤖 Seron is running command pip install -r requirements.txt
- ✅ Your scraper is ready to run!

### Set up a complete full-stack app:
```bash
seron chat -m gpt-4
```
Then say: *"Create a full-stack todo app with Express backend, React frontend, and SQLite database"*

**Watch Seron:**
- Create backend files
- Create frontend files
- Install all dependencies
- Set up database schema
- Configure build scripts
- ✅ Full app ready in minutes!

## Models we support (it's a lot) 🎭

### OpenAI (the classics)
- **GPT-4** - The OG smart one
- **GPT-4 Turbo** - Faster and smarter
- **GPT-3.5 Turbo** - Still slaps for most things
- **GPT-4o** - The newest hotness

### Anthropic (the thoughtful ones)
- **Claude 3.5 Sonnet** - The balanced king
- **Claude 3 Opus** - Big brain energy
- **Claude 3 Haiku** - Fast and efficient

### xAI (Elon's baby)
- **Grok-1** - The one with attitude
- **Grok-2** - Even more unhinged

### Local Models (privacy kings)
- **Llama 3** - Meta's open source flex
- **Code Llama** - For when you need to code
- **Mistral** - European excellence
- **Mixtral** - The mixture of experts

### HuggingFace (community vibes)
- **Any model on HF** - Literally thousands to choose from
- **Custom fine-tunes** - Your own AI personality

## Chat commands that hit ⌨️

While you're chatting:
- `exit` - Peace out
- `clear` - Clean slate  
- `help` - When you're lost (now shows enhanced features!)
- `/model <model-id>` - Switch models mid-conversation
- `/system <prompt>` - Change the AI's personality

## 🎯 Progress Messages You'll See

Seron now shows you exactly what it's doing:

- 🤖 **Seron is thinking** - Processing your request
- 🤖 **Seron is generating** - Creating the response
- 🤖 **Seron is creating file** `filename.js` - Making new files
- 🤖 **Seron is editing file** `package.json` - Modifying existing files
- 🤖 **Seron is running command** `npm install react` - Executing commands
- 🤖 **Seron is installing packages** - Managing dependencies
- 🤖 **Seron is searching** - Looking through files
- ✅ **Success messages** - When everything works perfectly

## For developers (the real ones) 👨‍💻

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

### Build for production:
```bash
npm run build
```

### Test the enhanced features:
```bash
npm run build
node dist/cli.js chat -m gpt-4
# Try: "Create a simple Express server with TypeScript"
```

## Project structure (for the curious) 📁

```
seron-cli/
├── src/
│   ├── cli.ts              # The main entry point
│   ├── commands/           # All the commands (enhanced chat!)
│   ├── services/           # AI integrations + file system
│   ├── utils/             # Progress messages + banner
│   ├── config/            # Model configs and prompts
└── README.md              # You are here
```

## Contributing (join the gang) 🤝

1. Star this repo (seriously, it helps a lot)
2. Fork it
3. Make it better
4. Send a PR
5. Get credited as a contributor

## Issues? We got you 🚨

Found a bug? Something not working? Don't suffer in silence:

- 🐛 **Report bugs**: [GitHub Issues](https://github.com/nexiloop/seron-cli/issues)
- 💭 **Ideas & suggestions**: [GitHub Discussions](https://github.com/nexiloop/seron-cli/discussions)

## License 📜

MIT License - do whatever you want with this code. Build something cool and tag us!

## Give us a star ⭐

If Seron helped you build something cool or just made your day better, smash that star button. It's free and makes our day!

---

**Built by developers, for developers** 🔥  
**Maintained by NexiLoop** 💜  
**Enhanced with AI superpowers** 🚀

*P.S. - v1.0.1 is just the beginning. We're cooking up even more insane features. Stay tuned!* ✨