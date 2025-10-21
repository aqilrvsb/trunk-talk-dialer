// WebSocket to SIP Gateway for Fly.io
// This server proxies WebSocket connections to SIP TCP servers

const PORT = parseInt(Deno.env.get("PORT") || "8080");

console.log(`Starting WebSocket-to-SIP gateway on port ${PORT}...`);

Deno.serve({ port: PORT, hostname: "0.0.0.0" }, (req) => {
  // Handle WebSocket upgrade (case-insensitive check)
  const upgradeHeader = req.headers.get("upgrade")?.toLowerCase();
  if (upgradeHeader === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let sipSocket: Deno.TcpConn | null = null;
    
    socket.onopen = () => {
      console.log("WebSocket client connected");
    };
    
    socket.onmessage = async (event) => {
      try {
        const message = event.data;
        
        // Auto-connect to SIP server on first message
        if (!sipSocket) {
          // Default SIP server - extract from SIP message or use default
          const host = "sip1.alienvoip.com";
          const port = 5060;
          
          console.log(`Auto-connecting to SIP server: ${host}:${port}`);
          
          try {
            sipSocket = await Deno.connect({ hostname: host, port });
            console.log(`Connected to SIP server ${host}:${port}`);
            
            // Start reading from SIP server and forwarding to WebSocket
            (async () => {
              const buffer = new Uint8Array(8192);
              while (sipSocket) {
                try {
                  const n = await sipSocket.read(buffer);
                  if (n === null) {
                    console.log("SIP server closed connection");
                    socket.close();
                    break;
                  }
                  
                  const text = new TextDecoder().decode(buffer.subarray(0, n));
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(text);
                  }
                } catch (err) {
                  console.error("Error reading from SIP:", err);
                  break;
                }
              }
            })();
          } catch (err) {
            console.error("Failed to connect to SIP server:", err);
            socket.close();
            return;
          }
        }
        
        // Forward message to SIP server
        if (sipSocket && typeof message === "string") {
          const encoder = new TextEncoder();
          await sipSocket.write(encoder.encode(message));
        }
      } catch (err) {
        console.error("Error handling message:", err);
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
