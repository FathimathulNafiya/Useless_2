/**
 * DA Roast Bot - Chat Controller
 * Handles chat messaging, streaming via Server-Sent Events (SSE), history persistence, and clearing.
 */

const crypto = require('crypto');
const db = require('../config/db');
const aiService = require('../services/aiService');

const VALID_MODES = ['friendly', 'normal', 'savage', 'professor', 'procrastinator'];
const VALID_PERSONALITIES = [
  'college-friend',
  'strict-professor',
  'best-friend',
  'deadpan-ai',
  'savage-friend',
  'motivational-villain',
];
const MAX_MESSAGE_LENGTH = 2000;

function generateSessionId() {
  return 'convo_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
}

/**
 * Standard POST /api/chat
 */
async function handleChat(req, res) {
  try {
    const { message, mode = 'normal', conversationId, personality = 'college-friend' } = req.body;

    // 1. Validation: Message presence & type
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Sending blank messages now? Even your keyboard seems speechless. Type an actual question.',
        code: 'EMPTY_MESSAGE',
      });
    }

    // 2. Validation: Message length
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Whoa there, write a novel somewhere else. Keep it under ${MAX_MESSAGE_LENGTH} characters. My attention span is college-certified.`,
        code: 'MESSAGE_TOO_LONG',
      });
    }

    // 3. Validation: Mode & Personality sanitization
    const sanitizedMode = typeof mode === 'string' && VALID_MODES.includes(mode.toLowerCase())
      ? mode.toLowerCase()
      : 'normal';

    const sanitizedPersonality = typeof personality === 'string' && VALID_PERSONALITIES.includes(personality.toLowerCase())
      ? personality.toLowerCase()
      : 'college-friend';

    // 4. Session ID management
    const activeConvoId = (conversationId && typeof conversationId === 'string' && conversationId.trim() !== '')
      ? conversationId.trim()
      : generateSessionId();

    // 5. Store user message in history
    db.addMessage(activeConvoId, {
      role: 'user',
      content: trimmedMessage,
      mode: sanitizedMode,
      personality: sanitizedPersonality,
    });

    // 6. Context history
    const recentHistory = db.getRecentMessages(activeConvoId, 8);

    // 7. Generate response
    const botReply = await aiService.generateChatReply({
      message: trimmedMessage,
      mode: sanitizedMode,
      personality: sanitizedPersonality,
      history: recentHistory,
    });

    // 8. Store bot reply
    db.addMessage(activeConvoId, {
      role: 'assistant',
      content: botReply,
      mode: sanitizedMode,
      personality: sanitizedPersonality,
    });

    // 9. Return JSON
    return res.status(200).json({
      success: true,
      reply: botReply,
      conversationId: activeConvoId,
      mode: sanitizedMode,
      personality: sanitizedPersonality,
      timestamp: new Date().toISOString(),
      requestId: req.id || null,
    });
  } catch (error) {
    console.error('[ChatController] Error processing chat:', error);
    return res.status(500).json({
      success: false,
      error: "Even I can't answer that right now. The AI server is taking an unscheduled coffee break.",
      code: 'CHAT_PROCESSING_ERROR',
      requestId: req.id || null,
    });
  }
}

/**
 * Server-Sent Events (SSE) Streaming POST /api/chat/stream
 */
async function handleStreamChat(req, res) {
  const { message, mode = 'normal', conversationId, personality = 'college-friend' } = req.body;

  // Validation
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Sending blank messages now? Even your keyboard seems speechless. Type an actual question.',
      code: 'EMPTY_MESSAGE',
    });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      code: 'MESSAGE_TOO_LONG',
    });
  }

  const sanitizedMode = typeof mode === 'string' && VALID_MODES.includes(mode.toLowerCase())
    ? mode.toLowerCase()
    : 'normal';

  const sanitizedPersonality = typeof personality === 'string' && VALID_PERSONALITIES.includes(personality.toLowerCase())
    ? personality.toLowerCase()
    : 'college-friend';

  const activeConvoId = (conversationId && typeof conversationId === 'string' && conversationId.trim() !== '')
    ? conversationId.trim()
    : generateSessionId();

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Store user message
  db.addMessage(activeConvoId, {
    role: 'user',
    content: trimmedMessage,
    mode: sanitizedMode,
    personality: sanitizedPersonality,
  });

  const recentHistory = db.getRecentMessages(activeConvoId, 8);

  // Send start event
  res.write(`data: ${JSON.stringify({ type: 'start', conversationId: activeConvoId, mode: sanitizedMode, personality: sanitizedPersonality })}\n\n`);

  try {
    let accumulatedReply = '';

    await aiService.streamChatReply({
      message: trimmedMessage,
      mode: sanitizedMode,
      personality: sanitizedPersonality,
      history: recentHistory,
      onChunk: (chunk) => {
        accumulatedReply += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', chunk })}\n\n`);
      },
    });

    // Save final response in database
    db.addMessage(activeConvoId, {
      role: 'assistant',
      content: accumulatedReply,
      mode: sanitizedMode,
      personality: sanitizedPersonality,
    });

    // Send complete event
    res.write(`data: ${JSON.stringify({ type: 'done', reply: accumulatedReply, conversationId: activeConvoId })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[ChatController Stream Error]:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Streaming encountered an error.' })}\n\n`);
    res.end();
  }
}

/**
 * GET /api/chat/history?conversationId=...
 */
function handleGetHistory(req, res) {
  try {
    const { conversationId } = req.query;
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'conversationId parameter is required',
        code: 'MISSING_PARAM',
      });
    }

    const conversation = db.getFullConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or expired',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/chat/clear
 */
function handleClearChat(req, res) {
  try {
    const { conversationId } = req.body;

    if (!conversationId || typeof conversationId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Provide a valid conversationId to wipe your conversational embarrassment.',
        code: 'INVALID_CONVERSATION_ID',
      });
    }

    const cleared = db.clearConversation(conversationId.trim());

    return res.status(200).json({
      success: true,
      message: cleared
        ? 'Conversation memory wiped clean. We will pretend none of that ever happened.'
        : 'Session was already empty or fresh.',
      conversationId: conversationId.trim(),
      requestId: req.id || null,
    });
  } catch (error) {
    console.error('[ChatController] Error clearing chat:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear chat memory. Your past decisions remain etched in memory.',
      code: 'CLEAR_ERROR',
      requestId: req.id || null,
    });
  }
}

module.exports = {
  handleChat,
  handleStreamChat,
  handleGetHistory,
  handleClearChat,
};
