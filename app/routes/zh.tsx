import type { Route } from "./+types/zh";

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
    { title: "LinkedIn Translator - AI 领英语调转换器" },
    {
      name: "description",
      content:
        "LinkedIn Translator 是一款 AI 语调转换器，可将日常表达改写为专业、吸引人的 LinkedIn 职场话术，并自动补全 hooks、换行和专业表情。",
    },
    createCanonical("/zh", domain),
    createAlternate("/", domain, "en"),
    createAlternate("/zh", domain, "zh"),
    createAlternate("/", domain, "x-default"),
  ];
};

export default function ZhHomePage() {
  return <LinkedinTranslatorLandingPage />;
}
