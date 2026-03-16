import type { Route } from "./+types/home";

import Navbar from "~/features/nano-banana/components/Navbar";
import Hero from "~/features/nano-banana/components/Hero";
import BrandStory from "~/features/nano-banana/components/BrandStory";
import HowItWorks from "~/features/nano-banana/components/HowItWorks";
import Features from "~/features/nano-banana/components/Features";
import EditorDemo from "~/features/nano-banana/components/EditorDemo";
import Comparison from "~/features/nano-banana/components/Comparison";
import Inspiration from "~/features/nano-banana/components/Inspiration";
import UseCases from "~/features/nano-banana/components/UseCases";
import Pricing from "~/features/nano-banana/components/Pricing";
import FAQ from "~/features/nano-banana/components/FAQ";
import BottomCTA from "~/features/nano-banana/components/BottomCTA";
import Footer from "~/features/nano-banana/components/Footer";
import { LanguageProvider, type Language } from "~/features/nano-banana/i18n/LanguageContext";
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
    { title: "NB2 Studio - Nano Banana 2 AI Image Editor & Generator" },
    {
      name: "description",
      content:
        "NB2 Studio is an independent AI image editor for nano banana 2, gemini nano banana 2, and google nano banana 2 workflow intents. Not affiliated with Google.",
    },
    createCanonical("/", domain),
    createAlternate("/", domain, "en"),
    createAlternate("/zh", domain, "zh"),
    createAlternate("/", domain, "x-default"),
  ];
};

interface LandingPageProps {
  initialLanguage?: Language;
}

export function LandingPage({ initialLanguage = "en" }: LandingPageProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <div className="nano-banana-page min-h-screen bg-bg-deep text-text-primary selection:bg-blue-500/30">
        <Navbar />
        <main>
          <Hero />
          <EditorDemo />
          <BrandStory />
          <HowItWorks />
          <Features />
          <Comparison />
          <Inspiration />
          <UseCases />
          <Pricing />
          <FAQ />
          <BottomCTA />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default function HomePage() {
  return <LandingPage initialLanguage="en" />;
}

