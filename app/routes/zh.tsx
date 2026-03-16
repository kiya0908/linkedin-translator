import type { Route } from "./+types/zh";

import { LandingPage } from "./home";
import { createCanonical } from "~/utils/meta";

const createAlternate = (pathname: string, domain: string, hrefLang: string) => ({
  tagName: "link" as const,
  rel: "alternate",
  hrefLang,
  href: new URL(pathname, domain).toString(),
});

export const meta: Route.MetaFunction = ({ matches }) => {
  const domain = matches[0]?.data?.DOMAIN ?? "https://nanobanana2pro.space";

  return [
    { title: "NB2 Studio - Nano Banana 2 AI Image Editor (ZH)" },
    {
      name: "description",
      content:
        "NB2 Studio is an independent AI image platform for nano banana 2, gemini nano banana 2, and google nano banana 2 workflows. Not affiliated with Google.",
    },
    createCanonical("/zh", domain),
    createAlternate("/", domain, "en"),
    createAlternate("/zh", domain, "zh"),
    createAlternate("/", domain, "x-default"),
  ];
};

export default function ZhHomePage() {
  return <LandingPage initialLanguage="zh" />;
}
