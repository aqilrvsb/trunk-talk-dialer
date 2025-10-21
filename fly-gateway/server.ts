// WebSocket to SIP Gateway for Fly.io
// This server proxies WebSocket connections to SIP TCP servers

const PORT = parseInt(Deno.env.get("PORT") || "8080");
const SIP_CONNECTION_TIMEOUT = 10000; // 10 seconds

console.log(`Starting WebSocket-to-SIP gateway on port ${PORT}...`);

// Extract SIP server hostname from SIP message
function extractSipServer(sipMessage: string): string | null {
  // Look for the Request-URI in REGISTER message: "REGISTER sip:domain.com SIP/2.0"
  const registerMatch = sipMessage.match(/REGISTER\s+sip:([^\s;:]+)/i);
  if (registerMatch) {
    return registerMatch[1];
  }

  // Look for Via header: "Via: SIP/2.0/WS domain.com"
  const viaMatch = sipMessage.match(/Via:\s*SIP\/2\.0\/[^\s]+\s+([^\s;:]+)/i);
  if (viaMatch) {
    return viaMatch[1];
  }

  // Look for From/To header domain: "From: <sip:user@domain.com>"
  const fromMatch = sipMessage.match(/From:\s*<?sip:[^@]+@([^\s>;:]+)/i);
  if (fromMatch) {
    return fromMatch[1];
  }

  return null;
}

Deno.serve({ port: PORT, hostname: "0.0.0.0" }, (req) => {
  // Handle WebSocket upgrade (case-insensitive check)
  const upgradeHeader = req.headers.get("upgrade")?.toLowerCase();
  if (upgradeHeader === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    let sipSocket: Deno.TcpConn | null = null;
    let isConnecting = false;

    socket.onopen = () => {
      console.log("WebSocket client connected");
    };

    socket.onmessage = async (event) => {
      try {
        const message = event.data;

        if (typeof message !== "string") {
          console.error("Received non-string message, ignoring");
          return;
        }

        // Auto-connect to SIP server on first message
        if (!sipSocket && !isConnecting) {
          isConnecting = true;

          // Extract SIP server from the message
          const extractedHost = extractSipServer(message);
          const host = extractedHost || "sip1.alienvoip.com";
          const port = 5060;

          console.log(`Auto-connecting to SIP server: ${host}:${port}`);
          console.log(`First SIP message preview: ${message.substring(0, 200)}...`);

          try {
            // Create connection with timeout
            const connectPromise = Deno.connect({ hostname: host, port });
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Connection timeout")), SIP_CONNECTION_TIMEOUT)
            );

            sipSocket = await Promise.race([connectPromise, timeoutPromise]);
            console.log(`Successfully connected to SIP server ${host}:${port}`);
            isConnecting = false;

            // Start reading from SIP server and forwarding to WebSocket
            (async () => {
              const buffer = new Uint8Array(8192);
              while (sipSocket) {
                try {
                  const n = await sipSocket.read(buffer);
                  if (n === null) {
                    console.log("SIP server closed connection");
                    if (socket.readyState === WebSocket.OPEN) {
                      socket.close(1000, "SIP server closed connection");
                    }
                    break;
                  }

                  const text = new TextDecoder().decode(buffer.subarray(0, n));
                  console.log(`Received from SIP: ${text.substring(0, 100)}...`);
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(text);
                  }
                } catch (err) {
                  console.error("Error reading from SIP:", err);
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.close(1011, "Error reading from SIP server");
                  }
                  break;
                }
              }
            })();

            // Now forward the first message
            const encoder = new TextEncoder();
            await sipSocket.write(encoder.encode(message));
            console.log(`Forwarded first message to SIP server`);

          } catch (err) {
            console.error("Failed to connect to SIP server:", err);
            console.error(`Error details: ${err.message}`);
            isConnecting = false;

            // Don't close the WebSocket immediately, send an error message back
            if (socket.readyState === WebSocket.OPEN) {
              // Send a SIP error response
              const errorResponse = `SIP/2.0 503 Service Unavailable\r\n` +
                `Content-Length: 0\r\n\r\n`;
              socket.send(errorResponse);

              // Close after a brief delay to allow error to be sent
              setTimeout(() => {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.close(1011, `Failed to connect to SIP server: ${err.message}`);
                }
              }, 100);
            }
            return;
          }
        }
        // Forward subsequent messages to SIP server
        else if (sipSocket && typeof message === "string") {
          const encoder = new TextEncoder();
          await sipSocket.write(encoder.encode(message));
          console.log(`Forwarded message to SIP server: ${message.substring(0, 50)}...`);
        } else if (isConnecting) {
          console.log("Still connecting to SIP server, message queued");
          // Could implement message queuing here if needed
        }
      } catch (err) {
        console.error("Error handling message:", err);
        console.error(`Error stack: ${err.stack}`);
      }
    };
    
    socket.onclose = () => {
      console.log("WebSocket client disconnected");
      if (sipSocket) {
        try {
          sipSocket.close();
        } catch (err) {
          console.error("Error closing SIP socket:", err);
        }
        sipSocket = null;
      }
    };
    
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
    
    return response;
  }
  
  // Health check endpoint
  if (req.method === "GET" && new URL(req.url).pathname === "/health") {
    return new Response("OK", { status: 200 });
  }
  
  return new Response("WebSocket-to-SIP Gateway", { status: 200 });
});
