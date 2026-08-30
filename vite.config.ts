import { defineConfig } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
