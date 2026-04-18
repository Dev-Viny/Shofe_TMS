# Multi-stage build for React frontend
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy nginx configuration
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fix nginx permissions for non-root user
RUN mkdir -p /var/cache/nginx && \
    chown -R 101:101 /var/cache/nginx /etc/nginx /usr/share/nginx/html /var/log/nginx && \
    chmod -R 755 /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/api/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
