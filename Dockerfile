# Multi-stage Docker build for JMeter MCP Server
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY sample_data/ ./sample_data/

# Create output directory
RUN mkdir -p output

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S jmeter -u 1001 -G nodejs

# Change ownership
RUN chown -R jmeter:nodejs /app

# Switch to non-root user
USER jmeter

# Expose port for HTTP transport
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Default command (stdio mode)
CMD ["node", "src/index.js"]

# Production stage with HTTP transport
FROM base AS production

# Environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Override default command for HTTP transport
CMD ["npm", "run", "start:http"]

# Development stage
FROM base AS development

# Install dev dependencies
USER root
RUN npm ci && npm cache clean --force
USER jmeter

# Environment variables for development
ENV NODE_ENV=development

# Default to stdio mode for development
CMD ["npm", "run", "dev"]
