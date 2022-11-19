import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@src": "/src",
      "@commands": "/src/commands",
      "@formatters": "/src/formatters",
      "@helpers": "/src/helpers",
    },
  },
});
