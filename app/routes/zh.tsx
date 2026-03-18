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
    { title: "Nivra Brush Studio - AI 图像生成与编辑平台" },
    {
      name: "description",
      content:
        "Nivra Brush Studio 是独立的 AI 图像生成与编辑平台，支持多种 AI 模型，提供批量生图、模板和项目管理功能。与 Google 无关联。",
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
