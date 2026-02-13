import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { generateReplies } from "../services/ai.service.js";
import { trackUsage, checkQuota } from "../services/usage.service.js";
import { GenerateReplyRequest } from "../models/types.js";
import { HTTP_STATUS, REQUEST_TYPES } from "../config/constants.js";

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

    console.log("\n📨 [Reply Controller] Raw request body:");
    console.log(JSON.stringify(req.body, null, 2));

    const request: GenerateReplyRequest = req.body;

    // Validate request
    if (!request.tone) {
      console.log("❌ [Reply Controller] Validation failed: missing tone");
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Tone is required",
      });
      return;
    }

    if (!request.conversation && !request.conversationText) {
      console.log(
        "❌ [Reply Controller] Validation failed: missing conversation data",
      );
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Either 'conversation' or 'conversationText' is required",
      });
      return;
    }

    // Determine which function to use
    let result;

    if (request.conversationText) {
      // Use batched parsing for raw text
      console.log(
        "\n📨 [Reply Controller] Using BATCHED parsing + reply generation",
      );
      console.log("   User ID:", userId);
      console.log("   Tone:", request.tone);
      console.log("   Text length:", request.conversationText.length);
      console.log(
        "   User identifier:",
        request.userIdentifier || "auto-detect",
      );
      console.log("   Requested replies:", request.count || 3);

      const { parseAndGenerateReplies } =
        await import("../services/ai.service.js");
      result = await parseAndGenerateReplies(request);
    } else {
      // Use traditional structured conversation
      console.log("\n📨 [Reply Controller] Using STRUCTURED conversation");
      console.log("   User ID:", userId);
      console.log("   Tone:", request.tone);
      console.log("   Conversation object:", request.conversation);
      console.log(
        "   Message count:",
        request.conversation?.messages?.length || 0,
      );
      console.log("   Requested replies:", request.count || 3);

      if (
        request.conversation?.messages &&
        request.conversation.messages.length > 0
      ) {
        console.log("\n💬 [Reply Controller] Messages received:");
        request.conversation.messages.forEach((msg, idx) => {
          console.log(`   [${idx + 1}] ${msg.sender}: ${msg.text}`);
        });
      } else {
        console.log(
          "⚠️  [Reply Controller] WARNING: No messages in conversation!",
        );
      }

      result = await generateReplies(request);
    }

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
