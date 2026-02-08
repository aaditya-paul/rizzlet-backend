import groq from "../config/llama";
import { GROQ_MODELS } from "../config/constants";
import {
  ToneMode,
  ConversationContext,
  ReplyOption,
  GenerateReplyRequest,
  GenerateReplyResponse,
} from "../models/types";
import {
  getReplyGenerationPrompt,
  formatConversationForPrompt,
} from "../prompts/replyGeneration";
import {
  getContextAnalysisPrompt,
  formatConversationForAnalysis,
} from "../prompts/contextAnalysis";

/**
 * Determines which model to use based on query complexity
 */
const selectModel = (isComplex: boolean = false): string => {
  return isComplex ? GROQ_MODELS.POWERFUL : GROQ_MODELS.FAST;
};

/**
 * Generates reply suggestions using Llama models
 */
export const generateReplies = async (
  request: GenerateReplyRequest,
): Promise<GenerateReplyResponse> => {
  try {
    const systemPrompt = getReplyGenerationPrompt(
      request.tone,
      request.conversation,
    );
    const userMessage = formatConversationForPrompt(request.conversation);
    const count = request.count || 3;

    // Use fast model for simple reply generation
    const model = selectModel(false);

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8, // Higher creativity for diverse replies
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Parse the response to extract reply options
    const replies = parseReplyOptions(responseText, request.tone, count);

    return {
      replies,
      context_analysis: {
        engagement_level: "medium", // TODO: implement proper analysis
        recommended_tone: request.tone,
        notes: "Generated successfully",
      },
    };
  } catch (error: any) {
    console.error("Error generating replies:", error);
    throw new Error(`Failed to generate replies: ${error.message}`);
  }
};

/**
 * Analyzes conversation context and provides insights
 */
export const analyzeConversation = async (
  conversation: ConversationContext,
): Promise<any> => {
  try {
    const systemPrompt = getContextAnalysisPrompt(conversation);
    const userMessage = formatConversationForAnalysis(conversation);

    // Use powerful model for complex analysis
    const model = selectModel(true);

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3, // Lower temperature for more factual analysis
      max_tokens: 400,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Try to parse as JSON, fallback to text analysis
    try {
      const analysis = JSON.parse(responseText);
      return analysis;
    } catch {
      return {
        engagement_level: "medium",
        notes: responseText,
      };
    }
  } catch (error: any) {
    console.error("Error analyzing conversation:", error);
    throw new Error(`Failed to analyze conversation: ${error.message}`);
  }
};

/**
 * Parses LLM response to extract individual reply options
 */
const parseReplyOptions = (
  responseText: string,
  tone: ToneMode,
  count: number,
): ReplyOption[] => {
  // Split by newlines and filter out empty lines
  const lines = responseText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const replies: ReplyOption[] = [];

  for (const line of lines) {
    // Remove numbering like "1.", "Option 1:", etc.
    const cleanedLine = line
      .replace(/^\d+[\.\):\-]\s*/, "")
      .replace(/^Option\s+\d+[\:\-]\s*/i, "")
      .replace(/^Reply\s+\d+[\:\-]\s*/i, "")
      .trim();

    // Skip system messages or very short responses
    if (cleanedLine.length < 10 || cleanedLine.startsWith("Here are")) {
      continue;
    }

    // Remove quotes if the entire line is wrapped in them
    let finalText = cleanedLine;
    if (
      (finalText.startsWith('"') && finalText.endsWith('"')) ||
      (finalText.startsWith("'") && finalText.endsWith("'"))
    ) {
      finalText = finalText.slice(1, -1);
    }

    replies.push({
      text: finalText,
      tone,
      confidence: 0.8, // Default confidence
    });

    if (replies.length >= count) {
      break;
    }
  }

  // Fallback if parsing failed
  if (replies.length === 0) {
    replies.push({
      text: responseText.slice(0, 200), // First 200 chars as fallback
      tone,
      confidence: 0.5,
    });
  }

  return replies.slice(0, count);
};

export default {
  generateReplies,
  analyzeConversation,
};
