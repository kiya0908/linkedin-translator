import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig(({ command }) => {
  const useCloudflareRuntime =
    command === "build" || process.env.CLOUDFLARE_DEV === "1";

  return {
    plugins: [
      ...(useCloudflareRuntime
        ? [cloudflare({ viteEnvironment: { name: "ssr" } })]
        : []),
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
    ],
    resolve: useCloudflareRuntime
      ? undefined
      : {
          alias: {
            "cloudflare:workers": path.resolve(
              __dirname,
              "app/.server/shims/cloudflare-workers.ts"
            ),
          },
        },
    server: {
      host: "0.0.0.0",
      allowedHosts: [
        "prefamiliarly-grippy-hermila.ngrok-free.app",
        ".ngrok-free.app",
      ],
    },
  };
});
