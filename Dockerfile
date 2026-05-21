FROM node:22-alpine AS deps

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./build.db"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL="file:/data/pantrypal.db"
ENV APP_URL="http://localhost:3000"
ENV ENABLE_EXTERNAL_IMAGE_ANALYSIS=false
ENV IMAGE_ANALYSIS_PROVIDER=mock

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["./docker-entrypoint.sh"]
