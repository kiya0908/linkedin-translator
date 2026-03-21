import type { Route } from "./+types/home";

import LinkedinTranslatorLandingPage from "~/features/linkedin-translator/landing-page";
import { createCanonical } from "~/utils/meta";

const createAlternate = (pathname: string, domain: string, hrefLang: string) => ({
  tagName: "link" as const,
  rel: "alternate",
  hrefLang,
  href: new URL(pathname, domain).toString(),
});

export const meta: Route.MetaFunction = ({ matches }) => {
  const domain = matches[0]?.data?.DOMAIN ?? "https://linkedintranslator.online";

  return [
    { title: "LinkedIn Translator - AI Tone Translator for LinkedIn Speak" },
    {
      name: "description",
      content:
        "LinkedIn Translator is an AI tone translator that converts everyday wording into professional LinkedIn speak with hooks, smart line breaks, and workplace-ready polish.",
    },
    createCanonical("/", domain),
    createAlternate("/", domain, "en"),
    createAlternate("/zh", domain, "zh"),
    createAlternate("/", domain, "x-default"),
  ];
};

export default function HomePage() {
  return <LinkedinTranslatorLandingPage />;
}
