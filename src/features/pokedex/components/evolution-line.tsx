import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { EvolutionNode } from "../lib/evolution";
import type { PokedexEntry } from "../lib/filters";
import { PokemonCard, PokemonCardLink } from "./pokemon-card";

/**
 * About the width of a card in the Pokédex grid on a phone. On very small
 * screens (320 px) it shrinks so that two cards still fit side by side.
 */
const CARD_WIDTH = "w-[min(9.5rem,calc(50vw-1.75rem))] sm:w-40";

/**
 * The evolution family laid out like cards on a table: stages run top to
 * bottom on phones and left to right from `sm`, and a stage with several
 * evolutions shows them side by side (or in a small grid when there are
 * many, like Eevee's eight). From `lg` the line shares the row with its
 * heading, so the grid drops back to two columns until `xl`.
 *
 * Wrap it in a <HoloSurface> for the holographic effect.
 */
export function EvolutionLine({
  tree,
  currentSlug,
}: {
  tree: EvolutionNode;
  currentSlug: string;
}) {
  return <Branch node={tree} currentSlug={currentSlug} />;
}

function Branch({
  node,
  currentSlug,
}: {
  node: EvolutionNode;
  currentSlug: string;
}) {
  const t = useTranslations("Pokemon");
  const { children } = node;
  const many = children.length > 3;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <EvolutionCard node={node} isCurrent={node.entry.slug === currentSlug} />
      {children.length > 0 && (
        <>
          <span className="shrink-0 text-muted-foreground">
            <ArrowDownIcon aria-hidden className="size-6 sm:hidden" />
            <ArrowRightIcon aria-hidden className="hidden size-6 sm:block" />
            <span className="sr-only">{t("evolvesInto")}</span>
          </span>
          <ul
            className={cn(
              "gap-3",
              many
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
                : "flex flex-wrap items-start justify-center sm:flex-col sm:flex-nowrap",
            )}
          >
            {children.map((child) => (
              <li key={child.entry.dexNumber}>
                <Branch node={child} currentSlug={currentSlug} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function EvolutionCard({
  node,
  isCurrent,
}: {
  node: EvolutionNode;
  isCurrent: boolean;
}) {
  return <LineCard entry={node.entry} isCurrent={isCurrent} />;
}

/**
 * A card in a row of related cards (evolution line, forms): a link, or, for
 * the page you are on, an outlined card that is not a link.
 */
export function LineCard({
  entry,
  isCurrent,
}: {
  entry: PokedexEntry;
  isCurrent: boolean;
}) {
  const t = useTranslations("Pokemon");

  // The page you are on is not a link: it is marked instead.
  if (isCurrent) {
    return (
      <div
        aria-current="page"
        className={cn(
          CARD_WIDTH,
          "shrink-0 rounded-[14px] outline-3 outline-offset-4 outline-foreground",
        )}
      >
        <PokemonCard entry={entry} />
        <span className="sr-only">{t("currentInLine")}</span>
      </div>
    );
  }

  return (
    <div className={cn(CARD_WIDTH, "shrink-0")}>
      <PokemonCardLink entry={entry} />
    </div>
  );
}
