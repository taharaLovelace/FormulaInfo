# Nginx Dockerfile
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Create log directory
RUN mkdir -p /var/log/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]