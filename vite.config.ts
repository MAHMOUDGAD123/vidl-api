import { defineConfig, type CorsOptions, type UserConfig } from "vite";
import { vitePluginNode } from "./plugins/vite-node-plugin";
import { viteMockServerPlugin } from "./plugins/vite-mock-server-plugin";
import { removeConsolePlugin } from "./plugins/vite-remove-console-plugin";
import { CORS_OPTIONS } from "./src/utils/constants";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  publicDir: false,
  esbuild: {
    format: "esm",
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  build: {
    minify: "esbuild",
    outDir: "./api",
  },
  preview: {
    port: 3000,
    cors: CORS_OPTIONS as CorsOptions,
    host: true,
  },
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    hmr: true,
    port: 3000,
    cors: CORS_OPTIONS as CorsOptions,
    host: true,
  },
  plugins: [
    ...vitePluginNode(),
    viteMockServerPlugin(),
    tsconfigPaths(),
    removeConsolePlugin(),
  ],
} satisfies UserConfig);
