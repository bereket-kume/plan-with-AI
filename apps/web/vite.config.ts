import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const monorepoRoot = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../..",
);

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@plan-with-ai/utils": path.join(
        monorepoRoot,
        "packages/utils/src/index.ts",
      ),
      "@plan-with-ai/ui-components": path.join(
        monorepoRoot,
        "packages/ui-components/src/index.ts",
      ),
      "@plan-with-ai/feature-student": path.join(
        monorepoRoot,
        "packages/feature-student/src/index.ts",
      ),
      "@plan-with-ai/feature-system": path.join(
        monorepoRoot,
        "packages/feature-system/src/index.ts",
      ),
    },
  },
});
