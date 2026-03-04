FROM oven/bun:1.3 AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

ENV NODE_ENV=production
ENV NITRO_PRESET=bun

RUN bun run build


FROM oven/bun:1.3

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["bun", "run", "start"]