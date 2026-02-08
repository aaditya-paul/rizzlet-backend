import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { generateReplies } from "../services/ai.service";
import { trackUsage, checkQuota } from "../services/usage.service";
import { GenerateReplyRequest } from "../models/types";
import { HTTP_STATUS, REQUEST_TYPES } from "../config/constants";

export const generateReply = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    // Check quota
    await checkQuota(userId);

    const request: GenerateReplyRequest = req.body;

    if (!request.conversation || !request.tone) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Conversation and tone are required",
      });
      return;
    }

    // Generate replies
    const result = await generateReplies(request);

    // Track usage
    await trackUsage(userId, REQUEST_TYPES.REPLY_GENERATION);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: error.message || "Failed to generate replies",
    });
  }
};

export default {
  generateReply,
};
