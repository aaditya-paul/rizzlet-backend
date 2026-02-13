import { ConversationContext } from "../models/types.js";

/**
 * Generates prompt for analyzing conversation context
 */
export const getContextAnalysisPrompt = (
  conversation: ConversationContext,
): string => {
  return `You are an expert at analyzing dating and social conversations.

Analyze this conversation and provide insights:

1. Engagement Level (high/medium/low)
2. Detected Tone and Mood
3. Interest Signals (positive indicators from them)
4. Recommended Response Tone (safe/playful/flirty/bold)
5. Key Notes or Warnings

Be concise and actionable. Focus on helping the user respond effectively.`;
};

/**
 * Formats conversation for context analysis
 */
export const formatConversationForAnalysis = (
  conversation: ConversationContext,
): string => {
  const messages = conversation.messages
    .map((msg) => {
      const label = msg.sender === "user" ? "User" : "Other Person";
      return `${label}: ${msg.text}`;
    })
    .join("\n");

  const platform = conversation.platform
    ? `\nPlatform: ${conversation.platform}`
    : "";

  return `Conversation:${platform}\n${messages}\n\nProvide your analysis in JSON format with keys: engagement_level, tone_detected, interest_signals (array), recommended_tone, notes`;
};
