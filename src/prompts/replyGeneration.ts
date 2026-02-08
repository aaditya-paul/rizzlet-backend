import { ToneMode, ConversationContext } from "../models/types";
import { TONE_DESCRIPTIONS } from "../config/constants";

/**
 * Generates system prompt for reply generation based on tone
 */
export const getReplyGenerationPrompt = (
  tone: ToneMode,
  conversation: ConversationContext,
): string => {
  const toneDescription = TONE_DESCRIPTIONS[tone];
  const platformContext = conversation.platform
    ? `This conversation is from ${conversation.platform}.`
    : "";

  return `You are Rizzlet, an AI texting copilot specialized in dating and social conversations.

Your task is to analyze the conversation and generate ${tone} replies.

Tone: ${tone} - ${toneDescription}

${platformContext}

Guidelines:
- Generate short, natural replies that someone would actually send
- Match the conversation's vibe and energy level
- Keep replies under 2-3 sentences maximum
- Avoid generic responses - be specific and contextual
- Sound human, not robotic
- Consider the flow and timing of messages
- For ${tone} tone, ${getToneSpecificGuidance(tone)}

Analyze the conversation and provide 3 distinct reply options, each slightly different in approach but all matching the ${tone} tone.`;
};

const getToneSpecificGuidance = (tone: ToneMode): string => {
  switch (tone) {
    case "safe":
      return "be friendly and respectful. Avoid anything that could be misinterpreted. Keep it light and engaging.";
    case "playful":
      return "add subtle humor and personality. Be fun but not overly forward. Show interest through lighthearted banter.";
    case "flirty":
      return "be confident and show clear romantic interest. Use charm and compliments naturally. Be bold but not aggressive.";
    case "bold":
      return "be direct and assertive. Make your intentions clear. Take confident risks. This is for decisive moves.";
  }
};

/**
 * Formats conversation history for the LLM
 */
export const formatConversationForPrompt = (
  conversation: ConversationContext,
): string => {
  const messages = conversation.messages
    .map((msg) => {
      const label = msg.sender === "user" ? "You" : "Them";
      const timestamp = msg.timestamp ? ` (${msg.timestamp})` : "";
      return `${label}${timestamp}: ${msg.text}`;
    })
    .join("\n");

  return `Conversation:\n${messages}\n\nNow generate 3 reply options:`;
};
