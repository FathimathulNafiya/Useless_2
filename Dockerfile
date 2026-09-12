# Multi-stage production-ready Dockerfile for DA Roast Bot v2.0
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy application source
COPY backend ./backend
COPY frontend ./frontend
COPY test_suite.js ./test_suite.js

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init for proper signal forwarding
RUN apk add --no-cache dumb-init

# Copy built application
COPY --from=builder /app /app

# Run as non-root user for enterprise security compliance
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/server.js"]
