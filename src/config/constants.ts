export const GROQ_MODELS = {
  FAST: "llama-3.1-8b-instant", // Primary model for most requests
  POWERFUL: "llama-3.1-70b-versatile", // Fallback for complex queries
};

export const TONE_DESCRIPTIONS = {
  safe: "Friendly, respectful, and low-risk. Good for early conversations.",
  playful:
    "Light-hearted, fun, with subtle humor. Shows personality without heavy flirting.",
  flirty:
    "Confident, charming, with clear romantic interest. Bold but not aggressive.",
  bold: "Direct, assertive, high-risk high-reward. For confident moves and escalation.",
};

export const REQUEST_TYPES = {
  REPLY_GENERATION: "reply_generation",
  CONVERSATION_ANALYSIS: "conversation_analysis",
  OCR: "ocr",
  CONVERSATION_STARTER: "conversation_starter",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
