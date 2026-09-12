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
    if [ -z "${NUXT_PUBLIC_API:-}" ]; then \
      echo "NUXT_PUBLIC_API is required for the Nuxt build"; \
      exit 1; \
    fi; \
    if [ -z "${NUXT_PUBLIC_SITE_URL:-}" ]; then \
      echo "NUXT_PUBLIC_SITE_URL is required for the Nuxt build"; \
      exit 1; \
    fi; \
    bun run build; \
    if [ ! -s .output/server/index.mjs ]; then \
      echo "Nuxt build did not create .output/server/index.mjs"; \
      find .output -maxdepth 2 -type f -print 2>/dev/null || true; \
      exit 1; \
    fi


FROM oven/bun:${BUN_VERSION} AS runner

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
