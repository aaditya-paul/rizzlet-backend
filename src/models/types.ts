// ============================================
// Type Definitions
// ============================================

export type ToneMode = "safe" | "playful" | "flirty" | "bold";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  request_type:
    | "reply_generation"
    | "conversation_analysis"
    | "ocr"
    | "conversation_starter";
  tokens_used: number;
  created_at: Date;
}

export interface ConversationMessage {
  sender: "user" | "other";
  text: string;
  timestamp?: string;
}

export interface ConversationContext {
  messages: ConversationMessage[];
  platform?: "tinder" | "instagram" | "whatsapp" | "imessage" | "other";
  metadata?: {
    engagement_level?: "high" | "medium" | "low";
    tone_detected?: string;
    interest_signals?: string[];
  };
}

export interface ReplyOption {
  text: string;
  tone: ToneMode;
  confidence: number;
  reasoning?: string;
}

export interface GenerateReplyRequest {
  conversation?: ConversationContext; // Structured conversation (legacy)
  conversationText?: string; // Raw text for AI parsing (new)
  userIdentifier?: string; // Optional: user's name to help AI identify who is who
  tone: ToneMode;
  count?: number; // Number of reply options to generate (default 3)
}

export interface GenerateReplyResponse {
  replies: ReplyOption[];
  context_analysis?: {
    engagement_level: string;
    recommended_tone: ToneMode;
    notes: string;
  };
}

export interface OCRRequest {
  image: string | Buffer; // base64 or buffer
}

export interface OCRResponse {
  text: string;
  confidence: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
}
