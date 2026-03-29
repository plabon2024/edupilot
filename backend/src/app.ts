import cors from "cors";
import express, { Application } from "express";

import cookieParser from "cookie-parser";
import { envVars } from "./app/config";
import globalErrorHandler from "./app/middleware/globalErrorhandler";
import notFound from "./app/middleware/notFound";
import router from "./app/routes";
import { auth } from "./app/lib/auth";
import { toNodeHandler } from "better-auth/node";
import path from "path";

const app: Application = express();

app.use((req, res, next) => {
  if (req.originalUrl.includes("/api/v1/payments/webhook") || req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Stripe webhook route exactly as requested
import { PaymentController } from "./app/module/payment/payment.controller";
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/app/templates"));
// CORS — allow frontend origin with credentials (cookies)
const allowedOrigins = envVars.FRONTEND_URL
  ? [envVars.FRONTEND_URL]
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use("/api/v1", router);
// Application routes
app.all("/api/v1/*splat", toNodeHandler(auth));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/auth", toNodeHandler(auth));
app.get("/", (_req, res) => {
  res.status(200).json({ message: "EduPilot API is running." });
});

// 404
app.use(notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
