# Многоэтапная сборка: уменьшает итоговый размер образа,
# исключая инструменты сборки из продакшен-слоя.

# ─── Этап 1: установка зависимостей ──────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Копируем только манифесты, чтобы Docker-кэш слоя
# инвалидировался только при изменении зависимостей
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# ─── Этап 2: сборка приложения ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Устанавливаем все зависимости (включая devDependencies) для сборки
RUN npm ci

COPY . .

# Next.js инлайнит NEXT_PUBLIC_* переменные в бандл на этапе сборки,
# поэтому они должны быть доступны как ARG → ENV во время `next build`
ARG NEXT_PUBLIC_API
ARG NEXT_PUBLIC_ML
ARG NEXT_PUBLIC_PROJECT_ID
ENV NEXT_PUBLIC_API=$NEXT_PUBLIC_API
ENV NEXT_PUBLIC_ML=$NEXT_PUBLIC_ML
ENV NEXT_PUBLIC_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID

# next build генерирует оптимизированный статический вывод в .next/
RUN npm run build

# ─── Этап 3: продакшен-образ ──────────────────────────────────────────────────
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apk add --no-cache curl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Копируем только необходимые артефакты из предыдущих этапов
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 80

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]

