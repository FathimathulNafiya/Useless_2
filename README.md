# DA ROAST BOT v2.0 🔥
> **Final-Year B.Tech Computer Science & Engineering Capstone Project**  
> *"Ask anything. Regret everything."*

[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v4.21+-blue.svg)](https://expressjs.com/)
[![OpenAPI Specification](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](http://localhost:5000/api/docs)
[![Tests](https://img.shields.io/badge/tests-20%2F20%20passing%20(100%25)-success.svg)](test_suite.js)
[![Docker Ready](https://img.shields.io/badge/docker-ready-2496ED.svg)](Dockerfile)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Project Overview

**DA Roast Bot v2.0** is an enterprise-standard, full-stack conversational AI web platform that fuses educational utility with comedic personality. Designed to simulate the sharp wit, dry sarcasm, and relatable banter of a college engineering peer, the application delivers accurate, high-utility technical explanations wrapped inside humorous reality checks about college life, deadlines, exams, and late-night debugging.

Unlike conventional sterile chatbots, DA Roast Bot operates on the core design formula:  
$$\text{Useful Information} + \text{Humorous Roast} = \text{Memorable Learning}$$

### Example Interaction
* **User:** *"What is photosynthesis?"*
* **DA Roast Bot:** *"Plants basically use sunlight, water, and $\text{CO}_2$ to cook their own food. Meanwhile, you need a 15-minute tutorial and moral support to boil water. (In short: $6\text{CO}_2 + 6\text{H}_2\text{O} + \text{light} \rightarrow \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2$)."*

---

## 2. Key Features & Capabilities

### 🎭 5 Distinct Roast Personas & Intensities
- 😇 **Friendly:** Gentle teasing, warm college banter, and encouraging peer humor.
- 😏 **Normal (Default):** Classic deadpan sarcasm, witty reality checks, and college slang.
- 💀 **Savage:** Razor-sharp comedic roasts and maximum burns (strictly safe and non-abusive).
- 👨‍🏫 **Professor (Viva Voce Examiner):** Intimidating academic interrogation, demands IEEE citations, and roasts preparation habits before giving textbook explanations.
- 🥱 **Slacker (Chronic Procrastinator):** Sleep-deprived senior who rationalizes bad study habits before delivering the answer.

### ⚡ Real-Time Server-Sent Events (SSE) Streaming
- Live character-by-character and word-by-word token streaming via `POST /api/chat/stream`.
- Real-time typewriter effect in the browser with automatic downward scrolling.
- Zero-latency simulated streaming fallback for offline mode.

### 💻 Built-In "Roast My Code" Tool
- Static analysis & satirical code review via `POST /api/roast/code`.
- Detects antipatterns (`eval()`, `var` scope leakage, empty catch blocks, $O(n^2)$ nested loops).
- Assigns a letter grade (e.g. `F+`), delivers a brutal critique, and outputs technical refactoring advice.

### 🥊 Roast Battle Arena
- Interactive user challenge arena via `POST /api/roast/battle`.
- The bot analyzes user roasts across three categories: **Humor (1-10)**, **Originality (1-10)**, and **Burn Severity (1-10)**.
- Computes overall match percentage, issues an official verdict, and fires back an AI retort.

### 📚 Interactive OpenAPI 3.0 Documentation
- Live interactive sandbox at `http://localhost:5000/api/docs`.
- Built-in "Execute Live Test" consoles for every endpoint.
- Raw OpenAPI 3.0 JSON specification served at `/api/docs/openapi.json`.

### 🎙️ Web Speech API & Synthesized Audio FX
- **Voice-to-Text:** Hands-free speech recognition with microphone pulse animation.
- **Speech Synthesis (TTS):** Reads bot responses aloud with adjustable voice rate and pitch.
- **Web Audio FX:** Synthesizes futuristic chime sounds for send, receive, roast, and battle events with a 1-click header mute toggle.

### 🎨 4 Cyber Themes & Glassmorphic UI
- **Cyber Violet (Default):** Deep dark glassmorphism with purple and cyan ambient glows.
- **Matrix Green:** Obsidian terminal with green phosphor luminescence.
- **Sunset Cyberpunk:** High-contrast magenta and amber neon.
- **Midnight OLED:** True pure black with icy blue accents for OLED screens.

### 📤 1-Click Conversation Export
- Export chat transcripts instantly in **Markdown (`.md`)**, **JSON (`.json`)**, or **Plain Text (`.txt`)**.

### 🛡️ Enterprise-Grade Resilience & Security
- Request tracing with unique `X-Request-Id` UUID headers.
- Structured ANSI-colored HTTP request logger with latency in milliseconds.
- Sliding-window rate limiter (180 requests / 15 minutes).
- Guardrails against hate speech, harassment, and toxic abuse built into system prompts.
- Multi-stage Alpine Docker containerization running under an unprivileged `appuser`.

---

## 3. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | HTML5, CSS3 (Custom Glassmorphism, CSS Variables, Animations), Vanilla JavaScript (ES6+), Web Speech API, Web Audio API |
| **Backend** | Node.js (v18+), Express.js (v4.21+), Server-Sent Events (SSE) |
| **AI Integration** | Official OpenAI JavaScript SDK (`openai` v4.x, `gpt-4o-mini`), Resilient College Heuristic Fallback Engine |
| **Documentation** | OpenAPI 3.0.3, Interactive Testing Dashboard (`/api/docs`) |
| **Persistence** | High-performance in-memory repository abstracted for MongoDB / SQLite |
| **DevOps & Standards** | Docker (Multi-stage Alpine), Docker Compose, GitHub Actions CI, Prettier, EditorConfig |
| **Security & Middleware** | `cors`, `dotenv`, `express-rate-limit`, `crypto` |

---

## 4. System Architecture & Directory Structure

```text
DA-ROAST-BOT-v2.0/
├── backend/
│   ├── server.js               # Express application entry, middleware & static routing
│   ├── package.json            # Backend dependencies and scripts
│   ├── .env.example            # Template for environment configuration
│   ├── config/
│   │   └── db.js               # In-memory storage layer & telemetry tracker
│   ├── middleware/
│   │   ├── requestId.js        # X-Request-Id header injector for tracing
│   │   ├── logger.js           # Structured ANSI HTTP logger with latency
│   │   └── errorHandler.js     # Centralized AppError & error handler
│   ├── routes/
│   │   ├── chatRoutes.js       # Routes for chat, streaming, and clear
│   │   ├── roastRoutes.js      # Routes for random roasts, code roaster, and battle
│   │   └── docsRoutes.js       # Interactive OpenAPI 3.0 documentation
│   ├── controllers/
│   │   ├── chatController.js   # Chat messaging, SSE streaming & session persistence
│   │   └── roastController.js  # Roasts, code review & battle arbitration
│   └── services/
│       ├── aiService.js        # OpenAI client, 5 persona prompts & streaming
│       └── roastService.js     # Curated joke pool, code roaster & battle heuristics
│
├── frontend/
│   ├── index.html              # Modern glassmorphism SPA layout
│   ├── css/
│   │   └── style.css           # 4-theme styling, animations, code blocks & modals
│   └── js/
│       └── app.js              # State manager, SSE receiver, audio synth & tools
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Automated GitHub Actions testing workflow
├── Dockerfile                  # Production-ready multi-stage container
├── docker-compose.yml          # Single-command Docker deployment
├── .editorconfig               # Universal cross-IDE formatting standards
├── .prettierrc                 # Code styling rules
├── .gitignore                  # Git exclusions
├── package.json                # Master automation scripts
├── test_suite.js               # Comprehensive 20-test integration runner
├── ARCHITECTURE.md             # Detailed system architecture document
├── CONTRIBUTING.md             # Contribution guidelines & coding standards
└── README.md                   # Complete project documentation
```

---

## 5. API Reference & Endpoints

### 1. Chat Endpoints

#### Send Message
* **Endpoint:** `POST /api/chat`
* **Request:**
  ```bash
  curl -X POST http://localhost:5000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "What is 2 + 2?", "mode": "normal"}'
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "reply": "4. Shocking, I know. You survived another mathematical challenge.",
    "conversationId": "convo_1789145066840_606fac5b",
    "mode": "normal",
    "timestamp": "2026-09-11T18:00:00.000Z",
    "requestId": "61a9bb9a-4c28-4ad0-85aa-b8c2d829391b"
  }
  ```

#### Real-Time SSE Token Stream
* **Endpoint:** `POST /api/chat/stream`
* **Headers:** `Accept: text/event-stream`
* **Events:**
  - `data: {"type":"start", "conversationId":"...", "mode":"normal"}`
  - `data: {"type":"chunk", "chunk":"token "}`
  - `data: {"type":"done", "reply":"Full response"}`

#### Clear Session Memory
* **Endpoint:** `POST /api/chat/clear`
* **Request:** `{"conversationId": "convo_1234"}`

---

### 2. Roast Endpoints

#### Get Random Roast
* **Endpoint:** `GET /api/roast/random?mode=savage`
* **Modes Supported:** `friendly`, `normal`, `savage`, `professor`, `procrastinator`

#### Roast My Code
* **Endpoint:** `POST /api/roast/code`
* **Request:**
  ```json
  {
    "code": "var x = eval('2+2'); for(var i=0; i<10; i++) { for(var j=0; j<10; j++) {} }",
    "language": "javascript"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "language": "javascript",
    "lineCount": 1,
    "grade": "F",
    "burn": "Using eval()? Did you travel forward in time from 1996?",
    "diagnosis": "High security vulnerability. Avoid eval() for arbitrary execution.",
    "recommendation": "Refactor with semantic identifiers and modern ES6 syntax."
  }
  ```

#### Roast Battle Arena
* **Endpoint:** `POST /api/roast/battle`
* **Request:**
  ```json
  {
    "roast": "You have fewer stars than a 1-star microwave."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "humorScore": 7,
    "originalityScore": 8,
    "burnSeverity": 8,
    "totalScore": 77,
    "verdict": "Honorable Stalemate",
    "counterRoast": "I respect the audacity, but my error logs have delivered more emotional devastation than that."
  }
  ```

---

### 3. Diagnostics & Telemetry

* `GET /api/health` — System uptime, Node.js version, platform, memory heap in MB, database stats.
* `GET /api/analytics` — Message counter, mode distribution frequencies, and roasts served.
* `GET /api/docs/openapi.json` — Complete OpenAPI 3.0.3 specification.

---

## 6. Getting Started

### Local Installation

1. **Clone or open the repository:**
   ```bash
   cd useless2.0
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables (Optional):**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Add your `OPENAI_API_KEY` if you want cloud inference. Otherwise, the resilient college friend heuristic engine runs seamlessly out of the box.

4. **Start the Application:**
   ```bash
   npm run dev
   # or
   npm start
   ```
   Open `http://localhost:5000` in any modern web browser.

---

### Running with Docker

Single-command containerized deployment:

```bash
docker compose up --build
```

Access the application at `http://localhost:5000` and interactive docs at `http://localhost:5000/api/docs`.

---

## 7. Automated Testing Suite

DA Roast Bot includes a comprehensive end-to-end integration test runner testing every route, status code, error boundary, and stream.

Run the test suite:
```bash
npm test
```

Expected Output:
```text
====================================================
🧪 RUNNING DA ROAST BOT v2.0 INTEGRATION TEST SUITE
====================================================

✅ [PASS] GET /api/health returns 200 & v2.0.0 status
✅ [PASS] X-Request-Id header is present on responses
✅ [PASS] GET /api/roast/random returns a roast
✅ [PASS] GET /api/roast/random?mode=savage respects mode query
✅ [PASS] GET /api/roast/random?mode=professor handles Professor persona
✅ [PASS] GET /api/roast/stats returns comprehensive 5-mode roast pool
✅ [PASS] POST /api/chat (Friendly mode) returns AI reply
✅ [PASS] POST /api/chat assigns a valid conversationId
✅ [PASS] POST /api/chat preserves conversationId across turns
✅ [PASS] POST /api/chat responds in procrastinator mode
✅ [PASS] GET /api/chat/history retrieves conversation turns
✅ [PASS] POST /api/chat/stream delivers valid SSE token stream
✅ [PASS] POST /api/roast/code analyzes code, returns burn and letter grade
✅ [PASS] POST /api/roast/battle scores user roast and counters
✅ [PASS] GET /api/analytics returns real-time telemetry metrics
✅ [PASS] GET /api/docs/openapi.json returns valid OpenAPI 3.0 specification
✅ [PASS] POST /api/chat returns 400 on empty message
✅ [PASS] POST /api/chat returns 400 on excessive length
✅ [PASS] POST /api/chat/clear wipes conversation memory
✅ [PASS] GET /api/unknown returns structured 404 JSON with error code

====================================================
📊 TEST RESULTS: 20/20 PASSED (100%)
====================================================
```

---

## 8. License

Distributed under the **MIT License**. Free for academic, personal, and commercial study.
