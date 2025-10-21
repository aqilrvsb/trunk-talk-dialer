FROM denoland/deno:1.40.0

WORKDIR /app

# Copy the gateway code (build context is fly-gateway/ directory)
COPY server.ts .
COPY deno.json .

# Cache dependencies
RUN deno cache server.ts

EXPOSE 8080

CMD ["deno", "run", "--allow-net", "--allow-env", "server.ts"]
