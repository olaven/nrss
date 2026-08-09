FROM denoland/deno:1.44.4

WORKDIR /app

COPY . .

RUN deno cache main.ts

ENV DENO_DIR=/deno-dir
ENV APP_BASE_URL=

EXPOSE 8000

CMD ["run", "-A", "main.ts"]
