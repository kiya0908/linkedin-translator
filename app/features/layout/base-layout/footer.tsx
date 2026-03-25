//base路由 用户面板footer组件
import { Fragment } from "react";
import { Logo, Link } from "~/components/common";

interface FooterNavLink {
  label: string;
  list: Array<{
    to: string;
    label: string;
    target?: React.HTMLAttributeAnchorTarget;
  }>;
}

export interface FooterProps {
  navLinks: FooterNavLink[];
}

export const Footer = ({ navLinks }: FooterProps) => {
  void navLinks;

  return (
    <Fragment>
      <footer className="bg-surface py-20 px-6 border-t border-outline-variant">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <Link to="/" className="inline-flex mb-6">
              <Logo
                label="LinkedIn Translator"
                imageAlt="LinkedIn Translator logo"
                size="base"
              />
            </Link>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              AI tone translation for modern professionals. All rights reserved.
            </p>
            <p className="text-[10px] text-on-surface-variant/40 mt-8">
              (c) {new Date().getFullYear()} LinkedIn Translator. All rights reserved.
            </p>
          </div>

          <div>
            <p className="font-bold text-xs uppercase tracking-widest text-on-surface-variant/60 mb-6">
              Legal
            </p>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li>
                <Link to="/legal/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/cookie" className="hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-xs uppercase tracking-widest text-on-surface-variant/60 mb-6">
              Support
            </p>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li>
                <Link to="mailto:support@linkedintranslator.online" target="_blank" className="hover:text-primary">
                  support@linkedintranslator.online
                </Link>
              </li>
              <li>
                <Link to="https://linkedintranslator.online" target="_blank" className="hover:text-primary">
                  linkedintranslator.online
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </Fragment>
  );
};
