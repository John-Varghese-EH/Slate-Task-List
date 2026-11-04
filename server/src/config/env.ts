import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET || "slate-enterprise-jwt-secret-key-2026";

if (nodeEnv === "production" && jwtSecret === "slate-enterprise-jwt-secret-key-2026") {
  // warn on default secret in production
  console.warn("warning: default jwt secret used in production");
}

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: nodeEnv,
  DATABASE_URL: process.env.DATABASE_URL || "file:../data/tasks.db",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  JWT_SECRET: jwtSecret,
  SESSION_MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000,
};
