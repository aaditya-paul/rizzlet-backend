import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (apiKey && apiKey !== "your-google-ai-api-key-here") {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log("✓ Google Generative AI (Gemini) initialized successfully");
  } catch (error) {
    console.warn("⚠ Failed to initialize Google Generative AI:", error);
  }
} else {
  console.warn(
    "⚠ Google AI API key not configured. Gemini models will be unavailable. Set GOOGLE_AI_API_KEY in .env",
  );
}

export default genAI;
