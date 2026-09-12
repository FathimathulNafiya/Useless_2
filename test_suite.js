/**
 * DA Roast Bot v2.0 - Comprehensive Automated Test Suite
 * Tests server health, random roast, personas, streaming, code roasting,
 * roast battle, analytics, memory continuity, OpenAPI specs, and validation edge cases.
 */

const http = require('http');

function request({ method, path, data, headers = {} }) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: JSON.parse(body),
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              raw: body,
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function requestStream({ path, data }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: process.env.PORT || 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let chunks = [];
        res.on('data', (chunk) => {
          chunks.push(chunk.toString());
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            output: chunks.join(''),
          });
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING DA ROAST BOT v2.0 INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
    }
  }

  try {
    // 1. Health check & Request ID
    const health = await request({ method: 'GET', path: '/api/health' });
    assert(
      health.status === 200 && health.body.status === 'online' && health.body.version === '2.0.0',
      'GET /api/health returns 200 & v2.0.0 status',
      health
    );
    assert(
      !!health.headers['x-request-id'],
      'X-Request-Id header is present on responses',
      health.headers
    );

    // 2. Random Roast - Default
    const roastDefault = await request({ method: 'GET', path: '/api/roast/random' });
    assert(
      roastDefault.status === 200 && roastDefault.body.success && roastDefault.body.roast,
      'GET /api/roast/random returns a roast',
      roastDefault
    );

    // 3. Random Roast - Savage Mode
    const roastSavage = await request({ method: 'GET', path: '/api/roast/random?mode=savage' });
    assert(
      roastSavage.status === 200 && roastSavage.body.mode === 'savage',
      'GET /api/roast/random?mode=savage respects mode query',
      roastSavage
    );

    // 4. Random Roast - Professor Mode
    const roastProf = await request({ method: 'GET', path: '/api/roast/random?mode=professor' });
    assert(
      roastProf.status === 200 && roastProf.body.mode === 'professor',
      'GET /api/roast/random?mode=professor handles Professor persona',
      roastProf
    );

    // 5. Roast Pool Stats
    const stats = await request({ method: 'GET', path: '/api/roast/stats' });
    assert(
      stats.status === 200 && stats.body.stats.totalRoasts >= 30,
      'GET /api/roast/stats returns comprehensive 5-mode roast pool',
      stats
    );

    // 6. Chat - Friendly Mode
    const chatFriendly = await request({
      method: 'POST',
      path: '/api/chat',
      data: { message: 'Can you help me with my assignment?', mode: 'friendly' },
    });
    assert(
      chatFriendly.status === 200 && chatFriendly.body.success && chatFriendly.body.reply,
      'POST /api/chat (Friendly mode) returns AI reply',
      chatFriendly
    );
    const convoId = chatFriendly.body.conversationId;
    assert(!!convoId, 'POST /api/chat assigns a valid conversationId', convoId);

    // 7. Chat - Memory Persistence across turns
    const chatNormal = await request({
      method: 'POST',
      path: '/api/chat',
      data: { message: 'What is 2 + 2?', mode: 'normal', conversationId: convoId },
    });
    assert(
      chatNormal.status === 200 && chatNormal.body.conversationId === convoId,
      'POST /api/chat preserves conversationId across turns',
      chatNormal
    );

    // 8. Chat - Procrastinator Mode
    const chatProc = await request({
      method: 'POST',
      path: '/api/chat',
      data: { message: 'I need to study for exams', mode: 'procrastinator', conversationId: convoId },
    });
    assert(
      chatProc.status === 200 && chatProc.body.mode === 'procrastinator',
      'POST /api/chat responds in procrastinator mode',
      chatProc
    );

    // 9. History Retrieval
    const history = await request({
      method: 'GET',
      path: `/api/chat/history?conversationId=${convoId}`,
    });
    assert(
      history.status === 200 && history.body.success && history.body.conversation.messageCount >= 6,
      'GET /api/chat/history retrieves conversation turns',
      history
    );

    // 10. Server-Sent Events (SSE) Streaming
    const streamRes = await requestStream({
      path: '/api/chat/stream',
      data: { message: 'Explain quicksort', mode: 'normal' },
    });
    assert(
      streamRes.status === 200 &&
      streamRes.headers['content-type'].includes('text/event-stream') &&
      streamRes.output.includes('data:') &&
      streamRes.output.includes('"type":"done"'),
      'POST /api/chat/stream delivers valid SSE token stream',
      streamRes
    );

    // 11. Code Roaster Tool
    const codeRoast = await request({
      method: 'POST',
      path: '/api/roast/code',
      data: { code: 'var data = eval("2+2");', language: 'javascript' },
    });
    assert(
      codeRoast.status === 200 && codeRoast.body.success && codeRoast.body.grade && codeRoast.body.diagnosis,
      'POST /api/roast/code analyzes code, returns burn and letter grade',
      codeRoast
    );

    // 12. Roast Battle Arena
    const battle = await request({
      method: 'POST',
      path: '/api/roast/battle',
      data: { roast: 'You have fewer stars than a 1-star microwave.' },
    });
    assert(
      battle.status === 200 &&
      battle.body.success &&
      battle.body.totalScore !== undefined &&
      battle.body.counterRoast,
      'POST /api/roast/battle scores user roast and counters',
      battle
    );

    // 13. Telemetry Analytics
    const analytics = await request({ method: 'GET', path: '/api/analytics' });
    assert(
      analytics.status === 200 && analytics.body.analytics.totalChatMessages > 0,
      'GET /api/analytics returns real-time telemetry metrics',
      analytics
    );

    // 14. OpenAPI JSON Documentation
    const openapi = await request({ method: 'GET', path: '/api/docs/openapi.json' });
    assert(
      openapi.status === 200 && openapi.body.openapi === '3.0.3',
      'GET /api/docs/openapi.json returns valid OpenAPI 3.0 specification',
      openapi
    );

    // 15. Validation - Empty Message
    const emptyMsg = await request({
      method: 'POST',
      path: '/api/chat',
      data: { message: '   ', mode: 'normal' },
    });
    assert(
      emptyMsg.status === 400 && !emptyMsg.body.success,
      'POST /api/chat returns 400 on empty message',
      emptyMsg
    );

    // 16. Validation - Message Too Long (>2000 chars)
    const longMsg = await request({
      method: 'POST',
      path: '/api/chat',
      data: { message: 'x'.repeat(2005), mode: 'normal' },
    });
    assert(
      longMsg.status === 400 && !longMsg.body.success,
      'POST /api/chat returns 400 on excessive length',
      longMsg
    );

    // 17. Clear Chat History
    const clearChat = await request({
      method: 'POST',
      path: '/api/chat/clear',
      data: { conversationId: convoId },
    });
    assert(
      clearChat.status === 200 && clearChat.body.success,
      'POST /api/chat/clear wipes conversation memory',
      clearChat
    );

    // 18. Invalid Route 404
    const invalidRoute = await request({ method: 'GET', path: '/api/unknown-endpoint-xyz' });
    assert(
      invalidRoute.status === 404 && !invalidRoute.body.success,
      'GET /api/unknown returns structured 404 JSON with error code',
      invalidRoute
    );

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('====================================================');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
