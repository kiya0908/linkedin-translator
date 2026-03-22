export const TRANSLATION_MODES = [
  {
    value: "human-to-linkedin",
    label: "Human -> LinkedIn",
    shortLabel: "Polish for LinkedIn",
    badge: "LinkedIn-ready",
    inputLabel: "Raw draft",
    outputLabel: "Polished version",
    placeholder:
      "I shipped the feature, but the rollout was messy and I learned a lot from the feedback.",
    emptyState:
      "Your LinkedIn-ready version will appear here with clearer positioning and a stronger professional tone.",
    loadingState: "Rewriting your draft into a professional LinkedIn version...",
  },
  {
    value: "linkedin-to-human",
    label: "LinkedIn -> Human",
    shortLabel: "Decode LinkedIn speak",
    badge: "Plain language",
    inputLabel: "LinkedIn-style text",
    outputLabel: "Human version",
    placeholder:
      "Thrilled to share that I leveraged cross-functional alignment to unlock a scalable growth motion for our users.",
    emptyState:
      "The plain-English explanation will appear here with the buzzwords stripped out.",
    loadingState: "Decoding the corporate jargon into direct, plain language...",
  },
] as const;

export const TRANSLATION_INTENSITIES = [
  {
    value: "light",
    label: "Light",
    description: "Subtle rewrite that stays close to the original wording.",
    upgradeLabel: null,
  },
  {
    value: "standard",
    label: "Standard",
    description: "Balanced rewrite with clearer structure and stronger readability.",
    upgradeLabel: null,
  },
  {
    value: "extreme",
    label: "Extreme",
    description: "Most opinionated rewrite with sharper framing and stronger positioning.",
    upgradeLabel: "Upgrade to unlock",
  },
] as const;

export type TranslationMode = (typeof TRANSLATION_MODES)[number]["value"];
export type TranslationIntensity =
  (typeof TRANSLATION_INTENSITIES)[number]["value"];

export interface PromptProfile {
  systemPrompt: string;
  temperature: number;
  locked: boolean;
}

export const MAX_TRANSLATION_INPUT_CHARS = 5000;
export const GUEST_FREE_TRANSLATIONS_PER_DAY = 3;
export const GUEST_QUOTA_STORAGE_KEY =
  "linkedin-translator.translation-interface.guest-quota";

const PROMPT_PROFILES: Record<
  TranslationMode,
  Record<TranslationIntensity, PromptProfile>
> = {
  "human-to-linkedin": {
    light: {
      systemPrompt:
        "You are a professional LinkedIn editor. Lightly polish the user's draft for LinkedIn while preserving the original intent, order, and level of detail. Improve grammar and clarity, but keep the rewrite restrained. Return only the rewritten text.",
      temperature: 0.35,
      locked: false,
    },
    standard: {
      systemPrompt:
        "You are a senior LinkedIn writing coach. Rewrite the user's text into a professional LinkedIn-ready version with stronger structure, clearer positioning, and improved readability. Keep it credible and concise. Return only the rewritten text.",
      temperature: 0.45,
      locked: false,
    },
    extreme: {
      systemPrompt:
        "You are an elite executive communications strategist. Transform the user's text into a high-conviction LinkedIn post with sharp business framing, a strong hook, and action-oriented language while preserving the core meaning. Keep it polished, credible, and concise. Return only the rewritten text.",
      temperature: 0.6,
      locked: true,
    },
  },
  "linkedin-to-human": {
    light: {
      systemPrompt:
        "You are a plain-language editor. Rewrite the user's LinkedIn-style or corporate text into direct, simple English while preserving the original meaning and facts. Keep the rewrite close to the source. Return only the rewritten text.",
      temperature: 0.25,
      locked: false,
    },
    standard: {
      systemPrompt:
        "You are an expert workplace translator. Convert the user's LinkedIn-style or corporate jargon into clear, plain English. Reduce abstraction, remove buzzwords, and make implied meaning explicit when helpful. Return only the rewritten text.",
      temperature: 0.35,
      locked: false,
    },
    extreme: {
      systemPrompt:
        "You are a blunt but accurate business translator. Convert the user's LinkedIn-style or corporate jargon into direct, practical language with the jargon fully removed and the real message made obvious. Keep it factual and concise. Return only the rewritten text.",
      temperature: 0.45,
      locked: true,
    },
  },
};

export const DEFAULT_INTENSITY_BY_MODE: Record<
  TranslationMode,
  TranslationIntensity
> = {
  "human-to-linkedin": "standard",
  "linkedin-to-human": "light",
};

export const getPromptProfile = (
  mode: TranslationMode,
  intensity: TranslationIntensity
) => PROMPT_PROFILES[mode][intensity];

export const isLockedIntensity = (
  intensity: TranslationIntensity,
  hasPaidAccess: boolean
) => getPromptProfile("human-to-linkedin", intensity).locked && !hasPaidAccess;

export const getModeConfig = (mode: TranslationMode) =>
  TRANSLATION_MODES.find((item) => item.value === mode) ?? TRANSLATION_MODES[0];

export const getIntensityConfig = (intensity: TranslationIntensity) =>
  TRANSLATION_INTENSITIES.find((item) => item.value === intensity) ??
  TRANSLATION_INTENSITIES[0];
