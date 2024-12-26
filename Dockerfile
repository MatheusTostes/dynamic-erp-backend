# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and TypeScript globally
RUN npm install && \
  npm install -g typescript

# Copy source code
COPY . .

# Generate TSOA routes and build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Set default environment variables
ENV NODE_ENV=development \
  PORT=5000

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Change ownership of the app directory
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "--unhandled-rejections=strict", "--max-old-space-size=2048", "dist/app.js"]