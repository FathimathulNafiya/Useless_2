/**
 * DA Roast Bot - Interactive OpenAPI & API Documentation Route
 * Exposes Swagger/OpenAPI 3.0 JSON specification and a styled Interactive API Testing Console.
 */

const express = require('express');
const router = express.Router();

const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'DA Roast Bot API',
    version: '2.0.0',
    description: 'Interactive API specification for DA Roast Bot - Sarcastic AI College Friend & Educational Assistant.',
    contact: {
      name: 'DA Roast Bot Engineering Team',
      email: 'team@daroastbot.local'
    }
  },
  servers: [
    { url: '/api', description: 'Current Server Environment' }
  ],
  paths: {
    '/chat': {
      post: {
        summary: 'Send a message to the AI Roast Bot',
        description: 'Sends a user message, maintains context history, and returns a humorous and factual reply.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'What is photosynthesis?' },
                  mode: { type: 'string', enum: ['friendly', 'normal', 'savage', 'professor', 'procrastinator'], default: 'normal' },
                  conversationId: { type: 'string', example: 'convo_12345678_abcd' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Successful response with bot reply' },
          400: { description: 'Validation error (blank message or too long)' }
        }
      }
    },
    '/chat/stream': {
      post: {
        summary: 'Stream chat response via Server-Sent Events (SSE)',
        description: 'Streams AI tokens in real-time using text/event-stream.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'Explain quicksort in simple terms.' },
                  mode: { type: 'string', enum: ['friendly', 'normal', 'savage', 'professor', 'procrastinator'], default: 'normal' },
                  conversationId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'SSE Event Stream with tokens' }
        }
      }
    },
    '/roast/random': {
      get: {
        summary: 'Get an instant random college roast',
        parameters: [
          { name: 'mode', in: 'query', schema: { type: 'string', enum: ['friendly', 'normal', 'savage', 'professor', 'procrastinator'] } }
        ],
        responses: {
          200: { description: 'Random roast string returned' }
        }
      }
    },
    '/roast/code': {
      post: {
        summary: 'Roast a code snippet and diagnose issues',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code'],
                properties: {
                  code: { type: 'string', example: 'var x = eval("2+2");' },
                  language: { type: 'string', default: 'javascript' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Critique, diagnosis, and letter grade' }
        }
      }
    },
    '/roast/battle': {
      post: {
        summary: 'Challenge the AI in a roast battle',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roast'],
                properties: {
                  roast: { type: 'string', example: 'You have fewer stars than a 1-star Uber driver.' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Judged scores and AI counter-attack' }
        }
      }
    },
    '/health': {
      get: {
        summary: 'System health, memory, and database diagnostics',
        responses: {
          200: { description: 'Server operational metrics' }
        }
      }
    }
  }
};

// JSON Schema Endpoint
router.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(OPENAPI_SPEC);
});

// Interactive HTML Documentation Page
router.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DA Roast Bot | Interactive API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card: #151d30;
      --border: #23314f;
      --primary: #8b5cf6;
      --accent: #06b6d4;
      --rose: #f43f5e;
      --green: #10b981;
      --text: #f8fafc;
      --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 30px 20px;
      line-height: 1.6;
    }
    .container { max-width: 960px; margin: 0 auto; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    h1 { font-size: 2rem; font-weight: 800; background: linear-gradient(90deg, #fff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid var(--primary);
      color: #c4b5fd;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .nav-links a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      margin-left: 15px;
      font-size: 0.9rem;
    }
    .endpoint-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .endpoint-header {
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid var(--border);
    }
    .method {
      padding: 4px 10px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 0.85rem;
    }
    .method-POST { background: #1d4ed8; color: #bfdbfe; }
    .method-GET { background: #047857; color: #a7f3d0; }
    .path { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 1rem; color: #e2e8f0; }
    .desc { color: var(--muted); font-size: 0.9rem; margin-left: auto; }
    .endpoint-body { padding: 20px; }
    pre {
      background: #060911;
      padding: 14px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: #38bdf8;
      margin: 10px 0;
      border: 1px solid #1e293b;
    }
    .btn-test {
      background: linear-gradient(135deg, var(--primary), #6366f1);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
    }
    .btn-test:hover { opacity: 0.9; }
    .test-result { margin-top: 15px; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>DA ROAST BOT API</h1>
        <p style="color: var(--muted); font-size: 0.95rem;">Interactive OpenAPI 3.0 Documentation & Live Testing Sandbox</p>
      </div>
      <div>
        <span class="badge">v2.0 • REST & SSE</span>
        <span class="nav-links">
          <a href="/api/docs/openapi.json" target="_blank">View OpenAPI JSON</a>
          <a href="/">Open App</a>
        </span>
      </div>
    </header>

    <!-- Chat Endpoint -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="method method-POST">POST</span>
        <span class="path">/api/chat</span>
        <span class="desc">Standard Conversational Response</span>
      </div>
      <div class="endpoint-body">
        <p>Send a message and receive useful information paired with a satirical roast.</p>
        <pre>curl -X POST http://localhost:5000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "What is photosynthesis?", "mode": "normal"}'</pre>
        <button class="btn-test" onclick="testChat()">Execute Live Test</button>
        <div id="chatResult" class="test-result"><pre><code id="chatResultCode"></code></pre></div>
      </div>
    </div>

    <!-- Random Roast Endpoint -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="method method-GET">GET</span>
        <span class="path">/api/roast/random</span>
        <span class="desc">Instant Categorized Roast</span>
      </div>
      <div class="endpoint-body">
        <p>Fetch a random burn. Query parameter <code>mode</code> supports: <code>friendly</code>, <code>normal</code>, <code>savage</code>, <code>professor</code>, <code>procrastinator</code>.</p>
        <pre>curl http://localhost:5000/api/roast/random?mode=savage</pre>
        <button class="btn-test" onclick="testRoast()">Fetch Random Roast</button>
        <div id="roastResult" class="test-result"><pre><code id="roastResultCode"></code></pre></div>
      </div>
    </div>

    <!-- Code Roaster Endpoint -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="method method-POST">POST</span>
        <span class="path">/api/roast/code</span>
        <span class="desc">Code Roast & Bug Diagnosis</span>
      </div>
      <div class="endpoint-body">
        <p>Evaluates bad coding patterns, scope leaks, and asymptotic complexity with comedic critique.</p>
        <pre>curl -X POST http://localhost:5000/api/roast/code \\
  -H "Content-Type: application/json" \\
  -d '{"code": "var x = eval(input);", "language": "javascript"}'</pre>
        <button class="btn-test" onclick="testCodeRoast()">Roast Bad Code</button>
        <div id="codeResult" class="test-result"><pre><code id="codeResultCode"></code></pre></div>
      </div>
    </div>

    <!-- Roast Battle Endpoint -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="method method-POST">POST</span>
        <span class="path">/api/roast/battle</span>
        <span class="desc">Roast Battle Arena</span>
      </div>
      <div class="endpoint-body">
        <p>Challenge the AI. Scores humor, originality, and severity, then fires back.</p>
        <pre>curl -X POST http://localhost:5000/api/roast/battle \\
  -H "Content-Type: application/json" \\
  -d '{"roast": "You are like a WiFi router with zero signal."}'</pre>
        <button class="btn-test" onclick="testBattle()">Enter Roast Battle</button>
        <div id="battleResult" class="test-result"><pre><code id="battleResultCode"></code></pre></div>
      </div>
    </div>

    <!-- Health Endpoint -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <span class="method method-GET">GET</span>
        <span class="path">/api/health</span>
        <span class="desc">System Diagnostics & Telemetry</span>
      </div>
      <div class="endpoint-body">
        <p>Returns server memory usage, database statistics, AI status, and uptime.</p>
        <button class="btn-test" onclick="testHealth()">Check Health</button>
        <div id="healthResult" class="test-result"><pre><code id="healthResultCode"></code></pre></div>
      </div>
    </div>
  </div>

  <script>
    async function testChat() {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is 2 + 2?', mode: 'normal' })
      });
      const data = await res.json();
      document.getElementById('chatResultCode').textContent = JSON.stringify(data, null, 2);
      document.getElementById('chatResult').style.display = 'block';
    }

    async function testRoast() {
      const res = await fetch('/api/roast/random?mode=savage');
      const data = await res.json();
      document.getElementById('roastResultCode').textContent = JSON.stringify(data, null, 2);
      document.getElementById('roastResult').style.display = 'block';
    }

    async function testCodeRoast() {
      const res = await fetch('/api/roast/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'var data = eval(userInput);', language: 'javascript' })
      });
      const data = await res.json();
      document.getElementById('codeResultCode').textContent = JSON.stringify(data, null, 2);
      document.getElementById('codeResult').style.display = 'block';
    }

    async function testBattle() {
      const res = await fetch('/api/roast/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roast: 'You have more bugs than an abandoned kitchen.' })
      });
      const data = await res.json();
      document.getElementById('battleResultCode').textContent = JSON.stringify(data, null, 2);
      document.getElementById('battleResult').style.display = 'block';
    }

    async function testHealth() {
      const res = await fetch('/api/health');
      const data = await res.json();
      document.getElementById('healthResultCode').textContent = JSON.stringify(data, null, 2);
      document.getElementById('healthResult').style.display = 'block';
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
