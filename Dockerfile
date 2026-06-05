# ── Stage 1: Builder — компіляція TypeScript ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Копіюємо package files ПЕРШИМИ для кешування npm install
COPY package*.json ./
RUN npm ci

# Копіюємо TypeScript вихідний код
COPY tsconfig.json ./
COPY src ./src

# Компілюємо TypeScript → JavaScript
RUN npm run build

# ── Stage 2: Runtime — мінімальний production образ ──────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Тільки production залежності
COPY package*.json ./
RUN npm ci --omit=dev

# Скомпільований код зі stage builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
