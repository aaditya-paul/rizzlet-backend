import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  extractTextFromImage,
  parseOCRConversation,
} from "../services/ocr.service";
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

    // Extract text using OCR
    console.log("\n🔍 [OCR] Starting text extraction...");
    const { text, confidence } = await extractTextFromImage(req.file.buffer);

    console.log("✅ [OCR] Text extraction completed");
    console.log(
      "📊 [OCR] Confidence score:",
      `${(confidence * 100).toFixed(2)}%`,
    );
    console.log("\n📝 [OCR] Extracted text:");
    console.log("─".repeat(80));
    console.log(text);
    console.log("─".repeat(80));

    // Parse conversation
    console.log("\n🔍 [OCR] Parsing conversation from extracted text...");
    const messages = parseOCRConversation(text);

    console.log("✅ [OCR] Conversation parsing completed");
    console.log(`📊 [OCR] Found ${messages.length} messages`);
    console.log("\n💬 [OCR] Parsed messages:");
    messages.forEach((msg, idx) => {
      console.log(`   [${idx + 1}] ${msg.sender}: ${msg.text}`);
    });
    console.log("=".repeat(80) + "\n");

    res.status(HTTP_STATUS.OK).json({
      text,
      confidence,
      messages,
      message_count: messages.length,
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
