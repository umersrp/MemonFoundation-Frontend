# Stage 1: Build the app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies with verbose output
RUN npm install --force --loglevel=verbose

# Copy all files
COPY . .

# Build the app with progress output
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from dist folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
