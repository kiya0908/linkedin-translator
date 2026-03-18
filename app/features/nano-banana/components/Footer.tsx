import { useTranslation } from "../i18n/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border-subtle bg-bg-deep pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center font-bold text-white text-xs">
                NvB
              </div>
              <span className="font-bold text-xl tracking-tight">Nivra Brush Studio</span>
            </div>
            <p className="text-text-secondary max-w-md">{t("footer.desc")}</p>
          </div>

          <div>
            <h4 className="font-bold mb-6">{t("footer.related")}</h4>
            <ul className="space-y-4 text-text-secondary">
              <li>
                <a href="/legal/acceptable-use" className="hover:text-white transition-colors">
                  {t("footer.acceptableUse")}
                </a>
              </li>
              <li>
                <a href="/legal/refund" className="hover:text-white transition-colors">
                  {t("footer.refund")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">{t("footer.legal")}</h4>
            <ul className="space-y-4 text-text-secondary">
              <li>
                <a href="/legal/privacy" className="hover:text-white transition-colors">
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href="/legal/terms" className="hover:text-white transition-colors">
                  {t("footer.terms")}
                </a>
              </li>
              <li>
                <a href="mailto:support@nanobanana2pro.space" className="hover:text-white transition-colors">
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-text-secondary">
          <p>{t("footer.rights")}</p>
          <p className="mt-2 md:mt-0">Independent platform, not affiliated with Google.</p>
        </div>
      </div>
    </footer>
  );
}

