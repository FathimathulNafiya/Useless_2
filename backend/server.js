/**
 * DA Roast Bot - Main Server (v2.0 Standard Edition)
 * Express Server initialization, security middlewares, request tracing,
 * structured logging, REST & SSE streaming routes, and static asset serving.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Middlewares
const requestIdMiddleware = require('./middleware/requestId');
const httpLogger = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const chatRoutes = require('./routes/chatRoutes');
const roastRoutes = require('./routes/roastRoutes');
const docsRoutes = require('./routes/docsRoutes');

// Services & Config
const db = require('./config/db');
const aiService = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Trust proxy if behind reverse proxy (NGINX, Vercel, Railway, Heroku)
app.set('trust proxy', 1);

// 2. Request Identification & Tracing
app.use(requestIdMiddleware);

// 3. Security & Parser Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id']
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Structured HTTP Logging
app.use(httpLogger);

// 5. Rate Limiting: 180 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Take a chill pill and come back in a few minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api/', apiLimiter);

// 6. Mount API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/roast', roastRoutes);
app.use('/api/docs', docsRoutes);

// 7. System Health & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  const stats = db.getStats();
  const aiStatus = aiService.getStatus();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'online',
    app: 'DA Roast Bot',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
    },
    database: stats,
    ai: aiStatus,
    requestId: req.id,
  });
});

// 8. Telemetry & Analytics Endpoint
app.get('/api/analytics', (req, res) => {
  const analytics = db.getAnalytics();
  res.status(200).json({
    success: true,
    analytics,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

// 9. Serve Frontend Static Assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 10. SPA Fallback & 404 Handlers
app.use(notFoundHandler);

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 11. Centralized Error Handler
app.use(errorHandler);

// 12. Start Server with Graceful Shutdown
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🔥 DA ROAST BOT v2.0 Server is running on port ${PORT}`);
    console.log(`🚀 Access Web App : http://localhost:${PORT}`);
    console.log(`📚 Interactive Docs: http://localhost:${PORT}/api/docs`);
    console.log(`🧠 AI Status      : ${aiService.getStatus().openaiConfigured ? 'OpenAI Live' : 'Smart Heuristic Fallback'}`);
    console.log(`⚙️  Environment    : ${process.env.NODE_ENV || 'development'}`);
    console.log('====================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [PORT IN USE] Port ${PORT} is already in use by another process.`);
      console.error(`👉 Quick fix: Stop the existing process or set PORT=5001 in backend/.env\n`);
      process.exit(1);
    } else {
      console.error('[Server Error]:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  const handleShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] Closed remaining active connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

module.exports = app;
