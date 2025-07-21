import { createServer, ViteDevServer } from "npm:vite";

export class ViteServer {
  private viteDevServer: ViteDevServer | null = null;
  private config: { host: string; port: number; };

  constructor(config: { host?: string, port?: number } = {}) {
    this.config = {
        host: config.host || 'm.sxp.me',
        port: config.port || 5173,
    };
  }

  async start() {
    this.viteDevServer = await createServer({
      root: './client',
      server: {
        ...this.config,
      },
    });
    await this.viteDevServer.listen();
    console.log(`Vite dev server started on http://${this.config.host}:${this.config.port}`);
  }

  getHandler(): (req: Request) => Promise<Response> {
    if (!this.viteDevServer) {
      throw new Error("Vite server not started. Call start() first.");
    }

    return async (req: Request): Promise<Response> => {
      const url = new URL(req.url);

      // Handle WebSocket upgrades for HMR
      if (req.headers.get("upgrade") === "websocket") {
        const protocol = req.headers.get("sec-websocket-protocol");
        console.log(`Upgrading to WebSocket for HMR. protocol:`, protocol);

        const { socket, response } = Deno.upgradeWebSocket(req, {protocol});        
        const clientSocket = socket;
        let viteSocket: WebSocket | undefined;
        
        clientSocket.onopen = () => {
          console.log("Client WebSocket connection opened.");
          viteSocket = new WebSocket(`ws://${this.config.host}:${this.config.port}${url.pathname}${url.search}`, protocol);
          
          viteSocket.onopen = () => {
            console.log("Proxy WebSocket connection established.");
            // Forward messages from client to Vite
            clientSocket.onmessage = (e) => {
            console.log("clientSocket.onmessage");
              viteSocket?.send(e.data);
            };
          };
          
          // Forward messages from Vite to client
          viteSocket.onmessage = (e) => {
            console.log("viteSocket.onmessage");
            clientSocket.send(e.data);
          };
          
          viteSocket.onclose = () => {
            console.log("Proxy WebSocket connection closed.");
            clientSocket.close();
          };
          
          viteSocket.onerror = (e) => {
            console.error("Proxy WebSocket error:", e);
            clientSocket.close();
          };
        };
          
        clientSocket.onclose = () => {
          console.log("Client WebSocket connection closed.");
          viteSocket?.close();
        };
        
        clientSocket.onerror = (e) => {
          console.error("Client WebSocket error:", e);
          viteSocket?.close();
        };
        
        return response;
      }

      // Proxy standard HTTP requests to the Vite server
      const proxyUrl = new URL(url.pathname, `http://${this.config.host}:${this.config.port}`);
      proxyUrl.search = url.search;
//      console.log(`Proxy ${url.pathname}${url.search}`)

      return fetch(proxyUrl, {
        headers: req.headers,
        method: req.method,
        body: req.body,
        redirect: 'manual',
      });
    };
  }
}
