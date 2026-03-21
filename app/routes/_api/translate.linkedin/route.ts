import { env } from "cloudflare:workers";

import type { Route } from "./+types/route";
import { data } from "react-router";
import { z } from "zod";

import { KieAI } from "~/.server/aisdk";

const requestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Text cannot be empty")
    .max(5000, "Text is too long"),
  mode: z
    .enum(["human-to-linkedin", "linkedin-to-human"])
    .default("human-to-linkedin"),
});

const SYSTEM_PROMPTS = {
  "human-to-linkedin":
    "You are a world-class executive communication coach. Transform the user's casual or informal input into high-impact, professional, CEO-level communication suitable for LinkedIn or corporate environments. Maintain the original intent but use sophisticated, diplomatic, and authoritative language. Provide only the rewritten text.",
  "linkedin-to-human":
    "You are an expert plain-language editor. Convert corporate or LinkedIn-style jargon into concise, clear, plain English while preserving the original meaning and key facts. Provide only the rewritten text.",
} as const;

type CompletionContent =
  | string
  | Array<{
      text?: string;
      type?: string;
    }>
  | undefined;

const extractMessageText = (content: CompletionContent): string => {
  if (!content) return "";
  if (typeof content === "string") return content.trim();

  return content
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method.toLowerCase() !== "post") {
    throw new Response("Not Found", { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request payload";
    throw new Response(message, { status: 400 });
  }

  const envVars = env as unknown as Record<string, string | undefined>;
  const model = envVars.KIE_LINKEDIN_MODEL || "gpt-4o-mini";
  const systemPrompt = SYSTEM_PROMPTS[parsed.data.mode];

  try {
    const kie = new KieAI();
    const completion = await kie.createChatCompletion({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: parsed.data.text },
      ],
    });

    const text = extractMessageText(completion.choices?.[0]?.message?.content);
    if (!text) {
      throw new Error("Empty response from Kie AI");
    }

    return data({ text });
  } catch (error) {
    console.error("LinkedIn translate error");
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
          ? error.message
          : "Translation request failed";

    throw new Response(message, { status: 500 });
  }
};

export type LinkedinTranslateResult = Awaited<ReturnType<typeof action>>["data"];
