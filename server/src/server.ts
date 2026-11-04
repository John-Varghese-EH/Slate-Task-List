import path from "path";
import fs from "fs";
import { createApp } from "./app";
import { env } from "./config/env";

// ensure sqlite storage directory exists
const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = createApp();

// bind to all network interfaces for container deployment
app.listen(env.PORT, "0.0.0.0", () => {
  process.stdout.write(`Server listening on port ${env.PORT}\n`);
});

// internal keepalive self ping when deployed on render
const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
if (keepAliveUrl && env.NODE_ENV === "production") {
  const intervalMs = 14 * 60 * 1000;
  setInterval(async () => {
    try {
      const pingUrl = `${keepAliveUrl.replace(/\/$/, "")}/health`;
      await fetch(pingUrl, { method: "GET" });
    } catch {
      // ignore self ping error
    }
  }, intervalMs);
}
