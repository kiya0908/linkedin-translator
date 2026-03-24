import clsx from "clsx";
import {
  Coins,
  LayoutGrid,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router";
import { Link } from "~/components/common";

const links = [
  {
    label: "Profile",
    to: "/base/profile",
    description: "Identity and account details",
    icon: UserRound,
  },
  {
    label: "Credits",
    to: "/base/credits",
    description: "Balance and credit records",
    icon: Coins,
  },
  {
    label: "Orders",
    to: "/base/orders",
    description: "Purchases and payment status",
    icon: ReceiptText,
  },
  {
    label: "Subscription",
    to: "/base/subscription",
    description: "Plan status and billing cycle",
    icon: ShieldCheck,
  },
] as const;

export const Sidebar = () => {
  return (
    <aside className="w-full md:sticky md:top-24 md:self-start">
      <div className="rounded-2xl border border-base-300 bg-base-100/90 shadow-sm">
        <div className="border-b border-base-300 px-4 py-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-base-200 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-base-content/70">
            <LayoutGrid size={12} />
            Workspace
          </div>
          <h2 className="mt-3 text-lg font-semibold">Account Center</h2>
          <p className="mt-1 text-xs text-base-content/70">
            Manage your profile, credits, orders, and subscription in one place.
          </p>
        </div>

        <nav className="flex flex-row gap-2 overflow-x-auto p-3 md:flex-col">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    "group min-w-fit rounded-xl border px-3 py-3 transition-all md:min-w-0",
                    isActive
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-base-300 text-base-content/80 hover:border-base-400 hover:bg-base-200/70 hover:text-base-content"
                  )
                }
              >
                <div className="flex items-start gap-3">
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-none">{link.label}</div>
                    <div className="mt-1 hidden text-xs text-base-content/65 md:block">
                      {link.description}
                    </div>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-base-300 px-4 py-4">
          <p className="text-xs text-base-content/70">Need more translation quota?</p>
          <Link className="link link-primary mt-1 inline-block text-sm font-medium" to="/#pricing">
            View pricing plans
          </Link>
        </div>
      </div>
    </aside>
  );
};
