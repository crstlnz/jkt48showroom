ARG BUN_VERSION=1.3.9

FROM oven/bun:${BUN_VERSION} AS builder
ARG NUXT_PUBLIC_API
ARG NUXT_SITE_NAME

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV NITRO_PRESET=bun
ENV NUXT_PUBLIC_API=${NUXT_PUBLIC_API}
ENV NUXT_SITE_NAME=${NUXT_SITE_NAME}

RUN test -n "$NUXT_PUBLIC_API" || (echo "NUXT_PUBLIC_API build arg is required" && exit 1)
RUN bun run build


FROM oven/bun:${BUN_VERSION}
ARG NUXT_PUBLIC_API
ARG NUXT_SITE_NAME

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NUXT_PUBLIC_API=${NUXT_PUBLIC_API}
ENV NUXT_SITE_NAME=${NUXT_SITE_NAME}

CMD ["bun", ".output/server/index.mjs"]
