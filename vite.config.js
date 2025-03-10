import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  //Cho phép thằng vite dùng được process.env mặc định phải dùng import.meta.env
  define: {
    "process.env": process.env,
  },
  plugins: [react()],
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    alias: [{ find: "~", replacement: "/src" }],
  },
});
