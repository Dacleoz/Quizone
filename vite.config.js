import { resolve } from "node:path";
import { defineConfig } from "vite";

const page = (name) => resolve(import.meta.dirname, "src", name);

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 700, // Firestore SDK alone is ~550 kB
    rolldownOptions: { input: { index: page("index.html"), host: page("host.html"), instruction: page("instruction.html") } },
  },
});
