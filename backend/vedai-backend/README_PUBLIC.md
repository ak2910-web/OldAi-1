# VedAI Backend - Multi-Key Rotation System

> **Enterprise-grade API key management with automatic failover**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Firebase Functions](https://img.shields.io/badge/Firebase-Functions-orange)](https://firebase.google.com/docs/functions)

## 🎯 What This Solves

When building AI-powered applications with API rate limits, you face:
- ❌ 429 errors that block your entire service
- ❌ Long delays while waiting for quota resets
- ❌ Poor user experience during development

This system provides:
- ✅ **Automatic failover** between multiple API keys
- ✅ **Zero downtime** when quotas are exceeded
- ✅ **Smart cooldown** tracking per key
- ✅ **Graceful degradation** when all keys exhausted

---

## 📊 Performance

| Metric | Before | After |
|--------|--------|-------|
| Response time | 20-23s | 3-6s |
| 429 handling | Exponential backoff | Instant key switch |
| Quota exhaustion | Service failure | Graceful error |

---

## 🚀 Quick Start

### 1. Setup Environment

Create `functions/.env`:

\`\`\`env
# Primary API Key
GEMINI_API_KEY=your_primary_key_here

# Additional keys for rotation (optional but recommended)
GEMINI_API_KEY_2=your_second_key_here
GEMINI_API_KEY_3=your_third_key_here
\`\`\`

### 2. Install Dependencies

\`\`\`bash
cd functions
npm install
\`\`\`

### 3. Run Emulator

\`\`\`bash
firebase emulators:start
\`\`\`

**That's it!** The system automatically:
- Loads all available keys
- Rotates between them on 429 errors
- Tracks health per key

---

## 🏗️ Architecture

### Key Rotation Logic

\`\`\`javascript
// Simplified flow
function getNextApiKey() {
  // 1. Check which keys are available (not in cooldown)
  // 2. Use round-robin selection
  // 3. Track usage stats
  return availableKey;
}

// On 429 error:
if (response.status === 429) {
  cooldown(currentKey, 2minutes);
  currentKey = getNextApiKey();  // Switch immediately
  retry();  // No delay
}
\`\`\`

### Graceful Degradation

\`\`\`javascript
// Before any API call
if (allKeysExhausted()) {
  return {
    error: "QUOTA_EXHAUSTED",
    message: "AI temporarily at capacity. Try again in 2 minutes.",
    retryAfter: 120
  };
}
\`\`\`

This prevents quota spirals and protects your remaining quotas.

---

## 📁 Project Structure

\`\`\`
functions/
├── src/
│   ├── config/
│   │   ├── env.js                    # Main configuration
│   │   └── env.optimized.js          # Environment-aware config
│   ├── services/
│   │   └── geminiService.js          # Key rotation logic
│   ├── engines/
│   │   ├── templateEngine.js         # Standard prompts
│   │   ├── templateEngine.optimized.js  # Compact prompts (60% smaller)
│   │   └── conceptBypass.js          # Instant theory responses
│   └── api/
│       └── answerQuestion.js         # Main endpoint
├── .env                              # API keys (DO NOT COMMIT)
└── package.json
\`\`\`

---

## 🔍 Monitoring

Check system health via `/listModels` endpoint:

\`\`\`bash
curl http://localhost:5005/YOUR_PROJECT/us-central1/listModels
\`\`\`

Response includes:
\`\`\`json
{
  "statistics": {
    "apiKeyHealth": [
      {
        "keyId": "AIzaSy...truncated",
        "usage": 15,
        "success": 15,
        "failure": 0,
        "inCooldown": false,
        "successRate": 100
      }
    ],
    "totalKeysAvailable": 3
  }
}
\`\`\`

---

## 🎓 How It Works

### 1. Multi-Key Loading
System automatically loads all keys from environment:
\`\`\`javascript
const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);  // Remove undefined
\`\`\`

### 2. Smart Selection
Round-robin with cooldown awareness:
- Skips keys in cooldown
- Tracks success/failure rates
- Prioritizes healthy keys

### 3. Instant Failover
On 429 error:
- Mark key as exhausted (2-min cooldown)
- Switch to next available key
- Retry immediately (no delay)

### 4. Safety Checks
- ENV validation (removes undefined keys)
- Health check before API calls
- Graceful error messages

---

## ⚙️ Configuration

### Emulator vs Production

The system auto-detects environment:

**Emulator** (fast development):
- 1 retry attempt
- 0ms delays
- Verbose logging
- No throttling

**Production** (safe & reliable):
- 3 retry attempts
- Exponential backoff
- Minimal logging
- 1.5s throttling

Set via environment variable:
\`\`\`bash
FUNCTIONS_EMULATOR=true  # Auto-set by Firebase
\`\`\`

---

## 🔬 Optimizations

### 1. Token Usage Reduction (60%)

**Before:**
\`\`\`javascript
// Verbose prompt with detailed instructions
"You are VedAI, an advanced system that bridges ancient Vedic mathematical wisdom with modern scientific frameworks. Please provide a comprehensive analysis..."
// ~1800 tokens
\`\`\`

**After:**
\`\`\`javascript
// Compact prompt with clear structure
"Answer: [question]\\nFormat: Markdown\\n\\n## Concept\\n[1 line]\\n\\n## Steps\\n1. [calc]\\n2. [result]"
// ~600 tokens
\`\`\`

### 2. Concept Bypass (0ms responses)

For pure theory questions:
- Check knowledge base first
- Return instant response (no AI call)
- 0ms latency, 0 tokens used

Examples:
- "What is Nikhilam sutra?"
- "Define Pythagorean theorem"
- "Explain quadratic formula"

---

## 📈 Performance Metrics

| Operation | Time | Tokens |
|-----------|------|--------|
| Concept bypass (theory) | <100ms | 0 |
| Cached response | 50-150ms | 0 |
| Standard AI (optimized) | 3-6s | ~600 |
| Standard AI (verbose) | 6-10s | ~1800 |

---

## 🔒 Security Best Practices

### DO NOT:
- ❌ Commit `.env` file to Git
- ❌ Expose API keys in logs
- ❌ Share keys publicly

### DO:
- ✅ Use environment variables
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate keys periodically
- ✅ Use different keys per environment

### `.gitignore` template:
\`\`\`gitignore
# Environment variables
.env
.env.local
.env.*.local

# Firebase
.firebase/
*-debug.log

# Node
node_modules/
npm-debug.log
\`\`\`

---

## 🛠️ Troubleshooting

### Keys not rotating?
1. Check `.env` file exists in `functions/` folder
2. Verify keys are uncommented
3. Restart emulator
4. Check logs for "Multi-key rotation enabled"

### Still getting 429 errors?
- All keys might be exhausted
- Wait 2 minutes for cooldown
- Add more keys or upgrade to paid tier

### Responses slow in emulator?
- Check if using optimized templates
- Enable concept bypass
- Verify emulator mode is active

---

## 📝 Example Usage

\`\`\`javascript
// API call with automatic key rotation
const response = await fetch(
  'http://localhost:5005/PROJECT/us-central1/answerQuestion',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: "What is Nikhilam multiplication?",
      language: "English"
    })
  }
);

const data = await response.json();
// {
//   answer: "...",
//   cached: false,
//   bypassUsed: true,  // Instant response!
//   processingTime: 0,
//   tokenCount: 0
// }
\`\`\`

---

## 🤝 Contributing

This is an educational/research project. Feel free to:
- Fork and experiment
- Report issues
- Suggest improvements

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 🎓 Learn More

**Key Concepts Demonstrated:**
- API rate limit management
- Graceful degradation patterns
- Environment-aware configuration
- Performance optimization strategies

**Technologies Used:**
- Node.js / Firebase Functions
- Google Generative AI (Gemini)
- Environment-based config management

---

## 📧 Questions?

This system demonstrates enterprise-grade API management patterns.
Perfect for learning about:
- Rate limit handling
- Multi-key rotation
- Failover strategies
- Performance optimization

**Built with ❤️ for the developer community**
