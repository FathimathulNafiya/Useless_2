/**
 * Request ID Middleware
 * Assigns a unique X-Request-Id header to every incoming HTTP request for end-to-end tracing.
 */

const crypto = require('crypto');

function requestIdMiddleware(req, res, next) {
  // Respect existing request ID from reverse proxies (e.g., NGINX, Cloudflare) if provided
  const existingId = req.headers['x-request-id'];
  const requestId = (typeof existingId === 'string' && existingId.trim() !== '')
    ? existingId.trim()
    : (crypto.randomUUID ? crypto.randomUUID() : 'req_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'));

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

module.exports = requestIdMiddleware;
