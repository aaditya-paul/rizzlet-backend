import groq from "../config/llama";
import genAI from "../config/gemini";
import {
  AI_PROVIDERS,
  GEMINI_MODELS,
  MODEL_PRIORITY,
} from "../config/constants";
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
 * Call AI model with automatic fallback support
 */
const callAIWithFallback = async (
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number,
): Promise<{ text: string; provider: string; model: string }> => {
  console.log("\n🤖 [AI Service] Starting AI call with fallback chain");
  console.log("📊 [AI Service] Parameters:", {
    temperature,
    maxTokens,
    systemPromptLength: systemPrompt.length,
    userMessageLength: userMessage.length,
  });

  for (const { provider, model } of MODEL_PRIORITY) {
    try {
      console.log(
        `\n🔄 [AI Service] Attempting provider: ${provider}, model: ${model}`,
      );

      if (provider === AI_PROVIDERS.GEMINI) {
        if (!genAI) {
          console.log("⚠️  [AI Service] Gemini not configured, skipping");
          continue;
        }

        console.log("📤 [AI Service] Sending prompt to Gemini:");
        console.log("   System Prompt:", systemPrompt.slice(0, 200) + "...");
        console.log("   User Message:", userMessage.slice(0, 200) + "...");

        const geminiModel = genAI.getGenerativeModel({ model });
        const result = await geminiModel.generateContent([
          `System: ${systemPrompt}\n\nUser: ${userMessage}`,
        ]);
        const response = await result.response;
        const text = response.text();

        console.log("✅ [AI Service] Gemini response received");
        console.log("📊 [AI Service] Response stats:", {
          provider,
          model,
          responseLength: text.length,
          responsePreview: text.slice(0, 150) + "...",
        });

        return { text, provider, model };
      } else if (provider === AI_PROVIDERS.GROQ) {
        console.log("📤 [AI Service] Sending prompt to Groq:");
        console.log("   System Prompt:", systemPrompt.slice(0, 200) + "...");
        console.log("   User Message:", userMessage.slice(0, 200) + "...");

        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature,
          max_tokens: maxTokens,
        });

        const text = completion.choices[0]?.message?.content || "";

        console.log("✅ [AI Service] Groq response received");
        console.log("📊 [AI Service] Response stats:", {
          provider,
          model,
          responseLength: text.length,
          tokensUsed: completion.usage?.total_tokens || "N/A",
          responsePreview: text.slice(0, 150) + "...",
        });

        return { text, provider, model };
      }
    } catch (error: any) {
      console.error(
        `❌ [AI Service] ${provider}/${model} failed:`,
        error.message,
      );
      // Continue to next provider
    }
  }

  throw new Error("All AI providers failed");
};

/**
 * Generates reply suggestions using available AI models
 */
export const generateReplies = async (
  request: GenerateReplyRequest,
): Promise<GenerateReplyResponse> => {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 [REPLY GENERATION] Starting new reply generation request");
  console.log("=".repeat(80));

  try {
    // Validate that we have a conversation context
    if (!request.conversation) {
      throw new Error(
        "Conversation context is required for this function. Use parseAndGenerateReplies for raw text.",
      );
    }

    console.log("📝 [Input] Request details:", {
      tone: request.tone,
      conversationLength: request.conversation.messages.length,
      requestedCount: request.count || 3,
    });

    // Log conversation context
    console.log("\n💬 [Conversation Context]:");
    request.conversation.messages.forEach((msg, idx) => {
      console.log(
        `   [${idx + 1}] ${msg.sender}: ${msg.text.slice(0, 100)}${msg.text.length > 100 ? "..." : ""}`,
      );
    });

    const systemPrompt = getReplyGenerationPrompt(
      request.tone,
      request.conversation,
    );
    const userMessage = formatConversationForPrompt(request.conversation);
    const count = request.count || 3;

    console.log("\n🎯 [Prompt] Selected tone:", request.tone);
    console.log("📋 [Prompt] Full system prompt:");
    console.log("─".repeat(80));
    console.log(systemPrompt);
    console.log("─".repeat(80));
    console.log("\n📋 [Prompt] Formatted conversation for AI:");
    console.log("─".repeat(80));
    console.log(userMessage);
    console.log("─".repeat(80));

    const {
      text: responseText,
      provider,
      model,
    } = await callAIWithFallback(
      systemPrompt,
      userMessage,
      0.8, // Higher creativity for diverse replies
      500,
    );

    console.log("\n📥 [AI Response] Full response:");
    console.log("─".repeat(80));
    console.log(responseText);
    console.log("─".repeat(80));
    console.log(`✨ [AI Response] Provider: ${provider}, Model: ${model}`);

    // Parse the response to extract reply options
    const replies = parseReplyOptions(responseText, request.tone, count);

    console.log("\n🎁 [Output] Parsed replies:");
    replies.forEach((reply, idx) => {
      console.log(`   [${idx + 1}] (${reply.confidence}) ${reply.text}`);
    });

    console.log("\n✅ [REPLY GENERATION] Request completed successfully");
    console.log("=".repeat(80) + "\n");

    return {
      replies,
      context_analysis: {
        engagement_level: "medium",
        recommended_tone: request.tone,
        notes: `Generated by ${provider}/${model}`,
      },
    };
  } catch (error: any) {
    console.error("\n❌ [REPLY GENERATION] Error:", error);
    console.error("=".repeat(80) + "\n");
    throw new Error(`Failed to generate replies: ${error.message}`);
  }
};

/**
 * Analyzes conversation context and provides insights
 */
export const analyzeConversation = async (
  conversation: ConversationContext,
): Promise<any> => {
  console.log("\n" + "=".repeat(80));
  console.log("🔍 [CONVERSATION ANALYSIS] Starting analysis");
  console.log("=".repeat(80));

  try {
    console.log("💬 [Input] Conversation:", {
      messageCount: conversation.messages.length,
      participants: [...new Set(conversation.messages.map((m) => m.sender))],
    });

    const systemPrompt = getContextAnalysisPrompt(conversation);
    const userMessage = formatConversationForAnalysis(conversation);

    console.log("\n📋 [Prompt] Analysis prompt:");
    console.log("─".repeat(80));
    console.log(systemPrompt);
    console.log("─".repeat(80));

    const {
      text: responseText,
      provider,
      model,
    } = await callAIWithFallback(
      systemPrompt,
      userMessage,
      0.3, // Lower temperature for more factual analysis
      400,
    );

    console.log("\n📥 [AI Response] Analysis result:");
    console.log("─".repeat(80));
    console.log(responseText);
    console.log("─".repeat(80));

    // Try to parse as JSON, fallback to text analysis
    try {
      const analysis = JSON.parse(responseText);
      console.log("✅ [CONVERSATION ANALYSIS] Completed successfully (JSON)");
      console.log("=".repeat(80) + "\n");
      return analysis;
    } catch {
      console.log(
        "ℹ️  [CONVERSATION ANALYSIS] Response was not JSON, using text format",
      );
      console.log("=".repeat(80) + "\n");
      return {
        engagement_level: "medium",
        notes: responseText,
      };
    }
  } catch (error: any) {
    console.error("\n❌ [CONVERSATION ANALYSIS] Error:", error);
    console.error("=".repeat(80) + "\n");
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
  console.log("\n🔍 [Parsing] Extracting reply options from AI response");

  // Split by newlines and filter out empty lines
  const lines = responseText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log(`📊 [Parsing] Found ${lines.length} non-empty lines`);

  const replies: ReplyOption[] = [];

  for (const line of lines) {
    // Remove numbering like "1.", "Option 1:", etc.
    const cleanedLine = line
      .replace(/^\d+[\.\)\:\-]\s*/, "")
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
      confidence: 0.8,
    });

    if (replies.length >= count) {
      break;
    }
  }

  // Fallback if parsing failed
  if (replies.length === 0) {
    console.log("⚠️  [Parsing] Parsing failed, using fallback");
    replies.push({
      text: responseText.slice(0, 200),
      tone,
      confidence: 0.5,
    });
  } else {
    console.log(
      `✅ [Parsing] Successfully extracted ${replies.length} replies`,
    );
  }

  return replies.slice(0, count);
};

/**
 * Parses raw conversation text and generates replies in a single batched AI call
 * This reduces API costs by ~50% compared to separate parse + generate calls
 */
export const parseAndGenerateReplies = async (
  request: GenerateReplyRequest,
): Promise<GenerateReplyResponse> => {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 [BATCHED PARSING + REPLY] Starting batched operation");
  console.log("=".repeat(80));

  try {
    // Validate that we have raw text
    if (!request.conversationText) {
      throw new Error("conversationText is required for batched parsing");
    }

    console.log("📝 [Input] Request details:", {
      tone: request.tone,
      textLength: request.conversationText.length,
      userIdentifier: request.userIdentifier || "auto-detect",
      requestedCount: request.count || 3,
    });

    console.log("\n📄 [Raw Text] Input:");
    console.log("─".repeat(80));
    console.log(request.conversationText.slice(0, 500));
    if (request.conversationText.length > 500) {
      console.log(
        "... (trimmed, total length: " + request.conversationText.length + ")",
      );
    }
    console.log("─".repeat(80));

    // Import the batched prompt
    const { getBatchedParsingAndReplyPrompt } =
      await import("../prompts/conversationParser");

    const prompt = getBatchedParsingAndReplyPrompt(
      request.conversationText,
      request.tone,
      request.userIdentifier,
    );

    console.log("\n🎯 [Batched Prompt] Sent to AI:");
    console.log("   Tone:", request.tone);
    console.log("   Operation: Parse + Generate Replies");

    const {
      text: responseText,
      provider,
      model,
    } = await callAIWithFallback(
      "You are a helpful AI assistant.",
      prompt,
      0.7, // Balanced temperature
      800, // Enough tokens for parsing + replies
    );

    console.log("\n📥 [AI Response] Full response:");
    console.log("─".repeat(80));
    console.log(responseText);
    console.log("─".repeat(80));
    console.log(`✨ [AI Response] Provider: ${provider}, Model: ${model}`);

    // Parse the JSON response
    let parsedResponse: any;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error(
        "❌ [Batched] Failed to parse AI response as JSON:",
        parseError,
      );
      throw new Error("AI returned invalid JSON. Please try again.");
    }

    console.log("\n🔍 [Parsed Conversation]:");
    if (parsedResponse.parsed_conversation?.messages) {
      parsedResponse.parsed_conversation.messages.forEach(
        (msg: any, idx: number) => {
          console.log(`   [${idx + 1}] ${msg.sender}: ${msg.text}`);
        },
      );
    } else {
      console.log("   ⚠️  No messages found in parsed conversation");
    }

    console.log("\n🎁 [Generated Replies]:");
    const replies: ReplyOption[] = [];
    if (Array.isArray(parsedResponse.replies)) {
      parsedResponse.replies.forEach((replyText: string, idx: number) => {
        console.log(`   [${idx + 1}] ${replyText}`);
        replies.push({
          text: replyText,
          tone: request.tone,
          confidence: 0.8,
        });
      });
    } else {
      console.log("   ⚠️  No replies found in response");
    }

    // Fallback if no replies
    if (replies.length === 0) {
      console.log("⚠️  [Batched] No replies generated, using fallback");
      replies.push({
        text: "Hey! Thanks for reaching out 😊",
        tone: request.tone,
        confidence: 0.3,
      });
    }

    console.log("\n✅ [BATCHED PARSING + REPLY] Completed successfully");
    console.log(
      `📊 [Stats] Parsed ${parsedResponse.parsed_conversation?.messages?.length || 0} messages, generated ${replies.length} replies`,
    );
    console.log("=".repeat(80) + "\n");

    return {
      replies: replies.slice(0, request.count || 3),
      context_analysis: {
        engagement_level: "medium",
        recommended_tone: request.tone,
        notes: `Batched operation by ${provider}/${model}. Parsed ${parsedResponse.parsed_conversation?.messages?.length || 0} messages.`,
      },
    };
  } catch (error: any) {
    console.error("\n❌ [BATCHED PARSING + REPLY] Error:", error);
    console.error("=".repeat(80) + "\n");
    throw new Error(`Failed to parse and generate replies: ${error.message}`);
  }
};

export default {
  generateReplies,
  parseAndGenerateReplies,
  analyzeConversation,
};
