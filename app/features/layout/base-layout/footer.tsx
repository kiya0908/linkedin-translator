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
  return (
    <Fragment>
      <footer className="bg-neutral text-neutral-content py-8 sm:py-10">
        <div className="container footer md:footer-horizontal gap-x-8 gap-y-4">
          <aside className="md:max-w-sm max-md:mb-6">
            <Link className="mb-2" to="/">
              <Logo label="LinkedIn Translator" imageAlt="LinkedIn Translator logo" />
            </Link>
            <p>
              Transform everyday writing into professional LinkedIn tone with a fast, modern workflow.
            </p>
          </aside>
          {navLinks.map((navLink, i) => (
            <div key={i}>
              <label className="footer-title mb-0">{navLink.label}</label>
              <nav className="flex flex-row md:flex-col gap-x-4 gap-y-2 flex-wrap">
                {navLink.list.map((link, index) => (
                  <Link
                    key={`${navLink.label}_${index}`}
                    className="link link-hover"
                    target={link.target}
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </footer>
      <div className="bg-neutral text-neutral-content border-t border-neutral-700">
        <div className="container text-sm p-4">
          <p className="text-center leading-none text-neutral-400">
            (c) {new Date().getFullYear()} LinkedIn Translator. All Rights Reserved.
          </p>
        </div>
      </div>
    </Fragment>
  );
};

