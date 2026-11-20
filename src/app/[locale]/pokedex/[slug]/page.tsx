import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { HoloSurface } from "@/features/pokedex/components/holo-surface";
import { PokemonHeroCard } from "@/features/pokedex/components/pokemon-hero-card";
import { PokemonPager } from "@/features/pokedex/components/pokemon-pager";
import { StatBars } from "@/features/pokedex/components/stat-bars";
import { neighbours } from "@/features/pokedex/lib/detail";
import { formatDexNumber } from "@/features/pokedex/lib/filters";
import { getPokedexEntries } from "@/features/pokedex/server/get-pokedex-entries";
import { getPokemonDetail } from "@/features/pokedex/server/get-pokemon-detail";
import { TypeBadge } from "@/features/types/components/type-badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Prerender every species at build time (one page per language). Slugs that
 * are not listed here render on the first request; unknown ones → 404.
 */
export async function generateStaticParams() {
  const locale = await rootLocale();
  const entries = await getPokedexEntries(
    hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  );
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/pokedex/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Pokemon"),
  ]);
  const pokemon = await getPokemonDetail(slug, locale);
  if (!pokemon) return {};
  return {
    title: pokemon.name,
    description: t("metaDescription", { name: pokemon.name }),
  };
}

export default async function PokemonPage({
  params,
}: PageProps<"/[locale]/pokedex/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const [pokemon, entries, t, tDex, format] = await Promise.all([
    getPokemonDetail(slug, locale),
    getPokedexEntries(locale),
    getTranslations("Pokemon"),
    getTranslations("Pokedex"),
    getFormatter(),
  ]);
  if (!pokemon) notFound();

  const { previous, next } = neighbours(entries, pokemon.dexNumber);
  const [mainType] = pokemon.types;
  const measure = (value: number, unit: "meter" | "kilogram") =>
    format.number(value, { style: "unit", unit, maximumFractionDigits: 1 });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6">
      <nav aria-label={t("breadcrumb")} className="text-sm font-semibold">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li>
            <Link href="/pokedex" className="hover:text-foreground">
              {t("backToPokedex")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            {pokemon.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        <HoloSurface>
          <PokemonHeroCard pokemon={pokemon} />
        </HoloSurface>

        <div className="min-w-0">
          <p className="font-display text-2xl font-bold text-highlight condensed tabular-nums">
            #{formatDexNumber(pokemon.dexNumber)}
          </p>
          <h1 className="mt-1 text-[clamp(3rem,14vw,6rem)] leading-[0.85] font-black tracking-tight [overflow-wrap:anywhere] condensed">
            {pokemon.name}
          </h1>
          {pokemon.genus && (
            <p
              lang={pokemon.genus.locale}
              className="mt-3 font-serif text-2xl text-muted-foreground italic"
            >
              {pokemon.genus.text}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
            {pokemon.rarity !== "common" && (
              <span className="ml-1 text-sm font-semibold">
                {tDex(`card.rarity.${pokemon.rarity}`)}
              </span>
            )}
          </div>

          <section aria-labelledby="entry-heading" className="mt-10">
            <h2
              id="entry-heading"
              className="text-sm font-bold text-muted-foreground"
            >
              {t("entryHeading")}
            </h2>
            {pokemon.flavorText ? (
              <blockquote
                lang={pokemon.flavorText.locale}
                className="mt-3 max-w-[52ch] border-l-[3px] border-(--entry) pl-5 font-serif text-2xl leading-snug italic"
                style={
                  {
                    "--entry": `var(--color-type-${mainType})`,
                  } as CSSProperties
                }
              >
                {pokemon.flavorText.text}
              </blockquote>
            ) : (
              <p className="mt-3 font-serif text-lg text-muted-foreground">
                {t("noEntry")}
              </p>
            )}
            {pokemon.flavorText && pokemon.flavorText.locale !== locale && (
              <p className="mt-2 pl-5 text-sm text-muted-foreground">
                {t("onlyInEnglish")}
              </p>
            )}
          </section>

          <section aria-labelledby="data-heading" className="mt-10">
            <h2 id="data-heading" className="sr-only">
              {t("dataHeading")}
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-foreground/15 pt-6 sm:grid-cols-4">
              <div>
                <dt className="text-sm font-semibold text-muted-foreground">
                  {t("height")}
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold condensed">
                  {measure(pokemon.heightM, "meter")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-muted-foreground">
                  {t("weight")}
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold condensed">
                  {measure(pokemon.weightKg, "kilogram")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-muted-foreground">
                  {t("region")}
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold condensed">
                  {tDex(`regions.${pokemon.generation}`)}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-sm font-semibold text-muted-foreground">
                  {t("abilities")}
                </dt>
                <dd className="mt-1">
                  <ul className="space-y-0.5">
                    {pokemon.abilities.map((ability) => (
                      <li key={ability.slug} className="font-semibold">
                        {ability.name}
                        {ability.isHidden && (
                          <span className="ml-1.5 font-serif text-sm font-normal text-muted-foreground italic">
                            ({t("hiddenAbility")})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <section
        aria-labelledby="stats-heading"
        className="mt-16 border-t-[3px] border-foreground pt-10"
      >
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <div>
            <h2
              id="stats-heading"
              className="text-3xl font-black tracking-tight condensed"
            >
              {t("statsHeading")}
            </h2>
            <p className="mt-3 font-serif text-lg leading-snug text-muted-foreground">
              {t("statsIntro")}
            </p>
          </div>
          <StatBars
            stats={pokemon.stats}
            total={pokemon.baseStatTotal}
            type={mainType ?? "normal"}
          />
        </div>
      </section>

      <div className="mt-16">
        <PokemonPager previous={previous} next={next} />
      </div>
    </div>
  );
}
