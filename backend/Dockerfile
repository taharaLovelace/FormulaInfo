# Development Dockerfile for backend
FROM node:24-alpine

# Install dependencies needed for Prisma and health checks
RUN apt-get update && apt-get install -y \
    curl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm i

# Copy source code
COPY . .

# Generate Prisma Client  
RUN npx prisma generate

RUN npx prisma migrate deploy

RUN npx prisma db seed

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start dev server with tsx
CMD ["npm", "run", "dev"]