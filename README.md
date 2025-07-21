# Deno + Vite + React Template

This is a template project that demonstrates how to use Deno, Vite, and React together. It includes a simple setup for a client-side React application and a Deno backend.

## How it Works

The project is divided into two main parts: the `client` directory, which contains the React application, and the `server` directory, which contains the Deno server.

### Development

In development mode (`ENV=development`), a single Deno server (`server/main.ts`) acts as the entry point for the entire application. This server runs on a single port (defaulting to 2501) and performs two roles:

1.  **API Server**: It handles any requests sent to paths starting with `/api`.
2.  **Client Server**: All other requests are forwarded to the Vite development server, which is used programmatically as a middleware. Vite takes care of compiling the React application on the fly and enabling Hot Module Replacement (HMR).

Because both the client application and the API are served from the same origin (e.g., `http://localhost:2501`), there are no Cross-Origin (CORS) issues, and no proxy is needed.

### Production

In production mode (when `ENV` is not `development`), the React application is first built into static files in the `dist` directory using the `deno task build` command.

The Deno server then serves these static files from the `dist` directory and continues to handle any API requests sent to `/api`.

## Getting Started

To get started, you can use the following Deno tasks defined in `deno.jsonc`:

*   `deno task dev`: Starts the development server.
*   `deno task build`: Builds the React application for production.
*   `deno task serve`: Serves the production build.

## Environment Variables

*   `ENV`: Controls the application's mode.
    *   Set to `development` for the dev server with HMR.
    *   When not set, the application runs in production mode.
*   `PORT`: Sets the port for the Deno server. Defaults to `2501`.