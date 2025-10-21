import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: CORS_HEADERS 
    });
  }

  console.log("New WebSocket connection request");

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    let sipConnection: Deno.TcpConn | null = null;

    socket.onopen = async () => {
      console.log("WebSocket opened, connecting to AlienVoIP SIP server...");
      
      try {
        // Connect to AlienVoIP SIP server via TCP
        sipConnection = await Deno.connect({
          hostname: "sip1.alienvoip.com",
          port: 5060,
        });

        console.log("Connected to AlienVoIP SIP server");

        // Read from SIP server and forward to WebSocket
        (async () => {
          const buffer = new Uint8Array(8192);
          try {
            while (sipConnection) {
              const bytesRead = await sipConnection.read(buffer);
              if (bytesRead === null) {
                console.log("SIP connection closed by server");
                socket.close();
                break;
              }

              const message = new TextDecoder().decode(buffer.subarray(0, bytesRead));
              console.log("← From SIP:", message.substring(0, 200));
              
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
              }
            }
          } catch (error) {
            console.error("Error reading from SIP:", error);
            socket.close();
          }
        })();

      } catch (error) {
        console.error("Failed to connect to SIP server:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        socket.send(JSON.stringify({
          error: "Failed to connect to SIP server",
          details: errorMessage
        }));
        socket.close();
      }
    };

    socket.onmessage = async (event) => {
      const message = event.data;
      console.log("→ To SIP:", message.substring(0, 200));

      if (sipConnection) {
        try {
          const encoded = new TextEncoder().encode(message);
          await sipConnection.write(encoded);
        } catch (error) {
          console.error("Error writing to SIP:", error);
          socket.close();
        }
      } else {
        console.warn("SIP connection not established");
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
      if (sipConnection) {
        try {
          sipConnection.close();
        } catch (error) {
          console.error("Error closing SIP connection:", error);
        }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (sipConnection) {
        try {
          sipConnection.close();
        } catch (err) {
          console.error("Error closing SIP connection:", err);
        }
      }
    };

    return response;
  } catch (error) {
    console.error("Error setting up WebSocket:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: "WebSocket setup failed", details: errorMessage }), 
      { 
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    );
  }
});
