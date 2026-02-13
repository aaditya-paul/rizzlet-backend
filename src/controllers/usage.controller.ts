import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { getUserUsage } from "../services/usage.service.js";
import { HTTP_STATUS } from "../config/constants.js";

export const getUsageStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const stats = await getUserUsage(userId);

    res.status(HTTP_STATUS.OK).json(stats);
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: error.message || "Failed to get usage stats",
    });
  }
};

export default {
  getUsageStats,
};
