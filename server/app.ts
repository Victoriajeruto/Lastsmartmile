import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

export async function getApp() {
  if (!initialized) {
    await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err);

      res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
      });
    });

    initialized = true;
  }

  return app;
}
