FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache curl bash unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache curl bash unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY src ./src
COPY public ./public
COPY studio ./studio
COPY deploy ./deploy
COPY next.config.ts ./next.config.ts
COPY tsconfig.json ./tsconfig.json

COPY --from=builder /app/.next ./.next

RUN chmod +x deploy/start.sh

VOLUME /app/sessions

EXPOSE 3000

ENV SF_BACKEND_ORIGIN=http://localhost:7420

CMD ["sh", "deploy/start.sh"]
