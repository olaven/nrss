FROM denoland/deno:alpine-1.46.3

WORKDIR /app
COPY . .

# Pre-compiles main.ts and caches all remote imports (fresh, preact, pg,
# node-pg-migrate, ...) into the image so the container isn't fetching them
# at startup.
RUN deno cache main.ts

# Fresh's default listen port when none is set via options/env.
EXPOSE 8000

USER deno
CMD ["run", "-A", "main.ts"]
