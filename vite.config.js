import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
      "@commands": "/src/commands",
      "@formatters": "/src/formatters",
      "@helpers": "/src/helpers",
    },
  },
});
