import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import apiRouter from "./routes/api";
import { init } from "./database/database";
import logger from "./utils/logger"; // HIIIIII
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const _DATABASE_URI = process.env.DATABASE_URI

// Middleware
if (process.env.NODE_ENV === "test") {
  app.use((req, _res, next) => {
    req.session = { userId: "000000000000000000000001" } as unknown;
    next();
  });
} else {
  app.use(
    session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URI!,
        ttl: 14 * 24 * 60 * 60,
      }),
    }),
  );
}

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"], credentials: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  logger.info("request.received", {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.session?.userId,
  });

  res.on("finish", () => {
    logger.info("request.completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.session?.userId,
    });
  });

  next();
});

app.use("/api", apiRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API IS running 🚀" });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error("request.failed", {
    method: req.method,
    path: req.originalUrl,
    userId: req.session?.userId,
    message: err.message,
    stack: err.stack,
  });
  if (res.headersSent) return;
  res.status(500).json({ message: "Something went wrong!" });
});

export default app; // ✅ export app for Supertest

// Only start server if running node directly
if (require.main === module) {
  init(process.env.DATABASE_URI!).then(() => {
    app.listen(port, () =>
      logger.info("server.started", { port }),
    );
  }).catch(error => {
    app.listen(port, () =>
      logger.info("server.started.without-db", { port }),
    );
    logger.error("database.init.failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  });
}
