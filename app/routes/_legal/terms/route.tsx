import type { Route } from "./+types/route";

import { Legal } from "~/components/pages/legal";
import { parseMarkdown } from "~/.server/libs/markdown";
import content from "./content.md?raw";

import { createCanonical } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  return [
    { title: "Terms of Use - Nivra Brush Studio" },
    {
      name: "description",
      content:
        "Review the Terms of Use for Nivra Brush Studio, including rules, responsibilities, and legal conditions for using our AI image platform.",
    },
    createCanonical("/legal/terms", matches[0].data.DOMAIN),
  ];
};

export const loader = ({}: Route.LoaderArgs) => {
  const { node } = parseMarkdown(content);
  return { node };
};

export default function Page({ loaderData: { node } }: Route.ComponentProps) {
  return <Legal node={node} />;
}

