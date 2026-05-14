ARG BUN_VERSION=1.3.9

FROM oven/bun:${BUN_VERSION} AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV NITRO_PRESET=bun
ENV NUXT_PUBLIC_API=${NUXT_PUBLIC_API}

RUN bun run build


FROM oven/bun:${BUN_VERSION}

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production

CMD ["bun", ".output/server/index.mjs"]
