# Deno + Vite + React Template

This is a template project that demonstrates how to use Deno, Vite, and React together. It includes a simple setup for a client-side React application and a Deno backend, with a proxy for API requests during development.

## How it Works

The project is divided into two main parts: the `client` directory, which contains the React application, and the `server` directory, which contains the Deno server.

### Development

In development mode, the Deno server (`server/main.ts`) starts the Vite dev server using the `server/vite.ts` file. The Vite server is configured to serve the React application and proxy API requests to the Deno server.

The proxy is configured in `server/vite.ts`:

```typescript
// server/vite.ts
import { createServer } from "@vite";

export class ViteServer {
  private server: any;

  async start() {
    this.server = await createServer({
      configFile: "client/vite.config.ts",
      server: {
        proxy: {
          "/api": {
            target: "http://localhost:2501",
            changeOrigin: true,
          },
        },
      },
    });

    await this.server.listen();
    this.server.printUrls();
  }

  getHandler() {
    return this.server.middlewares;
  }
}
```

This configuration tells Vite to forward any requests that start with `/api` to the Deno server, which is running on port 2501. This allows the React application to make API calls to relative paths like `/api/time` without worrying about CORS issues.

The Deno server in `server/main.ts` handles the API requests and also serves the Vite application.

### Production

In production, the React application is built into the `dist` directory using the `deno task build` command. The Deno server then serves the static files from the `dist` directory using the `serveDir` function from the Deno standard library.

## Getting Started

To get started, you can use the following commands:

*   `deno task dev`: Starts the development server.
*   `deno task build`: Builds the React application for production.
*   `deno task serve`: Serves the production build.
