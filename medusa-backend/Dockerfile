FROM oven/bun:1.3.12-alpine AS base

RUN apk add --no-cache nodejs

WORKDIR /app

FROM base AS deps

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM base AS runtime

ENV NODE_ENV=production

COPY --from=deps /app ./
RUN chmod +x ./docker-entrypoint.sh

RUN addgroup -g 1001 -S medusa && \
    adduser -S -u 1001 -G medusa medusa
USER medusa

EXPOSE 9000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["start"]
