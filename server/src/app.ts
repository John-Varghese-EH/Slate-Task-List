import path from "path";
import fs from "fs";
import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import taskRoutes from "./routes/tasks.routes";
import authRoutes from "./routes/auth.routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";

export const createApp = (): Application => {
  const app = express();

  // trust render reverse proxy headers
  app.set("trust proxy", 1);

  // secure http headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors((req, callback) => {
      const origin = req.headers.origin;
      const rawHost = (req.headers["x-forwarded-host"] || req.headers.host || "") as string;
      const reqHost = rawHost.split(":")[0].toLowerCase();

      // allow non-browser or same-origin without origin header
      if (!origin) {
        return callback(null, { origin: true, credentials: true });
      }

      try {
        const parsed = new URL(origin);
        const originHost = parsed.hostname.toLowerCase();

        // allow same host, local dev, render, or client url
        const isSameHost = Boolean(reqHost && originHost === reqHost);
        const isLocal = originHost === "localhost" || originHost === "127.0.0.1";
        const isRender = originHost.endsWith(".onrender.com");
        let isConfigured = false;
        if (env.CLIENT_URL) {
          try {
            isConfigured = originHost === new URL(env.CLIENT_URL).hostname.toLowerCase();
          } catch {}
        }

        if (isSameHost || isLocal || isRender || isConfigured) {
          return callback(null, { origin: true, credentials: true });
        }
      } catch {
        // ignore url parsing error
      }

      // reject untrusted third-party origins safely without 500
      callback(null, { origin: false });
    })
  );

  app.use(express.json({ limit: "20kb" }));
  app.use(cookieParser());

  // keepalive health endpoint for uptimerobot and monitoring
  app.all(["/health", "/api/health", "/ping"], (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).json({
      status: "ok",
      uptime: Math.floor(process.uptime()),
      timestamp: Date.now(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", apiLimiter, taskRoutes);

  const candidatePaths = [
    path.resolve(__dirname, "../../../client/dist"),
    path.resolve(__dirname, "../../client/dist"),
    path.resolve(process.cwd(), "client/dist"),
    path.resolve(process.cwd(), "../client/dist"),
  ];
  const clientDist = candidatePaths.find((p) => fs.existsSync(p));
  if (clientDist) {
    app.use(express.static(clientDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
