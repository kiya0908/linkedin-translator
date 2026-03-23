import { KieAI } from "~/.server/aisdk";

import {
  buildTranslationPromptSet,
  calculateTranslationCredits,
  extractJsonTranslation,
  sanitizeTranslationOutput,
  type TranslationIntensity,
  type TranslationUsage,
  type TranslationMode,
} from "~/features/linkedin-translator/config";

type CompletionContent =
  | string
  | Array<{
      text?: string;
      type?: string;
    }>
  | undefined;

export interface LinkedinTranslationProviderResult {
  text: string;
  usage: TranslationUsage;
  creditsToCharge: number;
  providerModel: string;
}

export interface LinkedinTranslationProviderError {
  status: number;
  code: string;
  message: string;
}

const STRUCTURED_OUTPUT_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "linkedin_translation",
    strict: true,
    schema: {
      type: "object" as const,
      title: "LinkedIn translation response",
      description: "Contains the final translated text only.",
      additionalProperties: false,
      properties: {
        translation: {
          type: "string",
          description: "The final rewritten text.",
        },
      },
      required: ["translation"],
    },
  },
};

const extractMessageText = (content: CompletionContent) => {
  if (!content) return "";
  if (typeof content === "string") return content.trim();

  return content
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
};

const normalizeUsage = (usage?: {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}): TranslationUsage => {
  const promptTokens = Math.max(0, usage?.prompt_tokens ?? 0);
  const completionTokens = Math.max(0, usage?.completion_tokens ?? 0);

  return {
    promptTokens,
    completionTokens,
    totalTokens: Math.max(
      promptTokens + completionTokens,
      usage?.total_tokens ?? 0
    ),
  };
};

const runWithTimeout = async <T>(
  task: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), timeoutMs);

  try {
    return await task(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("LINKEDIN_TRANSLATION_TIMEOUT");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const shouldFallbackToPlainText = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? error.code : null;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";

  return (
    code === 400 ||
    code === 422 ||
    message.toLowerCase().includes("response_format") ||
    message.toLowerCase().includes("json_schema")
  );
};

const normalizeProviderError = (error: unknown): LinkedinTranslationProviderError => {
  if (error instanceof Error && error.message === "LINKEDIN_TRANSLATION_TIMEOUT") {
    return {
      status: 504,
      code: "timeout",
      message: "Translation timed out. Please try again in a moment.",
    };
  }

  if (error && typeof error === "object") {
    const code =
      "code" in error && typeof error.code !== "undefined"
        ? String(error.code)
        : "provider_error";
    const rawMessage =
      "message" in error && typeof error.message === "string"
        ? error.message
        : "Translation request failed";

    if (code === "401") {
      return {
        status: 503,
        code: "provider_auth",
        message: "Translation service is not configured correctly yet.",
      };
    }

    if (code === "402") {
      return {
        status: 503,
        code: "provider_credits",
        message: "Translation provider credits are insufficient right now.",
      };
    }

    if (code === "429") {
      return {
        status: 429,
        code: "rate_limited",
        message: "Translation service is busy right now. Please retry shortly.",
      };
    }

    if (code === "455" || code === "505") {
      return {
        status: 503,
        code,
        message: "Translation service is temporarily unavailable.",
      };
    }

    return {
      status: 502,
      code,
      message: rawMessage,
    };
  }

  return {
    status: 502,
    code: "provider_error",
    message: "Translation request failed",
  };
};

const extractSanitizedText = (
  content: CompletionContent,
  outputMaxChars: number
) => {
  const rawText = extractMessageText(content);
  const structured = extractJsonTranslation(rawText);

  return sanitizeTranslationOutput(structured ?? rawText, outputMaxChars);
};

export const translateLinkedinText = async (payload: {
  text: string;
  mode: TranslationMode;
  intensity: TranslationIntensity;
}): Promise<LinkedinTranslationProviderResult> => {
  const promptSet = buildTranslationPromptSet(
    payload.mode,
    payload.intensity,
    payload.text
  );
  const kie = new KieAI();

  const baseRequest = {
    messages: [
      {
        role: "developer" as const,
        content: [{ type: "text" as const, text: promptSet.systemPrompt }],
      },
      {
        role: "user" as const,
        content: [{ type: "text" as const, text: promptSet.userPrompt }],
      },
    ],
    stream: false,
    include_thoughts: false,
  };

  let completion:
    | Awaited<ReturnType<KieAI["createGemini25FlashCompletion"]>>
    | undefined;
  try {
    completion = await runWithTimeout(
      (signal) =>
        kie.createGemini25FlashCompletion(
          {
            ...baseRequest,
            response_format: STRUCTURED_OUTPUT_SCHEMA,
          },
          { signal }
        ),
      20_000
    );
  } catch (error) {
    if (!shouldFallbackToPlainText(error)) {
      throw normalizeProviderError(error);
    }
  }

  let translatedText = completion
    ? extractSanitizedText(
        completion.choices?.[0]?.message?.content,
        promptSet.outputMaxChars
      )
    : "";

  if (!translatedText) {
    try {
      completion = await runWithTimeout(
        (signal) =>
          kie.createGemini25FlashCompletion(baseRequest, {
            signal,
          }),
        20_000
      );
      translatedText = extractSanitizedText(
        completion.choices?.[0]?.message?.content,
        promptSet.outputMaxChars
      );
    } catch (error) {
      throw normalizeProviderError(error);
    }
  }

  if (!completion || !translatedText) {
    throw {
      status: 502,
      code: "empty_response",
      message: "Translation service returned an empty response.",
    } satisfies LinkedinTranslationProviderError;
  }

  const usage = normalizeUsage(completion.usage);

  return {
    text: translatedText,
    usage,
    creditsToCharge: calculateTranslationCredits(usage),
    providerModel: completion.model ?? "gemini-2.5-flash",
  };
};
