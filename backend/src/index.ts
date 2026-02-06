import express, { Request, Response } from "express";
import cors from "cors";
import apiRouter from "./routes/api";

import { init } from "./database/database";
import session from "express-session";
import MongoStore from "connect-mongo";
import apiRouter from "./routes/api";
import { init } from "./database/database";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const DATABASE_URI = process.env.DATABASE_URI

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
app.use("/api", apiRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API running 🚀" });
});

export default app; // ✅ export app for Supertest

// Only start server if running node directly
if (require.main === module) {
  init(process.env.DATABASE_URI!).then(() => {
    app.listen(port, () =>{}
//      console.log(`Server running at http://localhost:${port}`),
    );
		}).catch(error=>{
//		console.log("Could not init database. Have .env?")
		})
}
