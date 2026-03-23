import { CREEM_ACTIVE_PRODUCT_IDS } from "../../constants/pricing.js";

import {
  DEFAULT_FREE_DAILY_TRANSLATIONS,
  DEFAULT_TRIAL_DAILY_TRANSLATIONS,
} from "./config.js";

export const LINKEDIN_TRANSLATOR_SUPPORT_EMAIL =
  "support@linkedintranslator.online";

const LINKEDIN_TRANSLATOR_PRO_PRODUCT_ID =
  CREEM_ACTIVE_PRODUCT_IDS.linkedinCredit200;
const LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID =
  CREEM_ACTIVE_PRODUCT_IDS.linkedinCredit500;

export const LINKEDIN_TRANSLATOR_PRO_PACK = {
  id: "linkedin-pro-pack",
  productId: LINKEDIN_TRANSLATOR_PRO_PRODUCT_ID,
  name: "Pro Credit Pack",
  badge: "One-time top-up",
  price: 4.9,
  credits: 200,
  description:
    "Unlock Extreme intensity, usage-based billing, and a reusable credit balance with no subscription commitment.",
  ctaLabel: "Unlock Pro",
  features: [
    "200 credits included",
    "Extreme intensity unlocked immediately",
    "Minimum 1 credit per successful paid translation",
    "Credits never expire",
    "Works across both translation directions",
  ],
} as const;

export const LINKEDIN_TRANSLATOR_TEAM_PLAN = {
  id: "team",
  productId: LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID,
  name: "Team Credit Pack",
  badge: "One-time top-up",
  price: 9.9,
  credits: 500,
  description:
    "Unlock Extreme intensity, usage-based billing, and a larger reusable credit balance for heavier workflows with no subscription commitment.",
  ctaLabel: LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID
    ? "Unlock Team"
    : "Contact sales",
  features: [
    "500 credits included",
    "Extreme intensity unlocked immediately",
    "Minimum 1 credit per successful paid translation",
    "Credits never expire",
    "Works across both translation directions",
  ],
} as const;

export const LINKEDIN_TRANSLATOR_PRICING_CARDS = [
  {
    id: "free",
    name: "Free",
    badge: "No card required",
    priceLabel: "$0",
    description:
      "Try both translation directions with the same production prompt system before you buy credits.",
    ctaLabel: "Start Free",
    features: [
      `${DEFAULT_FREE_DAILY_TRANSLATIONS} daily translations before sign-in`,
      `${DEFAULT_TRIAL_DAILY_TRANSLATIONS} daily translations after sign-in`,
      "Light and Standard intensity",
      "Human -> LinkedIn and LinkedIn -> Human",
      "No payment required to validate the workflow",
    ],
  },
  {
    id: LINKEDIN_TRANSLATOR_PRO_PACK.id,
    name: LINKEDIN_TRANSLATOR_PRO_PACK.name,
    badge: LINKEDIN_TRANSLATOR_PRO_PACK.badge,
    priceLabel: `$${LINKEDIN_TRANSLATOR_PRO_PACK.price.toFixed(2)}`,
    description: LINKEDIN_TRANSLATOR_PRO_PACK.description,
    ctaLabel: LINKEDIN_TRANSLATOR_PRO_PACK.ctaLabel,
    features: LINKEDIN_TRANSLATOR_PRO_PACK.features,
    productId: LINKEDIN_TRANSLATOR_PRO_PACK.productId,
  },
  {
    id: LINKEDIN_TRANSLATOR_TEAM_PLAN.id,
    name: LINKEDIN_TRANSLATOR_TEAM_PLAN.name,
    badge: LINKEDIN_TRANSLATOR_TEAM_PLAN.badge,
    priceLabel: `$${LINKEDIN_TRANSLATOR_TEAM_PLAN.price.toFixed(2)}`,
    description: LINKEDIN_TRANSLATOR_TEAM_PLAN.description,
    ctaLabel: LINKEDIN_TRANSLATOR_TEAM_PLAN.ctaLabel,
    features: LINKEDIN_TRANSLATOR_TEAM_PLAN.features,
    ...(LINKEDIN_TRANSLATOR_TEAM_PLAN.productId
      ? { productId: LINKEDIN_TRANSLATOR_TEAM_PLAN.productId }
      : {}),
  },
] as const;
