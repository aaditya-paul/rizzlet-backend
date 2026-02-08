import Groq from "groq-sdk";
import { config } from "./index";

if (!config.groq.apiKey) {
  console.warn("⚠️  GROQ_API_KEY is not set. AI features will not work.");
}

export const groq = new Groq({
  apiKey: config.groq.apiKey,
});

export default groq;
