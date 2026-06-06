FROM oven/bun:1.3-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends poppler-utils ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY src ./src
COPY public ./public

ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000

CMD ["bun", "src/server.ts"]
