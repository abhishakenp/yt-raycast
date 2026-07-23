FROM oven/bun:1.3.12-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1.3.12-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app ./
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["./node_modules/.bin/medusa", "start"]
