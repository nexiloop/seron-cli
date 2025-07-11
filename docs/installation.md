# Installation Guide 🚀

*Get Seron CLI up and running in 2 minutes*

## Quick Install (Recommended) ⚡

### From NPM (Coming Soon)
```bash
npm install -g seron-cli
seron setup
```

### From Source (Available Now)
```bash
# Clone the repo
git clone https://github.com/nexiloop/seron-cli.git
cd seron-cli

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (makes 'seron' command available anywhere)
npm link

# Setup your AI providers
seron setup
```

## Verify Installation ✅

After installation, test that everything works:

```bash
# Check if Seron is installed
seron --version

# See the fire banner
seron

# Set up your AI models
seron setup

# Start chatting!
seron chat
```

## Installation Options 📦

### Option 1: Global Installation (Recommended)
```bash
npm install -g seron-cli
```
**Pros:** Type `seron` from anywhere  
**Cons:** Needs admin/sudo on some systems

### Option 2: Local Development
```bash
git clone https://github.com/nexiloop/seron-cli.git
cd seron-cli
npm install
npm run build
node dist/cli.js
```
**Pros:** Full control, can modify code  
**Cons:** Need to be in project directory

### Option 3: NPX (Try Before Install)
```bash
npx seron-cli setup
npx seron-cli chat
```
**Pros:** No installation needed  
**Cons:** Slower startup, downloads each time

## Platform-Specific Instructions 💻

### Windows
```powershell
# Using npm (requires Node.js)
npm install -g seron-cli

# Or using Chocolatey (coming soon)
choco install seron-cli
```

### macOS
```bash
# Using npm
npm install -g seron-cli

# Or using Homebrew (coming soon)
brew install seron-cli
```

### Linux
```bash
# Using npm
sudo npm install -g seron-cli

# Or download binary (coming soon)
curl -L https://releases.seron.dev/latest/seron-linux > /usr/local/bin/seron
chmod +x /usr/local/bin/seron
```

## Requirements 📋

- **Node.js 16+** (required)
- **NPM or Yarn** (for installation)
- **Internet connection** (for cloud AI providers)
- **Terminal/Command Prompt** (obviously)

### Check Your Node Version
```bash
node --version  # Should be 16.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

## Post-Installation Setup 🛠️

### 1. Run Setup Wizard
```bash
seron setup
```
This interactive wizard will:
- Ask which AI providers you want to use
- Help you add your API keys
- Set your default model
- Test that everything works

### 2. Get API Keys

**OpenAI:**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create account and add payment method
3. Generate new API key
4. Copy and paste into Seron setup

**Anthropic (Claude):**
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Join waitlist or sign in
3. Go to API Keys section
4. Create new key

**HuggingFace (Free!):**
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token
4. No payment required!

**Ollama (Local, Free):**
1. Download from [ollama.ai](https://ollama.ai)
2. Install on your computer
3. Run `ollama serve`
4. Download models with `ollama pull llama3`

### 3. Test Everything
```bash
# See available models
seron models

# Start chatting
seron chat

# Try the universal code prompt
seron chat -s "universal-code"
```

## Troubleshooting 🔧

### Command Not Found
```bash
# If 'seron' command not found after global install:
npm list -g seron-cli  # Check if installed
npm link seron-cli     # Re-link if needed
```

### Permission Errors (Linux/Mac)
```bash
# If permission denied during global install:
sudo npm install -g seron-cli

# Or fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Windows PowerShell Execution Policy
```powershell
# If PowerShell blocks the command:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### API Key Issues
```bash
# Check your config
seron config

# Reset everything
rm -rf ~/.seron-cli
seron setup
```

## Updating Seron 🔄

### Update from NPM
```bash
npm update -g seron-cli
```

### Update from Source
```bash
git pull origin main
npm install
npm run build
```

## Uninstalling 🗑️

### Remove Global Installation
```bash
npm uninstall -g seron-cli
```

### Remove Config Files
```bash
# Remove all Seron data
rm -rf ~/.seron-cli
```

## Next Steps 🎯

After installation:

1. **Run the setup** - `seron setup`
2. **Try the universal code prompt** - `seron chat -s "universal-code"`
3. **Build something cool** - Ask it to create any app or script
4. **Join the community** - [GitHub Discussions](https://github.com/nexiloop/seron-cli/discussions)
5. **Share your projects** - Tag us @nexiloop

---

**Need help?** [Open an issue](https://github.com/nexiloop/seron-cli/issues) or ask Seron itself! 😄