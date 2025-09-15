import express from "express";
import { registerRoutes } from "../server/routes";

// Vercel serverless function entry
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes only (no Vite middleware here)
registerRoutes(app as any);

export default app;

