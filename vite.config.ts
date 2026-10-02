import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import initiateHandler from "./api/payhero/initiate";
import statusHandler from "./api/payhero/status";

function payheroDevPlugin() {
  return {
    name: "payhero-dev-middleware",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url) return next();
        const url = req.url.split("?")[0];
        
        if (url === "/api/payhero/initiate" || url === "/api/stk-push") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          req.on("end", async () => {
            req.body = body;
            // mock res helper methods if missing in vite connect middleware
            if (!res.status) {
              res.status = (code: number) => {
                res.statusCode = code;
                return res;
              };
            }
            if (!res.json) {
              res.json = (data: any) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
                return res;
              };
            }
            try {
              await initiateHandler(req, res);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: false, message: String(err) }));
            }
          });
          return;
        }

        if (url === "/api/payhero/status" || url === "/api/payment-status") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          req.on("end", async () => {
            req.body = body;
            if (!res.status) {
              res.status = (code: number) => {
                res.statusCode = code;
                return res;
              };
            }
            if (!res.json) {
              res.json = (data: any) => {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
                return res;
              };
            }
            try {
              await statusHandler(req, res);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ status: "error", message: String(err) }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [payheroDevPlugin()],
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
