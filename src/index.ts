import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { initDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";

// Import routes
import authRoutes from "./routes/auth.routes";
import replyRoutes from "./routes/reply.routes";
import usageRoutes from "./routes/usage.routes";
import ocrRoutes from "./routes/ocr.routes";

const app: Application = express();

// ============================================
// Middleware
// ============================================

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin:
      config.nodeEnv === "production"
        ? ["https://yourdomain.com"] // Update with your frontend domain
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5432",
          ],
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use("/api/", apiLimiter);

// ============================================
// Routes
// ============================================

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/replies", replyRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/ocr", ocrRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================
// Server Initialization
// ============================================

const startServer = async () => {
  try {
    // Initialize database
    const dbConnected = await initDatabase();

    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Rizzlet Backend running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌍 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
