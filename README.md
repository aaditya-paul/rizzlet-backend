# Rizzlet Backend API

AI-powered texting copilot backend service with decoupled architecture.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Groq API key ([Get one here](https://console.groq.com))

### Installation

1. **Clone and install dependencies:**

```bash
cd rizzlet-backend
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Create database and run schema:**

```bash
# Create database
createdb rizzlet

# Run schema
psql -d rizzlet -f schema.sql
```

4. **Start development server:**

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 📝 Environment Variables

| Variable                | Description                   | Required           |
| ----------------------- | ----------------------------- | ------------------ |
| `PORT`                  | Server port                   | No (default: 5000) |
| `DATABASE_URL`          | PostgreSQL connection string  | Yes                |
| `JWT_SECRET`            | Secret for JWT signing        | Yes                |
| `GROQ_API_KEY`          | Groq API key for Llama models | Yes                |
| `GOOGLE_VISION_API_KEY` | Google Vision API (optional)  | No                 |

## 🔌 API Endpoints

### Authentication

**Register**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Reply Generation

**Generate Replies**

```http
POST /api/replies/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "conversation": {
    "messages": [
      { "sender": "other", "text": "Hey! How's your weekend going?" },
      { "sender": "user", "text": "Pretty good! Just relaxing" }
    ],
    "platform": "tinder"
  },
  "tone": "playful",
  "count": 3
}
```

**Response:**

```json
{
  "replies": [
    {
      "text": "Nice! Same here, finally getting some chill time. What are you up to?",
      "tone": "playful",
      "confidence": 0.8
    }
    // ... more replies
  ],
  "context_analysis": {
    "engagement_level": "high",
    "recommended_tone": "playful",
    "notes": "Good conversation flow"
  }
}
```

### Usage Stats

**Get Usage Statistics**

```http
GET /api/usage/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🤖 AI Model Configuration

Rizzlet uses **Llama 3.1** models via Groq:

- **Primary**: `llama-3.1-8b-instant` - Fast, cost-efficient for most requests
- **Fallback**: `llama-3.1-70b-versatile` - Complex queries, summaries, heavy reasoning

## 🎯 Tone Modes

| Tone      | Description                    | Use Case                          |
| --------- | ------------------------------ | --------------------------------- |
| `safe`    | Friendly, respectful, low-risk | Early conversations, professional |
| `playful` | Fun, light-hearted humor       | Building rapport                  |
| `flirty`  | Confident, romantic interest   | Dating, showing interest          |
| `bold`    | Direct, assertive, high-reward | Making moves, escalation          |

## 🔧 Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test
```

## 📦 Project Structure

```
rizzlet-backend/
├── src/
│   ├── config/          # Configuration and environment
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # TypeScript types
│   ├── prompts/         # LLM prompt templates
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── index.ts         # Server entry point
├── schema.sql           # Database schema
├── package.json
└── tsconfig.json
```

## 🔐 Security

- JWT-based authentication
- Rate limiting on all endpoints
- Stricter limits on AI endpoints
- Request validation with Zod
- Helmet.js security headers
- CORS protection

## 📊 Usage Limits

Free tier limits:

- **Daily**: 50 requests
- **Monthly**: 1000 requests

## 🌐 Integration Guide

This backend can be integrated into any project:

```typescript
// Example integration
const response = await fetch("http://localhost:5000/api/replies/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    conversation: {
      messages: [
        { sender: "other", text: "Hey!" },
        { sender: "user", text: "Hi there!" },
      ],
    },
    tone: "playful",
    count: 3,
  }),
});

const { replies } = await response.json();
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.
