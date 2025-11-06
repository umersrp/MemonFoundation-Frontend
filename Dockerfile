# Stage 1: Build the app
FROM node:20 AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy all files
COPY . .

# Build the app (creates 'dist' folder, not 'out')
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from dist folder (not out folder)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
