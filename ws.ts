
// ws.ts
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Deno WebSocket Time Stream</title>
  </head>
  <body>
    <h1>WebSocket Time Stream</h1>
    <p>Check the console for the current time, updated every second.</p>
    <script>
      const ws = new WebSocket("ws://m.sxp.me:8000/", "vite-hmr");

      ws.onopen = () => {
        console.log("WebSocket connection opened.");
      };

      ws.onmessage = (event) => {
        console.log("Received:", event.data);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    </script>
  </body>
</html>
`;

Deno.serve({ port: 8000 }, (req) => {
    console.log(`REQ ${req.url}`);
  // Check if the request is for a WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req, { protocol: "vite-hmr" });

    let intervalId;

    socket.onopen = () => {
      console.log("A client connected!");
      // Send the current time every second
      intervalId = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(new Date().toString());
        }
      }, 1000);
    };

    socket.onclose = () => {
      console.log("A client disconnected.");
      // Stop sending time updates when the client disconnects
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return response;
  }

  // Serve the minimal HTML page for standard HTTP requests
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
});

console.log("Server started on http://localhost:8000");
