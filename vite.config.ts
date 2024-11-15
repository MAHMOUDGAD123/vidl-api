import { defineConfig, type CorsOptions, type UserConfig } from "vite";
import { vitePluginNode } from "./plugins/vite-node-plugin";
import { viteMockServerPlugin } from "./plugins/vite-mock-server-plugin";
import { CORS_OPTIONS } from "./src/utils/constants";

export default defineConfig({
  base: "./",
  publicDir: false,
  esbuild: {
    format: "esm",
    minifyWhitespace: true,
  },
  build: {
    minify: "esbuild",
    outDir: "./api",
  },
  preview: {
    port: 3000,
    cors: CORS_OPTIONS as CorsOptions,
  },
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    hmr: true,
    port: 3000,
    cors: CORS_OPTIONS as CorsOptions,
  },
  plugins: [...vitePluginNode(), viteMockServerPlugin()],
} satisfies UserConfig);
