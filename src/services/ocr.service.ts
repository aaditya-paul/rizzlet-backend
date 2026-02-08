import groq from "../config/llama";
import genAI from "../config/gemini";
import { AI_PROVIDERS, VISION_MODEL_PRIORITY } from "../config/constants";
import { getVisionOCRPrompt } from "../prompts/visionOCR";
import sharp from "sharp";

interface VisionOCRResult {
  platform: string;
  messages: Array<{ sender: "user" | "other"; text: string }>;
  confidence: number;
}

/**
 * Extract conversation from image using vision AI with fallback
 * Optimized for cost: compresses image and uses free tier friendly models
 */
export const extractConversationFromImage = async (
  imageBuffer: Buffer,
): Promise<VisionOCRResult> => {
  console.log("\n" + "=".repeat(80));
  console.log("👁️  [VISION OCR] Starting vision-based conversation extraction");
  console.log("=".repeat(80));

  try {
    // Compress image to save costs (vision models charge per token/pixel)
    console.log(
      "📏 [Image Optimization] Original size:",
      (imageBuffer.length / 1024).toFixed(2),
      "KB",
    );

    const compressedImage = await sharp(imageBuffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true }) // Max 1200px
      .jpeg({ quality: 80 }) // Compress to JPEG
      .toBuffer();

    console.log(
      "✅ [Image Optimization] Compressed size:",
      (compressedImage.length / 1024).toFixed(2),
      "KB",
    );
    console.log(
      "💰 [Cost Savings] Reduced by:",
      ((1 - compressedImage.length / imageBuffer.length) * 100).toFixed(1),
      "%",
    );

    const base64Image = compressedImage.toString("base64");
    const prompt = getVisionOCRPrompt();

    // Try each vision model in priority order
    for (const { provider, model } of VISION_MODEL_PRIORITY) {
      try {
        console.log(
          `\n🔄 [Vision OCR] Attempting provider: ${provider}, model: ${model}`,
        );

        if (provider === AI_PROVIDERS.GEMINI) {
          if (!genAI) {
            console.log("⚠️  [Vision OCR] Gemini not configured, skipping");
            continue;
          }

          const visionModel = genAI.getGenerativeModel({ model });

          const result = await visionModel.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Image,
                mimeType: "image/jpeg",
              },
            },
          ]);

          const responseText = result.response.text();
          console.log("\n📥 [Gemini Vision] Raw response:");
          console.log("─".repeat(80));
          console.log(responseText);
          console.log("─".repeat(80));

          const parsed = parseVisionResponse(responseText);
          console.log(`✅ [Vision OCR] Success with ${provider}/${model}`);
          console.log(
            `📊 [Vision OCR] Extracted ${parsed.messages.length} messages`,
          );

          return parsed;
        } else if (provider === AI_PROVIDERS.GROQ) {
          const response = await groq.chat.completions.create({
            model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text" as const, text: prompt },
                  {
                    type: "image_url" as const,
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ] as any, // Groq's types might not be fully updated for vision
              },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          });

          const responseText = response.choices[0]?.message?.content || "";
          console.log("\n📥 [Groq Vision] Raw response:");
          console.log("─".repeat(80));
          console.log(responseText);
          console.log("─".repeat(80));

          const parsed = parseVisionResponse(responseText);
          console.log(`✅ [Vision OCR] Success with ${provider}/${model}`);
          console.log(
            `📊 [Vision OCR] Extracted ${parsed.messages.length} messages`,
          );

          return parsed;
        }
      } catch (error: any) {
        console.error(
          `❌ [Vision OCR] ${provider}/${model} failed:`,
          error.message,
        );
        // Continue to next model
      }
    }

    throw new Error("All vision models failed");
  } catch (error: any) {
    console.error("\n❌ [VISION OCR] Error:", error);
    console.error("=".repeat(80) + "\n");
    throw new Error(`Vision OCR failed: ${error.message}`);
  }
};

/**
 * Parse vision AI response into structured format
 */
const parseVisionResponse = (responseText: string): VisionOCRResult => {
  try {
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in vision response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsed.messages || !Array.isArray(parsed.messages)) {
      throw new Error("Invalid response structure: missing messages array");
    }

    console.log("\n🔍 [Vision Parse] Extracted conversation:");
    parsed.messages.forEach((msg: any, idx: number) => {
      console.log(`   [${idx + 1}] ${msg.sender}: ${msg.text}`);
    });

    return {
      platform: parsed.platform || "unknown",
      messages: parsed.messages,
      confidence: parsed.confidence || 0.8,
    };
  } catch (error: any) {
    console.error("❌ [Vision Parse] Failed to parse response:", error.message);
    throw new Error("Failed to parse vision AI response");
  }
};

export default {
  extractConversationFromImage,
};
