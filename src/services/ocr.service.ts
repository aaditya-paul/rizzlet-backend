import Tesseract from "tesseract.js";
import sharp from "sharp";

/**
 * Extracts text from an image buffer using Tesseract OCR
 */
export const extractTextFromImage = async (
  imageBuffer: Buffer,
): Promise<{ text: string; confidence: number }> => {
  try {
    console.log("🖼️  [OCR Service] Preprocessing image...");
    // Optimize image for OCR
    const processedImage = await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .toBuffer();

    console.log("✅ [OCR Service] Image preprocessed (greyscale + normalized)");

    // Perform OCR
    console.log("🔍 [OCR Service] Running Tesseract OCR...");
    const result = await Tesseract.recognize(processedImage, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`   OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = result.data.text.trim();
    const confidence = result.data.confidence / 100; // Normalize to 0-1

    console.log("✅ [OCR Service] Text recognition complete");

    return { text, confidence };
  } catch (error: any) {
    console.error("❌ [OCR Service] OCR Error:", error);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

/**
 * Parses conversation from OCR text
 * Attempts to identify message boundaries and speakers
 */
export const parseOCRConversation = (
  text: string,
): Array<{ sender: "user" | "other"; text: string }> => {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const messages: Array<{ sender: "user" | "other"; text: string }> = [];

  for (const line of lines) {
    // Skip very short lines (likely noise)
    if (line.trim().length < 3) continue;

    // Try to detect speaker indicators
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes("you:") || lowerLine.includes("me:")) {
      const text = line.substring(line.indexOf(":") + 1).trim();
      if (text) {
        messages.push({ sender: "user", text });
      }
    } else if (lowerLine.includes("them:") || lowerLine.includes("other:")) {
      const text = line.substring(line.indexOf(":") + 1).trim();
      if (text) {
        messages.push({ sender: "other", text });
      }
    } else {
      // If no clear indicator, treat as other person's message
      messages.push({ sender: "other", text: line.trim() });
    }
  }

  return messages;
};

export default {
  extractTextFromImage,
  parseOCRConversation,
};
