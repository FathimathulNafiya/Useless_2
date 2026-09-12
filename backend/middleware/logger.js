/**
 * Structured HTTP Request Logger Middleware
 * Provides real-time visibility into incoming requests, latency, status codes, and request IDs.
 */

function formatMethod(method) {
  const colors = {
    GET: '\x1b[32m',    // Green
    POST: '\x1b[34m',   // Blue
    PUT: '\x1b[33m',    // Yellow
    DELETE: '\x1b[31m', // Red
    PATCH: '\x1b[35m',  // Magenta
  };
  const reset = '\x1b[0m';
  const color = colors[method] || '\x1b[37m';
  return `${color}${method.padEnd(6)}${reset}`;
}

function formatStatus(status) {
  const reset = '\x1b[0m';
  if (status >= 500) return `\x1b[31m${status}${reset}`; // Red
  if (status >= 400) return `\x1b[33m${status}${reset}`; // Yellow
  if (status >= 300) return `\x1b[36m${status}${reset}`; // Cyan
  return `\x1b[32m${status}${reset}`; // Green
}

function httpLogger(req, res, next) {
  // Only log API routes and health checks to keep console clean
  const isApiRoute = req.originalUrl.startsWith('/api');
  if (!isApiRoute && process.env.NODE_ENV === 'production') {
    return next();
  }

  const startTime = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const timeInMs = ((diff[0] * 1e3) + (diff[1] * 1e-6)).toFixed(2);
    const timestamp = new Date().toISOString();
    const methodStr = formatMethod(req.method);
    const statusStr = formatStatus(res.statusCode);
    const reqId = req.id ? `\x1b[90m[${req.id.substring(0, 8)}]\x1b[0m ` : '';

    if (isApiRoute) {
      console.log(`[${timestamp}] ${reqId}${methodStr} ${req.originalUrl} -> ${statusStr} (${timeInMs}ms)`);
    }
  });

  next();
}

module.exports = httpLogger;
