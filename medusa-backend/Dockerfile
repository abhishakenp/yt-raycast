FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl unzip openssl ca-certificates \
  && curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.5" \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN node ./node_modules/@medusajs/cli/cli.js build

ENV NODE_ENV=production
ENV PORT=9000

RUN chmod +x docker-entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["./docker-entrypoint.sh"]
