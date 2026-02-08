/**
 * Prompts for AI-powered conversation parsing
 */

export const getConversationParsingPrompt = (
  userIdentifier?: string,
): string => {
  return `You are a conversation parser. Your job is to extract and structure messages from chat exports.

IMPORTANT RULES:
1. Identify who is the user and who is the other person
2. Skip <Media omitted>, system messages, timestamps without text, and empty messages
3. Return ONLY valid JSON, no explanatory text
4. Parse ANY chat format: WhatsApp, Discord, Telegram, SMS, etc.

USER IDENTIFICATION:
${userIdentifier ? `- The user is: "${userIdentifier}"` : "- Look for patterns to identify the user (usually appears more frequently or is mentioned in context)"}
- Everything else is from "other" person(s)

EXPECTED OUTPUT FORMAT:
{
  "messages": [
    { "sender": "user", "text": "message content" },
    { "sender": "other", "text": "message content" }
  ]
}

EXAMPLES:

Input: "2/8/26, 7:00 PM - June: Hey there!
2/8/26, 7:01 PM - Aaditya Paul: Hi! How are you?"

Output: {"messages":[{"sender":"other","text":"Hey there!"},{"sender":"user","text":"Hi! How are you!"}]}

Input: "June (Rubi Frnd): eita ki original
 Aaditya Paul: oroginal
 June (Rubi Frnd): <Media omitted>"

Output: {"messages":[{"sender":"other","text":"eita ki original"},{"sender":"user","text":"oroginal"}]}

Parse the conversation and return structured JSON.`;
};

export const getBatchedParsingAndReplyPrompt = (
  conversationText: string,
  tone: string,
  lastMessageWasUser: boolean = false,
  userIdentifier?: string,
): string => {
  const perspectiveInstruction = lastMessageWasUser
    ? "The LAST MESSAGE was sent by the USER. Generate follow-up messages to CONTINUE the conversation from the user's side."
    : "The LAST MESSAGE was sent by the OTHER PERSON. Generate replies for the user to RESPOND to them.";

  return `You are a dating coach AI assistant. Perform TWO tasks:

TASK 1: PARSE CONVERSATION
Parse this chat export and identify messages. Skip <Media omitted> and system messages.
${userIdentifier ? `The user is: "${userIdentifier}"` : "Identify who is the user based on context."}

CRITICAL: ${perspectiveInstruction}

TASK 2: GENERATE REPLIES
Based on the parsed conversation, generate 3 distinct reply suggestions in ${tone} tone.
${
  lastMessageWasUser
    ? "These should be FOLLOW-UP messages that continue what the user just said."
    : "These should be RESPONSES to what the other person just said."
}

Tone descriptions:
- safe: Friendly, respectful, low-risk
- playful: Light-hearted, fun, subtle humor
- flirty: Confident, charming, romantic interest
- bold: Direct, assertive, high-risk high-reward

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "parsed_conversation": {
    "messages": [
      {"sender": "user", "text": "..."},
      {"sender": "other", "text": "..."}
    ]
  },
  "replies": [
    "First reply suggestion",
    "Second reply suggestion",
    "Third reply suggestion"
  ]
}

RAW CONVERSATION:
${conversationText}

Return ONLY the JSON, no explanatory text.`;
};
