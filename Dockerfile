# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm run prisma:generate

# Build application
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema before generating client
COPY --from=builder /app/prisma ./prisma

# Install Prisma CLI temporarily to generate client in production stage
RUN pnpm add -D prisma

# Generate Prisma Client in production environment
RUN pnpm exec prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy email templates
COPY emails ./emails

# Change ownership to app user
RUN chown -R nestjs:nodejs /app

# Switch to app user
USER nestjs

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
