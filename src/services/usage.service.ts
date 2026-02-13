import pool from "../config/database.js";
import { config } from "../config/index.js";
import { REQUEST_TYPES } from "../config/constants.js";
import { AppError } from "../middleware/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";

/**
 * Track a usage event
 */
export const trackUsage = async (
  userId: string,
  requestType: string,
  tokensUsed: number = 0,
): Promise<void> => {
  try {
    await pool.query(
      "INSERT INTO usage_records (user_id, request_type, tokens_used) VALUES ($1, $2, $3)",
      [userId, requestType, tokensUsed],
    );
  } catch (error) {
    console.error("Error tracking usage:", error);
    // Don't throw - usage tracking failure shouldn't break the request
  }
};

/**
 * Get user usage statistics
 */
export const getUserUsage = async (userId: string): Promise<any> => {
  try {
    // Daily usage
    const dailyResult = await pool.query(
      `SELECT COUNT(*) as count, SUM(tokens_used) as tokens 
       FROM usage_records 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '1 day'`,
      [userId],
    );

    // Monthly usage
    const monthlyResult = await pool.query(
      `SELECT COUNT(*) as count, SUM(tokens_used) as tokens 
       FROM usage_records 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`,
      [userId],
    );

    // Usage by type
    const byTypeResult = await pool.query(
      `SELECT request_type, COUNT(*) as count 
       FROM usage_records 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY request_type`,
      [userId],
    );

    return {
      daily: {
        count: parseInt(dailyResult.rows[0]?.count || "0"),
        tokens: parseInt(dailyResult.rows[0]?.tokens || "0"),
        limit: config.usage.freeTierDailyLimit,
      },
      monthly: {
        count: parseInt(monthlyResult.rows[0]?.count || "0"),
        tokens: parseInt(monthlyResult.rows[0]?.tokens || "0"),
        limit: config.usage.freeTierMonthlyLimit,
      },
      by_type: byTypeResult.rows,
    };
  } catch (error: any) {
    console.error("Error getting usage:", error);
    throw new AppError(
      "Failed to get usage stats",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Check if user has exceeded their quota
 */
export const checkQuota = async (userId: string): Promise<boolean> => {
  try {
    const usage = await getUserUsage(userId);

    if (usage.daily.count >= config.usage.freeTierDailyLimit) {
      throw new AppError(
        "Daily usage limit exceeded",
        HTTP_STATUS.TOO_MANY_REQUESTS,
      );
    }

    if (usage.monthly.count >= config.usage.freeTierMonthlyLimit) {
      throw new AppError(
        "Monthly usage limit exceeded",
        HTTP_STATUS.TOO_MANY_REQUESTS,
      );
    }

    return true;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Failed to check quota",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

export default {
  trackUsage,
  getUserUsage,
  checkQuota,
};
