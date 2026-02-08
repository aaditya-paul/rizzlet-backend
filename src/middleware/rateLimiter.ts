import rateLimit from "express-rate-limit";
import { config } from "../config";

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for AI endpoints (more expensive)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: "AI request limit exceeded. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
