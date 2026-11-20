import type { CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TypeBadge } from "@/features/types/components/type-badge";
import { cn } from "@/lib/utils";
import type { PokemonDetail } from "../lib/detail";
import { formatDexNumber } from "../lib/filters";
import { artworkUrl } from "../lib/sprites";
import { COLLECTION_SIZE, RARITY_MARK } from "./pokemon-card";

/**
 * The detail page's card: the same design as the list card, printed large,
 * with the official artwork instead of the pixel sprite. Holo comes from a
 * surrounding <HoloSurface>.
 */
export function PokemonHeroCard({ pokemon }: { pokemon: PokemonDetail }) {
  const t = useTranslations("Pokedex");
  const [first, second = first] = pokemon.types;
  const frameStyle = {
    "--t1": `var(--color-type-${first})`,
    "--t2": `var(--color-type-${second})`,
  } as CSSProperties;

  return (
    <article
      data-holo
      data-rarity={pokemon.rarity}
      style={frameStyle}
      className="holo-card relative mx-auto aspect-[5/7] w-full max-w-sm rounded-[22px] bg-[linear-gradient(135deg,var(--t1),var(--t2))] p-2 shadow-[0_2px_2px_rgb(20_24_40/0.12),0_24px_48px_-20px_rgb(20_24_40/0.55)]"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[15px] bg-stock text-stock-ink">
        <div className="flex items-center gap-2 px-4 pt-3">
          <p className="min-w-0 truncate font-display text-2xl leading-tight font-extrabold condensed">
            {pokemon.form?.baseName ?? pokemon.name}
          </p>
          {pokemon.form && (
            <span
              aria-hidden
              className="ml-auto shrink-0 rounded-[3px] bg-stock-ink px-1.5 py-0.5 text-xs leading-tight font-bold text-stock condensed"
            >
              {pokemon.form.regionLabel}
            </span>
          )}
        </div>
        <div className="relative mx-3 mt-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_50%_60%,color-mix(in_oklab,var(--t1)_40%,white),color-mix(in_oklab,var(--t1)_14%,white)_72%)] ring-1 ring-stock-ink/10">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(rgb(26_28_35/0.09)_1px,transparent_1.3px)] [background-size:7px_7px]"
          />
          {/* Official artwork (475×475). Decorative: the name is the page h1. */}
          <Image
            src={artworkUrl(pokemon.id)}
            alt=""
            width={475}
            height={475}
            unoptimized
            priority
            className="relative aspect-square w-[88%] object-contain drop-shadow-[0_6px_10px_rgb(20_24_40/0.25)]"
          />
        </div>
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <div className="flex gap-1.5">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
          <p className="text-xs text-stock-ink-muted">
            {t("card.total")}{" "}
            <span className="text-lg font-bold text-stock-ink condensed tabular-nums">
              {pokemon.baseStatTotal}
            </span>
          </p>
        </div>
        <p
          lang={pokemon.form?.variantLabel ? undefined : pokemon.genus?.locale}
          className="min-h-7 truncate px-4 pt-1.5 font-serif text-base text-stock-ink-muted italic"
        >
          {pokemon.form?.variantLabel ?? pokemon.genus?.text}
        </p>
        <footer className="mt-2 flex items-center justify-between border-t border-stock-ink/10 bg-stock-shade px-4 py-2 text-xs text-stock-ink-muted">
          <span className="font-semibold condensed tabular-nums">
            {formatDexNumber(pokemon.dexNumber)}/{COLLECTION_SIZE}
          </span>
          <span>
            {t("card.generation", {
              generation: t(`generationShort.${pokemon.generation}`),
            })}
          </span>
          <span
            title={t(`card.rarity.${pokemon.rarity}`)}
            className={cn(
              "text-base leading-none",
              pokemon.rarity !== "common" && "text-stock-ink",
            )}
          >
            <span aria-hidden>{RARITY_MARK[pokemon.rarity]}</span>
            <span className="sr-only">
              {t(`card.rarity.${pokemon.rarity}`)}
            </span>
          </span>
        </footer>
      </div>
      <div aria-hidden className="holo-foil" />
    </article>
  );
}
