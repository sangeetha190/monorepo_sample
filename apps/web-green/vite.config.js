// apps/web-red/vite.config.js
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@core": path.resolve(__dirname, "../../packages/frontend-core/src"),
        },
    },
    server: {
        fs: {
            allow: [".."], // allow reading files outside app root (monorepo)
        },
    },
});
