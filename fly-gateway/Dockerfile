FROM denoland/deno:1.40.0

WORKDIR /app

# Copy the gateway code (paths relative to project root)
COPY fly-gateway/server.ts .
COPY fly-gateway/deno.json .

# Cache dependencies
RUN deno cache server.ts

EXPOSE 8080

CMD ["deno", "run", "--allow-net", "--allow-env", "server.ts"]
