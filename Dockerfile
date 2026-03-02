## Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (use package-lock for deterministic installs)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

## Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts and static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/templates ./templates

EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]