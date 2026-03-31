# Use Node.js 24 with alpine for a smaller image
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Set correct permissions for storage
# In node:alpine, the 'node' user already exists with UID 1000
RUN mkdir -p /app/storage/uploads && \
    mkdir -p /app/public/uploads && \
    chown -R node:node /app/storage /app/public && \
    chmod -R 775 /app/storage /app/public

# Copy the standalone build from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000
ENV PORT=3000

# Standalone build provides its own server.js
CMD ["node", "server.js"]
