# Trigger Hardcode Fix - Final Attempt
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts; else npm install --ignore-scripts; fi

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# --- HARDCODED KEYS (The Nuclear Option) ---
# We are putting the keys directly here to bypass any Railway connection issues.
ENV NEXT_PUBLIC_SUPABASE_URL="https://fjefpxwetudpcxarlokp.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWZweHdldHVkcGN4YXJsb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjExMDQsImV4cCI6MjA3OTM5NzEwNH0.hZNCMc2se631cDr-eBkTeiGDV4-RKLhCeAyTAniHM18"
ENV NEXT_PUBLIC_API_URL="https://moaaiv3-production.up.railway.app"
# -------------------------------------------

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Runtime needs them too
ENV NEXT_PUBLIC_SUPABASE_URL="https://fjefpxwetudpcxarlokp.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWZweHdldHVkcGN4YXJsb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjExMDQsImV4cCI6MjA3OTM5NzEwNH0.hZNCMc2se631cDr-eBkTeiGDV4-RKLhCeAyTAniHM18"
ENV NEXT_PUBLIC_API_URL="https://moaaiv3-production.up.railway.app"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
