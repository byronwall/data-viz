import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/components/ExplorEda.tsx"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  external: ["react"],
  treeshake: true,
});
