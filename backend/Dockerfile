FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npx prisma generate --schema=src/document-processing/infrastructure/persistence/models/schema.prisma
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/src/document-processing/infrastructure/persistence/models/schema.prisma ./src/document-processing/infrastructure/persistence/models/schema.prisma

EXPOSE 3001

CMD ["node", "dist/main/index.js"]
