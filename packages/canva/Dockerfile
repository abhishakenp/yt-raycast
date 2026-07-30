FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/canva/package.json ./packages/canva/
RUN bun install --frozen-lockfile
COPY packages/canva ./packages/canva
WORKDIR /app/packages/canva
RUN bun run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=build /app/packages/canva/dist /usr/share/nginx/html
EXPOSE 8080
