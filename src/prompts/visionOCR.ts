/**
 * Prompt for vision AI to analyze chat screenshots and extract conversation
 */

export const getVisionOCRPrompt = (): string => {
  return `You are analyzing a chat screenshot. Your task is to extract the conversation and identify who sent each message based on visual cues.

CRITICAL RULES FOR SPEAKER IDENTIFICATION:
1. **Left-aligned bubbles** = "other" person
2. **Right-aligned bubbles** = "user" (the phone owner)
3. **Different colors often indicate different senders:**
   - WhatsApp: Grey/white bubbles (left) = other, Green bubbles (right) = user
   - iMessage: Grey bubbles (left) = other, Blue bubbles (right) = user
   - Discord: Messages with different user avatars/names
4. **Handle consecutive messages:**
   - Multiple messages in a row from the same side = same sender
   - Example: 3 right-aligned messages = 3 "user" messages
5. **Ignore:**
   - <Media omitted>
   - System messages (e.g., "Messages are end-to-end encrypted")
   - Timestamps (but use them to understand message order)
   - Empty messages

PLATFORM DETECTION:
Try to identify the chat platform: whatsapp, imessage, discord, telegram, or other

OUTPUT FORMAT (JSON ONLY):
{
  "platform": "whatsapp",
  "messages": [
    {"sender": "other", "text": "Hey! How are you?"},
    {"sender": "other", "text": "Long time no see!"},
    {"sender": "user", "text": "Hey! I'm good!"},
    {"sender": "user", "text": "How about you?"}
  ],
  "confidence": 0.95
}

IMPORTANT:
- Return ONLY valid JSON, no explanatory text
- Preserve message order (top to bottom)
- Group consecutive messages correctly
- Use "sender": "user" for right-aligned (phone owner)
- Use "sender": "other" for left-aligned (other person)`;
};
