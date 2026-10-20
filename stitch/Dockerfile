# ==============================================================================
# Dockerfile cho Next.js 16 Web Client (stitch)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Cai dat dependencies can thiet de compile mot so native modules neu co
RUN apk add --no-cache libc6-compat

# Copy package config truoc de tan dung Docker cache
COPY package.json package-lock.json ./

# Cai dat node_modules
RUN npm ci

# Copy toan bo source code
COPY . .

# Build production bundle cho Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ==============================================================================
# Runner Image (Production)
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy output build tu builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
