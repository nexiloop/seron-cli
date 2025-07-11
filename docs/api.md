# API Documentation 🔌

*The developer's guide to Seron's internals (but make it fun)*

## Real Talk About How This Works 💯

So you want to know how Seron actually talks to all these AI providers? Cool, let me break it down without the corporate jargon.

## Chat Examples & API Flows 💬

### How a Real Chat Session Works

| Step | User Action | CLI Response | API Call | Result |
|------|-------------|-------------|----------|---------|
| 1 | `seron chat` | Shows banner & prompt | Config check | Chat session starts |
| 2 | `Hello there!` | Shows spinner | `POST /chat/completions` | Streaming response |
| 3 | `/model claude-3-5-sonnet-20241022` | Model switch message | Config update | Using new model |
| 4 | `Build me a todo app` | Streaming response | New API endpoint | Full React app code |
| 5 | `/exit` | Goodbye message | Session cleanup | CLI exits |

### API Request/Response Examples

**OpenAI Chat Request:**
```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "You are Seron..."},
    {"role": "user", "content": "Build me a React todo app"}
  ],
  "stream": true,
  "temperature": 0.7
}
```

**Anthropic Chat Request:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 200000,
  "system": "You are Seron...",
  "messages": [
    {"role": "user", "content": "Build me a React todo app"}
  ],
  "stream": true
}
```

### Provider Response Comparison

| Provider | Response Time | Streaming? | Cost/1K tokens | Best For |
|----------|---------------|------------|----------------|----------|
| **OpenAI GPT-4** | 2-5 seconds | ✅ Yes | ~$0.03 | General tasks |
| **Claude 3.5** | 1-3 seconds | ✅ Yes | ~$0.03 | Long conversations |
| **Grok** | 3-7 seconds | ✅ Yes | TBD | Unfiltered responses |
| **Ollama Local** | 1-10 seconds* | ✅ Yes | $0 | Privacy-first |
| **HuggingFace** | 5-15 seconds | ❌ No | Free/cheap | Experimentation |

*Depends on your hardware

## The Provider Squad 👥

### OpenAI - The OG 🤖
We use the official `openai` npm package because why reinvent the wheel?

**What we support:**
- All the GPT models (3.5, 4, 4o, whatever they drop next)
- Streaming (so you see responses live)
- Function calling (for when the AI needs to DO stuff)
- Vision (GPT-4o can literally see images)

**Getting your key:**
1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Make an account (they'll want your phone number)
3. Add some credits (it's pay-per-use)
4. Copy your API key
5. Run `seron setup` and paste it in

**Real costs:** Like $0.03 per 1K tokens for GPT-4. A long conversation might cost you a few cents.

### Anthropic - The Thoughtful One 🧠
Using their official SDK because they actually know their own API.

**What's good about Claude:**
- Huge context windows (200K tokens = like 150 pages)
- Really good at following instructions
- Less likely to hallucinate than some others
- Constitutional AI (it has morals, kinda)

**Getting your key:**
1. Hit up [console.anthropic.com](https://console.anthropic.com/)
2. They're picky about who gets access (waitlist vibes)
3. Once you're in, grab your API key
4. Pricing is similar to OpenAI

### xAI - The Unhinged One 🚀
This one's custom because Elon's API is... different. We use Axios to talk to their endpoints.

**Grok's whole vibe:**
- Unfiltered responses (it says what other AIs won't)
- Real-time data access (knows current events)
- Sarcastic and witty (personality for days)

**Getting access:**
Still rolling out, but when it's ready you'll sign up at [x.ai](https://x.ai)

### HuggingFace - The Community Choice 🤗
Using their `@huggingface/inference` package for the free models.

**Why it's cool:**
- Thousands of models to try
- Many are completely free
- Open source community vibes
- You can even upload your own models

**Getting started:**
1. Make a free account at [huggingface.co](https://huggingface.co)
2. Go to settings and create an access token
3. Most inference is free (with rate limits)

**Heads up:** No streaming support because that's just how HuggingFace works.

### Ollama - The Privacy King 🏠
This one's different - it runs AI models on YOUR computer.

**Why people love it:**
- Zero API costs (just your electricity)
- Complete privacy (data never leaves your machine)
- Works offline (no internet needed)
- Supports tons of open source models

**Getting it running:**
1. Download Ollama from [ollama.ai](https://ollama.ai)
2. Install it (works on Mac, Windows, Linux)
3. Run `ollama serve` to start the server
4. Download models with `ollama pull llama3`
5. That's it!

## How Streaming Actually Works 🌊

The magic behind real-time responses:

```typescript
// This is literally the code
for await (const chunk of aiProvider.stream()) {
  process.stdout.write(chunk); // Words appear as AI thinks
}
```

**Why streaming rocks:**
- No more staring at loading spinners
- Feels like talking to a real person
- You can stop reading if the AI goes off track
- Just more satisfying to use

**Providers that stream:**
- ✅ OpenAI (all models)
- ✅ Anthropic (all Claude models)  
- ✅ xAI (Grok models)
- ✅ Ollama (local models)
- ❌ HuggingFace (their limitation, not ours)

## Error Handling (When Stuff Breaks) 🚨

Real world = things break. Here's how we handle it:

**API key issues:**
```
❌ OpenAI client not initialized. Please set your API key.
```
Translation: You forgot to add your API key. Run `seron config`.

**Model not found:**
```
❌ Model gpt-5 not found
```
Translation: You typo'd the model name or it doesn't exist yet.

**Rate limits:**
We automatically retry with exponential backoff (fancy way of saying "wait a bit and try again").

**Internet issues:**
If your WiFi dies mid-conversation, Seron will tell you what happened instead of just hanging.

## Adding New Providers (For Developers) 🛠️

Want to add support for the next hot AI provider? Here's how:

### 1. Create the config
```typescript
// src/config/providers/new-provider.ts
export const newProviderConfig = {
  name: 'CoolAI',
  baseUrl: 'https://api.coolai.com',
  requiresApiKey: true,
  supportsStreaming: true,
  models: [
    {
      id: 'cool-model-1',
      name: 'Cool Model',
      maxTokens: 4096
    }
  ]
};
```

### 2. Add to the model list
```typescript
// src/services/ai-models.ts
export type ProviderType = 'openai' | 'anthropic' | 'ollama' | 'huggingface' | 'xai' | 'coolai';
```

### 3. Implement the chat method
```typescript
// src/services/ai-service.ts
private async chatWithCoolAI(messages: ChatMessage[], model: AIModel): Promise<ChatResponse> {
  // Your implementation here
  const response = await fetch(/* API call */);
  return { content: response.text, model: model.id };
}
```

### 4. Add streaming support
```typescript
private async *streamCoolAI(messages: ChatMessage[], model: AIModel): AsyncGenerator<string> {
  // Streaming implementation
  for await (const chunk of apiStream) {
    yield chunk.content;
  }
}
```

That's it! The CLI will automatically pick up your new provider.

## Performance Tips (Make It Fast) ⚡

**Model selection matters:**
- GPT-3.5 = fast and cheap
- GPT-4 = slower but smarter
- Local models = fast but need good hardware

**Context length strategy:**
- Shorter conversations = faster responses
- Don't keep huge histories unless you need them
- Clear chat history when starting new topics

**Network optimization:**
- Wired internet > WiFi for streaming
- Close other apps using bandwidth
- Consider geographic proximity to AI servers

## Security & Privacy (The Important Stuff) 🔒

**Where your data goes:**
- API keys: Stored locally in `~/.seron-cli/config.json`
- Conversations: Only sent to the AI provider you choose
- Usage data: We collect exactly zero telemetry

**File permissions:**
Your config file is set to user-only read/write (chmod 600 equivalent).

**Want maximum privacy?**
Use Ollama. Your conversations literally never leave your computer.

## Debugging When Things Go Wrong 🔍

Set this environment variable for full logging:
```bash
DEBUG=seron:* seron chat
```

You'll see:
- Every API request and response
- Authentication attempts
- Error details
- Network timing

It's like X-ray vision for your CLI.

## Rate Limits & Costs 💰

**OpenAI:**
- 3,500 requests per minute (usually)
- Costs vary by model
- They'll email you if you hit limits

**Anthropic:**
- Similar to OpenAI
- Better at long conversations
- Slightly different pricing

**xAI:**
- TBD (still new)
- Probably similar to others

**HuggingFace:**
- 1,000 requests per hour (free tier)
- Pay plans available
- Some models are always free

**Ollama:**
- No limits (it's your computer)
- No costs (except electricity)

## Common Issues & Fixes 🛠️

**"Command not found"**
```bash
npm link  # If you installed from source
npm install -g seron-cli  # If from npm
```

**Ollama won't connect**
```bash
ollama serve  # Start the server
ollama list   # Check what models you have
ollama pull llama3  # Download a model
```

**API keys not working**
```bash
seron config  # Check what's configured
```

**Streaming stops working**
Usually a network issue. Try switching models or providers.

## Contributing (Join the Fun) 🤝

Found a bug? Want a feature? Here's how to help:

1. **Fork** the repo on GitHub
2. **Clone** your fork locally
3. **Make** your changes
4. **Test** thoroughly (please!)
5. **Submit** a pull request

We review everything and give helpful feedback. No gatekeeping here.

---

*That's the technical rundown! Any questions? Ask Seron itself - it's pretty good at explaining its own architecture 😎*