import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjsExternals from "vite-plugin-commonjs-externals";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjsExternals({
      externals: ["jsmediatags"],
    }),
  ],
});
