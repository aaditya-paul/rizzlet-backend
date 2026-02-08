/**
 * Generates prompt for conversation starters
 */
export const getConversationStarterPrompt = (context?: {
  platform?: string;
  profile_info?: string;
  tone?: string;
}): string => {
  const platform = context?.platform || "a dating app";
  const profileInfo = context?.profile_info
    ? `\n\nProfile Information:\n${context.profile_info}`
    : "";
  const tone = context?.tone || "playful";

  return `You are Rizzlet, an AI texting copilot.

Generate 5 conversation starter messages for ${platform}.${profileInfo}

Requirements:
- Tone: ${tone}
- Short and punchy (1-2 sentences max)
- Specific and personalized (avoid generic "hey" or "hi")
- High chance of getting a response
- Natural and authentic

Provide 5 distinct openers, each using a different approach (question, observation, playful tease, shared interest, creative).`;
};
