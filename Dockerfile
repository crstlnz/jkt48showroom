# syntax=docker/dockerfile:1.7
ARG BUN_VERSION=1.3.9

FROM oven/bun:${BUN_VERSION} AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV NITRO_PRESET=bun

RUN --mount=type=secret,id=nuxt_public_env \
    set -eu; \
    set -a; . /run/secrets/nuxt_public_env; set +a; \
    test -n "$NUXT_PUBLIC_API"; \
    test -n "$NUXT_PUBLIC_SITE_URL"; \
    bun run build; \
    test -s .output/server/index.mjs; \
    test -d .output/public


FROM oven/bun:${BUN_VERSION}

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

CMD ["bun", ".output/server/index.mjs"]
