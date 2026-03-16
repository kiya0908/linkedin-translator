import type { Route } from "./+types/route";

import { Legal } from "~/components/pages/legal";
import { parseMarkdown } from "~/.server/libs/markdown";
import content from "./content.md?raw";
import { createCanonical } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  return [
    { title: "Acceptable Use Policy - NB2 Studio" },
    {
      name: "description",
      content:
        "Read the NB2 Studio Acceptable Use Policy, including prohibited content, NSFW restrictions, and enforcement rules.",
    },
    createCanonical("/legal/acceptable-use", matches[0].data.DOMAIN),
  ];
};

export const loader = ({}: Route.LoaderArgs) => {
  const { node } = parseMarkdown(content);
  return { node };
};

export default function Page({ loaderData: { node } }: Route.ComponentProps) {
  return <Legal node={node} />;
}
