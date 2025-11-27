# Development Dockerfile for backend
FROM node:24-alpine

# Install dependencies needed for Prisma and health checks
RUN apk add --no-cache \
    curl \
    openssl \
    ca-certificates \
    netcat-openbsd

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm i

# Copy source code
COPY . .

# Copy and make entrypoint script executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Generate Prisma Client  
RUN npx prisma generate

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Start dev server with tsx
CMD ["npm", "run", "dev"]