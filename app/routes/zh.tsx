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
  const domain = matches[0]?.data?.DOMAIN ?? "https://linkedin-translator.app";

  return [
    { title: "LinkedIn Translator - LinkedIn 内容智能翻译与润色" },
    {
      name: "description",
      content:
        "使用 LinkedIn Translator 将日常表达快速转换为更专业、更有影响力的 LinkedIn 文案，适用于全球求职者与职场人士。",
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
