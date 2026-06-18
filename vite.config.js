/**
 * Vite configuration for TravioAfrica homepage.
 *
 * - @ alias → ./src (matches jsconfig.json)
 * - Dev proxy: /api → VITE_AUTH_PROXY_TARGET (default: Render staging backend)
 *   Avoids CORS during local development; rewrite prevents duplicated path prefixes.
 *
 * Env: VITE_AUTH_PROXY_TARGET — full URL including optional path prefix
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawAuthProxyTarget =
    env.VITE_AUTH_PROXY_TARGET || "http://localhost:5000";
  const authTargetUrl = new URL(rawAuthProxyTarget);
  const authProxyOrigin = authTargetUrl.origin;
  const authProxyBasePath = authTargetUrl.pathname.replace(/\/+$/, "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ["mapbox-gl", "gray-matter", "react-markdown"],
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          target: authProxyOrigin,
          changeOrigin: true,
          secure: true,
          rewrite: (requestPath) => {
            if (!authProxyBasePath || authProxyBasePath === "/") return requestPath;
            if (requestPath.startsWith(`${authProxyBasePath}/`) || requestPath === authProxyBasePath) {
              return requestPath;
            }
            return `${authProxyBasePath}${requestPath}`;
          },
        },
      },
    },
  };
});
