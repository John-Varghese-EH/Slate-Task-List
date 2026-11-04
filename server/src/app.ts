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

  const allowedOrigins = [
    env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        try {
          const parsed = new URL(origin);
          if (parsed.hostname.endsWith(".onrender.com") || parsed.hostname === "localhost") {
            return callback(null, true);
          }
        } catch {
          // ignore parsing error
        }
        callback(new Error("CORS origin denied"));
      },
      credentials: true,
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
