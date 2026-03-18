import type { Route } from "./+types/route";

import { Legal } from "~/components/pages/legal";
import { parseMarkdown } from "~/.server/libs/markdown";
import content from "./content.md?raw";

import { createCanonical } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
    return [
        { title: "Refund Policy - Nivra Brush Studio" },
        {
            name: "description",
            content:
                "Review the Refund Policy for Nivra Brush Studio, outlining the conditions and procedures for refunds on our AI-powered platform.",
        },
        createCanonical("/legal/refund", matches[0].data.DOMAIN),
    ];
};

export const loader = ({ }: Route.LoaderArgs) => {
    const { node } = parseMarkdown(content);
    return { node };
};

export default function Page({ loaderData: { node } }: Route.ComponentProps) {
    return <Legal node={node} />;
}

