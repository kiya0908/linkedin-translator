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
  const domain = matches[0]?.data?.DOMAIN ?? "https://linkedin-translator.app";

  return [
    { title: "LinkedIn Translator - Translate Profiles, Posts & Messages Instantly" },
    {
      name: "description",
      content:
        "Use LinkedIn Translator to transform everyday text into polished, professional LinkedIn communication with AI-powered tone optimization.",
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
