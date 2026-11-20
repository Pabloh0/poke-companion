import type { CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TypeBadge } from "@/features/types/components/type-badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatDexNumber, type PokedexEntry } from "../lib/filters";
import { spriteUrl } from "../lib/sprites";

/** National Pokédex size: the "set" every card belongs to. */
export const COLLECTION_SIZE = 1025;

export const RARITY_MARK = {
  common: "●",
  legendary: "★",
  mythical: "✦",
} as const;

/**
 * A Pokémon as a collectible card (original design, 5:7 like any trading
 * card). The frame takes the colour of its type, blending into the second
 * type when it has two. Printed objects look the same in both themes, so the
 * card uses the fixed "stock" palette, not the page tokens.
 *
 * The holographic effect is driven by a surrounding <HoloSurface>.
 */
export function PokemonCard({
  entry,
  className,
  priority = false,
}: {
  entry: PokedexEntry;
  className?: string;
  /** Load the sprite eagerly (cards visible on first paint). */
  priority?: boolean;
}) {
  const t = useTranslations("Pokedex");
  const [first, second = first] = entry.types;
  const frameStyle = {
    "--t1": `var(--color-type-${first})`,
    "--t2": `var(--color-type-${second})`,
  } as CSSProperties;

  return (
    <article
      data-holo
      data-rarity={entry.rarity}
      style={frameStyle}
      className={cn(
        "holo-card @container relative aspect-[5/7] rounded-[14px] bg-[linear-gradient(135deg,var(--t1),var(--t2))] p-[5px]",
        "shadow-[0_1px_1px_rgb(20_24_40/0.12),0_10px_24px_-10px_rgb(20_24_40/0.45)]",
        className,
      )}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[10px] bg-stock text-stock-ink">
        <header className="px-2.5 pt-2">
          <h3
            title={entry.name}
            className="truncate font-display text-[1.05rem] leading-tight font-extrabold condensed"
          >
            {entry.name}
          </h3>
        </header>

        {/* Art window: tinted with the main type, with a printed halftone. */}
        <div className="relative mx-2 mt-1.5 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[6px] bg-[radial-gradient(circle_at_50%_62%,color-mix(in_oklab,var(--t1)_38%,white),color-mix(in_oklab,var(--t1)_14%,white)_70%)] ring-1 ring-stock-ink/10">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(rgb(26_28_35/0.09)_1px,transparent_1.2px)] [background-size:6px_6px]"
          />
          {/* Decorative: the name is in the header. Tiny pixel-art PNGs from
              PokeAPI skip Next's image optimizer (unoptimized). */}
          <Image
            src={spriteUrl(entry.dexNumber)}
            alt=""
            width={96}
            height={96}
            unoptimized
            loading={priority ? "eager" : "lazy"}
            className="relative aspect-square w-[78%] max-w-48 [image-rendering:pixelated]"
          />
        </div>

        <div className="flex items-center justify-between gap-1 px-2 pt-2">
          <div className="flex min-w-0 gap-1">
            {entry.types.map((type) => (
              <TypeBadge
                key={type}
                type={type}
                size="sm"
                // On the narrowest cards (small phones) two long types such as
                // "Siniestro" + "Fantasma" only fit with Archivo's narrower
                // widths.
                className="@max-[9rem]:px-1 @max-[9rem]:condensed @max-[8rem]:text-[0.65rem] @max-[8rem]:extra-condensed"
              />
            ))}
          </div>
          {/* Two type badges and the total only fit side by side on wide
              cards. The card decides by its OWN width (container query), not
              the screen's, because it appears at several sizes: Pokédex grid,
              evolution line, home fan. On narrow cards the total moves down
              to the category line. */}
          <StatTotal
            value={entry.baseStatTotal}
            label={t("card.total")}
            className="hidden @[11.5rem]:block"
          />
        </div>

        <div className="flex min-h-[1.25rem] items-baseline gap-1.5 px-2.5 pt-1">
          <p className="min-w-0 flex-1 truncate font-serif text-[0.8rem] text-stock-ink-muted italic">
            {entry.genus}
          </p>
          <StatTotal
            value={entry.baseStatTotal}
            label={t("card.total")}
            className="@[11.5rem]:hidden"
          />
        </div>

        <footer className="mt-1 flex items-center justify-between border-t border-stock-ink/10 bg-stock-shade px-2.5 py-1 text-[0.7rem] text-stock-ink-muted">
          <span
            className="font-semibold condensed tabular-nums"
            aria-label={t("card.setNumber", {
              number: entry.dexNumber,
              total: COLLECTION_SIZE,
            })}
          >
            {formatDexNumber(entry.dexNumber)}/{COLLECTION_SIZE}
          </span>
          {/* Dropped on the smallest cards (320 px phones) so the footer
              stays on one line; the number and rarity remain. */}
          <span className="@max-[8rem]:hidden">
            {t("card.generation", {
              generation: t(`generationShort.${entry.generation}`),
            })}
          </span>
          <span
            title={t(`card.rarity.${entry.rarity}`)}
            className={cn(
              "text-sm leading-none",
              entry.rarity !== "common" && "text-stock-ink",
            )}
          >
            <span aria-hidden>{RARITY_MARK[entry.rarity]}</span>
            <span className="sr-only">{t(`card.rarity.${entry.rarity}`)}</span>
          </span>
        </footer>
      </div>
      <div aria-hidden className="holo-foil" />
    </article>
  );
}

/** Base stat total; the word "Total" only shows on the widest cards. */
function StatTotal({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 text-[0.65rem] leading-none text-stock-ink-muted",
        className,
      )}
    >
      <span className="hidden @[13rem]:inline">{label} </span>
      <span
        className="text-sm font-bold text-stock-ink not-italic condensed tabular-nums"
        title={label}
      >
        {value}
      </span>
    </span>
  );
}

/**
 * A card that opens the Pokémon's page. The link wraps the whole card; its
 * accessible name is just "Name, number" instead of every text on the card.
 */
export function PokemonCardLink({
  entry,
  priority = false,
}: {
  entry: PokedexEntry;
  priority?: boolean;
}) {
  const t = useTranslations("Pokedex");
  return (
    <Link
      href={`/pokedex/${entry.slug}`}
      aria-label={`${entry.name}, ${t("card.setNumber", { number: entry.dexNumber, total: COLLECTION_SIZE })}`}
      className="holo-link block rounded-[14px] outline-offset-4"
    >
      <PokemonCard entry={entry} priority={priority} />
    </Link>
  );
}

export function PokemonGrid({ entries }: { entries: readonly PokedexEntry[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
      {entries.map((entry, index) => (
        <li key={entry.dexNumber}>
          <PokemonCardLink entry={entry} priority={index < 10} />
        </li>
      ))}
    </ul>
  );
}
