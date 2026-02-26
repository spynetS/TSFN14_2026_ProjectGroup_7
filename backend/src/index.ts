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

app.use((req: request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, _next) => {
  logger.error(err.stack); // Log the error stack
  res.status(500).send('Something went wrong!');
});


app.use("/api", apiRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API running 🚀" });
});

export default app; // ✅ export app for Supertest

const connectDatabase = (times) => {

		if (times > 10){
				return;
		}

		times ++;
		logger.info("Connecting to mongodb");
		init(process.env.DATABASE_URI!).then(() => {
				app.listen(port, () =>
						logger.info(`Server running at ${port}`),
				);
		}).catch(error => {
				logger.error("Could not init database. retying", error);
				connectDatabase(times)
		});
}

// Only start server if running node directly
if (require.main === module) {
		connectDatabase();
}
