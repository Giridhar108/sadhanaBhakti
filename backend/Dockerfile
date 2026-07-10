FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY nest-cli.json tsconfig.json ./
COPY src ./src

RUN npm run prisma:generate && npm run build

FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node --from=build /app/dist ./dist
RUN mkdir -p /app/uploads/audio && chown -R node:node /app/uploads

USER node

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
