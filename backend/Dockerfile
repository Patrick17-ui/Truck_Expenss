FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN bun run prisma generate


FROM oven/bun:latest AS runner
WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]