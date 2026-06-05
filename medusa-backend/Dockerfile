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

# Pre-build the Medusa server + admin bundle into the image, then prepare
# .medusa/server as the production runtime dir (Medusa v2's standard
# deploy pattern). medusa-config.js has to live alongside the bundle so
# `medusa start` can load it; npm install --omit=dev fills in the
# production-only node_modules the bundle expects.
RUN npx --no medusa build && \
    cp medusa-config.js .medusa/server/medusa-config.js && \
    mkdir -p .medusa/server/src && \
    cp -r .medusa/server/subscribers .medusa/server/src/subscribers && \
    cd .medusa/server && \
    npm install --omit=dev --no-audit --no-fund --loglevel=error

# `medusa build` flattens src/subscribers -> .medusa/server/subscribers, but
# `medusa start` (run from .medusa/server) scans .medusa/server/src/subscribers,
# so without the copy above our product-sync subscriber is silently never
# registered and the auto-sync webhook never fires.

RUN chmod +x entrypoint.sh && chown -R medusa:medusa /app

USER medusa
EXPOSE 9000

# entrypoint handles: wait for pg → migrate → seed admin → start. Build
# already happened at image build time (see RUN npx medusa build above).
ENTRYPOINT ["/sbin/tini", "--", "./entrypoint.sh"]
