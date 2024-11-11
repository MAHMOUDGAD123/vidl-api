import { build } from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";
console.time("T");
build({
  entryNames: "",
  entryPoints: ["./src/index.ts"],
  outdir: "./dist",
  bundle: true,
  minify: true,
  sourcemap: false,
  platform: "node",
  target: ["node22"],
  format: "cjs",
  plugins: [nodeExternalsPlugin()],
  loader: {
    ".ts": "ts",
  },
})
  .then(() => {
    console.timeEnd("T");
    console.log("Built Successfully 🚀");
  })
  .catch((err) => {
    console.error("ESBuild Error:", err);
    process.exit(1);
  });
