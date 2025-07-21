import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

const port = Number(Deno.env.get("PORT")) || 2501;
const isDev = Deno.env.get("ENV") === "development";

let clientHandler: (req: Request) => Promise<Response>;

async function createClientHandler() {
  if (isDev) {
    console.log("Development mode: Starting Vite dev server...");
    const { ViteServer } = await import("./vite.ts");
    const vite = new ViteServer();
    await vite.start();
    clientHandler = vite.getHandler();
  } else {
    clientHandler = async (req: Request) => {
      return await serveDir(req, {
        fsRoot: "dist",
        urlRoot: "",
      });
    }
  }
}

console.log(`Main server listening on http://localhost:${port} @ ${new  Date().toISOString()}`);

async function mainHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  console.log(`Req ${url.pathname}${url.search}`)
  const pathname = url.pathname;

  // API routes
  if (pathname.startsWith("/api")) {
    if (pathname === "/api/time") {
      return new Response(new Date());
    }

    return new Response(JSON.stringify({ message: "API route not found" }), { status: 404 });
  }

  return await clientHandler(req);
}

async function main() {
  await createClientHandler();
  await Deno.serve({ port, handler: mainHandler });
}

main();
