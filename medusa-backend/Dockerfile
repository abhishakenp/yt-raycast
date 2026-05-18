# Per-tenant Medusa backend image. Built once, run many times — each tenant
# container is parameterised entirely via env (DATABASE_URL / REDIS_URL /
# JWT_SECRET / COOKIE_SECRET / STORE_CORS / ADMIN_CORS / AUTH_CORS / PORT).
#
# Build context is `./medusa-backend` (relative to ship-fast root). The
# per-session compose templates in infra/medusa/sessions/*.yml reference
# this directory via `build.context: ../../../medusa-backend`.
FROM node:20-alpine

# Native build deps for pg, swc, and Medusa's internal modules.
RUN apk add --no-cache python3 make g++ libc6-compat tini && \
    addgroup -S medusa && adduser -S medusa -G medusa

WORKDIR /app

# Deps first for layer caching across source edits.
COPY package.json ./
RUN npm install --no-audit --no-fund --loglevel=error

# Project source.
COPY tsconfig.json medusa-config.js entrypoint.sh ./
COPY src ./src

RUN chmod +x entrypoint.sh && chown -R medusa:medusa /app

USER medusa
EXPOSE 9000

# entrypoint handles: wait for pg → ensure build → migrate → start.
ENTRYPOINT ["/sbin/tini", "--", "./entrypoint.sh"]
