# VedAI Backend - Refactored Architecture

## 🏗️ **Architecture Overview**

This is a **production-ready, modular Firebase Cloud Functions backend** following enterprise best practices.

```
functions/
├── src/
│   ├── index.js                 # Main entry point - registers all endpoints
│   ├── config/                  # Configuration & initialization
│   │   ├── env.js              # Environment variables & constants
│   │   └── firebase.js         # Firebase Admin SDK setup
│   ├── middlewares/            # Request processing & security
│   │   ├── cors.js             # Cross-origin resource sharing
│   │   └── rateLimit.js        # IP-based rate limiting
│   ├── services/               # Business logic layer
│   │   ├── geminiService.js    # Google Generative AI integration
│   │   ├── cacheService.js     # Response caching with Firestore
│   │   └── analyticsService.js # Usage tracking & statistics
│   ├── engines/                # Domain-specific intelligence
│   │   ├── questionClassifier.js    # Rule-based question categorization
│   │   ├── templateEngine.js        # Dynamic prompt generation
│   │   ├── responseFormatter.js     # Output structuring
│   │   ├── vedicMappingEngine.js    # Vedic↔Modern mapping (patent-worthy)
│   │   └── mathEngine/              # Mathematical problem solving
│   ├── utils/                  # Helper functions
│   │   ├── validators.js       # Input validation & sanitization
│   │   └── promptTemplates.js  # Language-specific prompts
│   └── api/                    # HTTP endpoint handlers
│       ├── answerQuestion.js   # Main Q&A endpoint
│       ├── processImage.js     # Image analysis (Gemini Vision)
│       ├── getUserStats.js     # User quota tracking
│       ├── getRecentSearches.js # Search history
│       ├── saveConversation.js # Conversation persistence
│       └── listModels.js       # Available models
├── index.js                     # Legacy (kept for backwards compatibility)
└── package.json
```

---

## 📡 **API Endpoints**

### 1. **POST** `/answerQuestion`
Main Q&A endpoint using hybrid intelligence pipeline:
- **Layer 0**: Math Engine (deterministic solving)
- **Layer 1**: Question Classification (rule-based, 0ms)
- **Layer 2**: Template Selection (domain-specific prompts)
- **Layer 3**: AI Generation (Gemini with retry & rotation)
- **Layer 4**: Response Formatting (structured sections)

**Request:**
```json
{
  "question": "What is Nikhilam Sutra?",
  "language": "English",
  "userId": "user123"
}
```

**Response:**
```json
{
  "answer": "formatted markdown text",
  "sections": {
    "vedic_principle": "...",
    "modern_scientific_equivalent": "...",
    "formula_algorithm_equivalence": "..."
  },
  "questionType": "vedic",
  "processingTime": 1234,
  "cached": false,
  "vedicMapping": { ... },
  "mathematicalSolution": { ... }
}
```

### 2. **POST** `/processImage`
Image analysis with Gemini Vision API

**Request:**
```json
{
  "base64Image": "base64_encoded_image_data",
  "mimeType": "image/jpeg",
  "language": "English"
}
```

### 3. **GET/POST** `/getUserStats`
Get user quota and usage statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "queries": { "used": 10, "remaining": 90, "limit": 100 },
    "images": { "used": 2, "remaining": 18, "limit": 20 }
  }
}
```

### 4. **GET** `/getRecentSearches?limit=10`
Fetch recent search history

### 5. **POST** `/saveConversation`
Persist conversation to Firestore

### 6. **GET** `/listModels`
List available Gemini models

---

## 🔥 **Key Features**

### **1. Intelligent Model Rotation**
- **Round-robin selection** across 3 Gemini models
- **Automatic failover** on 429 (rate limit)
- **Performance tracking** with success/failure rates
- **Smart throttling** (1.5s between calls)

### **2. Multi-Layer Caching**
- **Response cache**: 24-hour TTL in Firestore
- **Cache key**: SHA-256 hash of question + language
- **Saves** ~90% of API calls for repeated queries

### **3. Hybrid Intelligence Pipeline**
```
Question → Math Engine → Classification → Vedic Mapping →
Template Selection → AI Generation → Formatting → Client
```

### **4. Rate Limiting**
- **IP-based**: 100 requests/minute per endpoint
- **User-based**: 100 queries + 20 images per day
- **Disabled in emulator** mode for development

### **5. Error Handling**
- **Exponential backoff**: 2s → 4s → 8s for retries
- **Graceful degradation**: Fail fast on 503 (overload)
- **Error logging**: All errors saved to Firestore
- **User-friendly messages**: Actionable error responses

---

## 🛠️ **Development**

### **Setup**
```bash
cd backend/vedai-backend/functions
npm install
```

### **Environment Variables**
Create `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
FUNCTIONS_EMULATOR=true   # For local testing
NODE_ENV=development
```

### **Run Locally**
```bash
npm run serve  # Start Firebase emulator
```

### **Deploy**
```bash
npm run deploy
```

---

## 🧪 **Testing**

### **Test Question Classification**
```bash
curl -X POST http://localhost:5001/.../answerQuestion \
  -H "Content-Type: application/json" \
  -d '{"question": "What is 123 × 456?", "language": "English"}'
```

### **Test Image Processing**
```bash
curl -X POST http://localhost:5001/.../processImage \
  -H "Content-Type: application/json" \
  -d '{"base64Image": "...", "mimeType": "image/jpeg"}'
```

---

## 📊 **Performance**

- **Classification**: ~0ms (rule-based, deterministic)
- **Cache hit**: ~50ms (Firestore read)
- **AI generation**: ~2-5s (Gemini API)
- **Total (cached)**: ~50ms
- **Total (uncached)**: ~2-5s

---

## 🔐 **Security**

- **Input validation**: XSS prevention, length limits
- **Rate limiting**: Per-IP and per-user
- **CORS**: Controlled origins (currently `*` for development)
- **Error sanitization**: No stack traces to clients
- **API key security**: Never logged or exposed

---

## 📈 **Monitoring**

All usage tracked in Firestore collections:
- `apiUsage` - Endpoint calls, timing, token counts
- `errorLogs` - Errors with stack traces
- `modelStats` - AI model performance metrics
- `searchHistory` - User queries (anonymized)

---

## 🎯 **Future Enhancements**

- [ ] Add authentication middleware
- [ ] Implement webhook callbacks
- [ ] Add streaming responses
- [ ] Support multi-turn conversations
- [ ] Add A/B testing for prompts
- [ ] Implement circuit breaker pattern
- [ ] Add Prometheus metrics export

---

## 📝 **Code Quality**

- ✅ **Modular** - Single responsibility principle
- ✅ **DRY** - No code duplication
- ✅ **Testable** - Pure functions, dependency injection
- ✅ **Documented** - JSDoc comments throughout
- ✅ **Consistent** - Uniform error handling
- ✅ **Scalable** - Easy to add new endpoints

---

## 🤝 **Contributing**

When adding new features:
1. Create focused modules in appropriate directories
2. Follow existing patterns (async/await, error handling)
3. Add JSDoc comments
4. Update this README
5. Test locally before deploying

---

## 📚 **Dependencies**

- `firebase-functions` - Cloud Functions runtime
- `firebase-admin` - Firestore, Auth
- `@google/generative-ai` - Gemini AI SDK
- `node-fetch` - HTTP client for API calls
- `dotenv` - Environment variable management

---

**Built with ❤️ for VedAI - Bridging Ancient Wisdom & Modern Science**
