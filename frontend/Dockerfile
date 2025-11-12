# Development Dockerfile for frontend
FROM node:24-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start dev server
CMD ["npm", "run", "dev"]