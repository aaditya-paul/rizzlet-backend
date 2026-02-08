import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/rizzlet",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
  },

  googleVision: {
    apiKey: process.env.GOOGLE_VISION_API_KEY || "",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  usage: {
    freeTierDailyLimit: parseInt(process.env.FREE_TIER_DAILY_LIMIT || "50", 10),
    freeTierMonthlyLimit: parseInt(
      process.env.FREE_TIER_MONTHLY_LIMIT || "1000",
      10,
    ),
  },
};
