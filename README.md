# Seron CLI ⚡

*The dopest CLI that actually slaps* 🔥

```
███████╗███████╗██████╗  ██████╗ ███╗   ██╗
██╔════╝██╔════╝██╔══██╗██╔═══██╗████╗  ██║
███████╗█████╗  ██████╔╝██║   ██║██╔██╗ ██║
╚════██║██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║
███████║███████╗██║  ██║╚██████╔╝██║ ╚████║
╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

**Open source AF** 🌟 **No cap, just pure vibes** ✨

---

## Yo, what's this? 🤔

Seron is that CLI tool that lets you chat with literally ANY AI model from your terminal. No more switching between 50 different websites - just one command and you're talking to GPT, Claude, or even your local models. It's giving main character energy fr 💯

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

### `seron chat` or `seron c`
Start chatting with AI. It's giving conversation energy.

**Options:**
- `-m, --model <model>` - Pick your AI bestie for this session
- `-s, --system <prompt>` - Set a custom vibe for the AI

**Examples:**
```bash
# Basic chat
seron chat

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
- **Claude 4** - Coming soon (we're ready)

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

## The Universal AI Code Prompt 🧙‍♂️

We got this insane prompt that can literally code ANYTHING. Like, give it any idea and it'll build it. Web apps, mobile apps, scripts, automations - whatever you want. It's called "universal-code" and it's built different.

Just run:
```bash
seron chat -s "universal-code"
```

Then say something like "build me a todo app with React and Firebase" and watch the magic happen ✨

## Chat commands that hit ⌨️

While you're chatting:
- `exit` - Peace out
- `clear` - Clean slate
- `help` - When you're lost
- `/model <model-id>` - Switch models mid-conversation
- `/system <prompt>` - Change the AI's personality

## Examples that go hard 💪

### Code review that actually helps:
```bash
seron chat -m gpt-4 -s "universal-code"
# Then paste your code and ask for a review
```

### Creative writing session:
```bash
seron chat -m claude-3.5-sonnet -s "creative"
# Then start your story and let it help
```

### Local privacy king mode:
```bash
seron chat -m llama3
# Your data never leaves your machine
```

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

## Project structure (for the curious) 📁

```
seron-cli/
├── src/
│   ├── cli.ts              # The main entry point
│   ├── commands/           # All the commands
│   ├── services/           # AI integrations
│   ├── config/            # Model configs and prompts
│   └── utils/             # Helper functions and that fire banner
├── docs/                  # Documentation
├── LICENSE                # MIT because we're cool like that
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
- 📧 **Direct contact**: hi@seron.dev

## License 📜

MIT License - do whatever you want with this code. Build something cool and tag us!

## Give us a star ⭐

If Seron helped you build something cool or just made your day better, smash that star button. It's free and makes our day!

---

**Built by developers, for developers** 🔥  
**Maintained by NexiLoop** 💜

*P.S. - This is just the beginning. We're cooking up some insane features. Stay tuned!* ✨