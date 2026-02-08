import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { extractConversationFromImage } from "../services/ocr.service";
import { HTTP_STATUS } from "../config/constants";

export const processImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      console.log("❌ [OCR Controller] No image file provided");
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "No image file provided",
      });
      return;
    }

    console.log("\n" + "=".repeat(80));
    console.log("📸 [OCR] Image upload received");
    console.log("=".repeat(80));
    console.log("📄 [Upload] File details:", {
      filename: req.file.originalname,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      mimeType: req.file.mimetype,
    });

    // Extract conversation using vision AI
    console.log("\n👁️  [OCR] Using vision AI to analyze chat screenshot...");
    const result = await extractConversationFromImage(req.file.buffer);

    console.log("\n✅ [OCR] Vision analysis completed");
    console.log("📱 [OCR] Platform detected:", result.platform);
    console.log(
      "📊 [OCR] Confidence score:",
      `${(result.confidence * 100).toFixed(2)}%`,
    );
    console.log(`💬 [OCR] Extracted ${result.messages.length} messages`);

    console.log("\n💬 [OCR] Messages by speaker:");
    result.messages.forEach((msg, idx) => {
      console.log(
        `   [${idx + 1}] ${msg.sender}: ${msg.text.slice(0, 60)}${msg.text.length > 60 ? "..." : ""}`,
      );
    });

    // Determine who sent the last message
    const lastMessage = result.messages[result.messages.length - 1];
    const lastMessageWasUser = lastMessage?.sender === "user";

    console.log("\n🎯 [OCR] Conversation perspective:");
    console.log("   Last message from:", lastMessage?.sender || "unknown");
    console.log(
      "   User needs to:",
      lastMessageWasUser ? "follow-up (continue)" : "reply (respond)",
    );
    console.log("=".repeat(80) + "\n");

    res.status(HTTP_STATUS.OK).json({
      conversation: {
        messages: result.messages,
        platform: result.platform,
      },
      lastMessageWasUser,
      confidence: result.confidence,
    });
  } catch (error: any) {
    console.error("\n❌ [OCR Controller] Error:", error);
    console.error("=".repeat(80) + "\n");
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: error.message || "Failed to process image",
    });
  }
};

export default {
  processImage,
};
