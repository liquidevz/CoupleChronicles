import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();

// Register all routes
registerRoutes(app).then(() => {
  console.log('Routes registered');
}).catch(console.error);

export default app;