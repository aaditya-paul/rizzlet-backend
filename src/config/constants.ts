export const AI_PROVIDERS = {
  GEMINI: "gemini",
  GROQ: "groq",
} as const;

export const GEMINI_MODELS = {
  FLASH: "gemini-2.5-flash", // Primary model - fast and efficient
  FLASH_LITE: "gemini-2.5-flash-lite", // Fallback Gemini model - lighter/cheaper
  FLASH_VISION: "gemini-2.5-flash", // Vision model for image analysis
};

export const GROQ_MODELS = {
  FAST: "llama-3.1-8b-instant", // Secondary model for most requests
  POWERFUL: "llama-3.1-70b-versatile", // Fallback for complex queries
  VISION_90B: "llama-3.2-90b-vision-preview", // Vision model - 90B
  VISION_11B: "meta-llama/llama-4-scout-17b-16e-instruct", // Vision model - 11B (fallback)
};

// Provider priority for text generation: Gemini Flash -> Gemini Flash-Lite -> Groq Powerful -> Groq Fast
export const MODEL_PRIORITY = [
  { provider: AI_PROVIDERS.GEMINI, model: GEMINI_MODELS.FLASH },
  { provider: AI_PROVIDERS.GEMINI, model: GEMINI_MODELS.FLASH_LITE },
  { provider: AI_PROVIDERS.GROQ, model: GROQ_MODELS.POWERFUL },
  { provider: AI_PROVIDERS.GROQ, model: GROQ_MODELS.FAST },
];

// Provider priority for vision/OCR tasks: Gemini Vision -> Gemini Flash-Lite -> Groq Vision 90B -> Groq Vision 11B
export const VISION_MODEL_PRIORITY = [
  { provider: AI_PROVIDERS.GEMINI, model: GEMINI_MODELS.FLASH_VISION },
  { provider: AI_PROVIDERS.GEMINI, model: GEMINI_MODELS.FLASH_LITE },
  { provider: AI_PROVIDERS.GROQ, model: GROQ_MODELS.VISION_90B },
  { provider: AI_PROVIDERS.GROQ, model: GROQ_MODELS.VISION_11B },
];

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
