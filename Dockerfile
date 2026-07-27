# ── Build Stage ──
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY server/prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY server/tsconfig.json server/tsconfig.build.json ./
COPY server/src ./src
RUN npm run build

# ── Production Stage ──
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci --production

# Copy Prisma client from builder (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Expose the API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Run the server
CMD ["node", "dist/server.js"]
