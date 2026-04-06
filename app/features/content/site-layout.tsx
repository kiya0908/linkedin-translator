// 新增内容站专用布局，包含顶部目录导航、语言切换和底部导航。
import clsx from "clsx";

import { Link, Logo } from "~/components/common";
import { Footer, type FooterNavLink } from "~/features/layout/base-layout/footer";

import {
  CONTENT_COLLECTIONS,
  type ContentCollection,
  type ContentLocale,
} from "./types";
import {
  getCollectionLabel,
  getCollectionPath,
  getHomePath,
  getLocaleSwitchLabel,
} from "./utils";

interface ContentSiteLayoutProps {
  locale: ContentLocale;
  activeCollection?: ContentCollection;
  alternatePath?: string | null;
  children: React.ReactNode;
}

const buildFooterLinks = (locale: ContentLocale): FooterNavLink[] => {
  const supportLabel = locale === "zh" ? "支持" : "Support";
  const legalLabel = locale === "zh" ? "法律" : "Legal";
  const exploreLabel = locale === "zh" ? "目录" : "Explore";

  return [
    {
      label: exploreLabel,
      list: CONTENT_COLLECTIONS.map((collection) => ({
        to: getCollectionPath(locale, collection),
        label: getCollectionLabel(collection, locale),
      })),
    },
    {
      label: supportLabel,
      list: [
        {
          to: "mailto:support@linkedinspeaktranslator.top",
          label: "support@linkedinspeaktranslator.top",
          target: "_blank",
        },
        {
          to: getHomePath(locale),
          label: locale === "zh" ? "主页工具" : "Main Translator",
        },
      ],
    },
    {
      label: legalLabel,
      list: [
        { to: "/legal/privacy", label: locale === "zh" ? "隐私政策" : "Privacy Policy" },
        { to: "/legal/terms", label: locale === "zh" ? "服务条款" : "Terms of Service" },
        { to: "/legal/cookie", label: locale === "zh" ? "Cookie 政策" : "Cookie Policy" },
      ],
    },
  ];
};

export const ContentSiteLayout = ({
  locale,
  activeCollection,
  alternatePath,
  children,
}: ContentSiteLayoutProps) => {
  const localeSwitchPath = alternatePath ?? (locale === "en" ? "/zh" : "/");

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="sticky top-0 z-40 border-b border-outline-variant glass">
        <div className="max-w-7xl mx-auto px-6 min-h-[4.5rem] flex items-center gap-8">
          <Link to={getHomePath(locale)} className="shrink-0">
            <Logo label="LinkedIn Translator" />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {CONTENT_COLLECTIONS.map((collection) => (
              <Link
                key={collection}
                to={getCollectionPath(locale, collection)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  activeCollection === collection
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:text-primary hover:bg-white"
                )}
              >
                {getCollectionLabel(collection, locale)}
              </Link>
            ))}
          </nav>

          <div className="grow" />

          <Link
            to={localeSwitchPath}
            className="rounded-full border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface hover:text-primary"
          >
            {getLocaleSwitchLabel(locale)}
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer
        navLinks={buildFooterLinks(locale)}
        description={
          locale === "zh"
            ? "面向现代职业用户的 LinkedIn AI 翻译与内容优化站点。不隶属于LinkedIn。我们只是帮助你掌握语言。"
            : "AI translation for modern LinkedIn publishing.Not affiliated with LinkedIn. We just help you navigate the language."
        }
      />
    </div>
  );
};

