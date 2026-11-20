import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { CardFan } from "@/features/pokedex/components/card-fan";
import { getPokedexEntries } from "@/features/pokedex/server/get-pokedex-entries";
import { typeBackgroundClass } from "@/features/types/components/type-badge";
import { POKEMON_TYPES } from "@/features/types/data/pokemon-types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Sample hand: the three Kanto starters, Pikachu, and Mew (foil) in front. */
const HAND = [1, 4, 151, 7, 25];

// Order matches docs/06-DevelopmentRoadmap.md.
const MODULES = [
  { id: "pokedex", status: "available", href: "/pokedex" },
  { id: "typeCalculator", status: "available", href: "/tipos" },
  { id: "evolutions", status: "planned" },
  { id: "database", status: "planned" },
  { id: "accounts", status: "planned" },
  { id: "teamBuilder", status: "planned" },
  { id: "collection", status: "planned" },
  { id: "community", status: "planned" },
] as const;

export default async function HomePage() {
  const [locale, t, tTypes] = await Promise.all([
    getLocale(),
    getTranslations("Home"),
    getTranslations("Types"),
  ]);
  const entries = await getPokedexEntries(locale);
  const hand = HAND.flatMap((dex) => {
    const entry = entries.find((candidate) => candidate.dexNumber === dex);
    return entry ? [entry] : [];
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-x-10 gap-y-10 overflow-x-clip pt-12 pb-16 sm:pt-16 lg:grid-cols-[1fr_1fr] lg:pb-24">
        <div>
          <h1 className="max-w-[12ch] text-6xl leading-[0.88] font-black tracking-tight condensed sm:text-7xl lg:text-[5.5rem]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-[46ch] font-serif text-xl leading-snug text-muted-foreground">
            {t("intro")}
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-6 text-base">
            <Link href="/pokedex">{t("openPokedex")}</Link>
          </Button>
        </div>
        <CardFan entries={hand} label={t("handLabel")} />
      </section>

      <section
        aria-labelledby="types-heading"
        className="border-t-[3px] border-foreground py-12"
      >
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <div>
            <h2
              id="types-heading"
              className="text-3xl font-black tracking-tight condensed"
            >
              {t("typesHeading")}
            </h2>
            <p className="mt-3 font-serif text-lg leading-snug text-muted-foreground">
              {t("typesIntro")}
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {POKEMON_TYPES.map((type) => (
              <li key={type}>
                {/* No prefetch: 18 links to the same static page would only
                    download it 18 times. */}
                <Link
                  href={{ pathname: "/pokedex", query: { types: type } }}
                  prefetch={false}
                  aria-label={t("typeLink", { type: tTypes(type) })}
                  className="group relative flex h-12 items-center overflow-hidden rounded-[5px] border bg-card pr-2 pl-5 font-semibold transition-colors hover:border-foreground/40"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-2 transition-[width] duration-200 group-hover:w-3",
                      typeBackgroundClass(type),
                    )}
                  />
                  {tTypes(type)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="roadmap-heading"
        className="border-t-[3px] border-foreground py-12"
      >
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <div>
            <h2
              id="roadmap-heading"
              className="text-3xl font-black tracking-tight condensed"
            >
              {t("roadmapHeading")}
            </h2>
            <p className="mt-3 font-serif text-lg leading-snug text-muted-foreground">
              {t("roadmapIntro")}
            </p>
          </div>
          {/* A card-set checklist: number, box, name. The numbering is a real
              sequence (release order). */}
          <ol className="divide-y divide-foreground/15">
            {MODULES.map((module, index) => {
              const available = module.status === "available";
              return (
                <li
                  key={module.id}
                  className="grid grid-cols-[3.25rem_1.25rem_1fr] items-baseline gap-x-3 py-4 first:pt-0 sm:grid-cols-[3.5rem_1.25rem_1fr_auto]"
                >
                  <span className="font-display text-sm font-bold text-muted-foreground condensed tabular-nums">
                    {String(index + 1).padStart(3, "0")}/
                    {String(MODULES.length).padStart(3, "0")}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-[1.1rem] translate-y-[0.15rem] place-items-center rounded-[3px] border-2 text-[0.7rem] leading-none font-black",
                      available
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/40",
                    )}
                  >
                    {available ? "✓" : ""}
                  </span>
                  <div>
                    <h3 className="font-sans text-lg leading-tight font-bold">
                      {"href" in module ? (
                        <Link
                          href={module.href}
                          className="underline decoration-2 underline-offset-4 hover:text-highlight"
                        >
                          {t(`modules.${module.id}.name`)}
                        </Link>
                      ) : (
                        t(`modules.${module.id}.name`)
                      )}
                    </h3>
                    <p className="mt-1 max-w-[58ch] font-serif text-muted-foreground">
                      {t(`modules.${module.id}.description`)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "col-start-3 mt-2 text-sm font-semibold sm:col-start-4 sm:mt-0",
                      available ? "text-highlight" : "text-muted-foreground",
                    )}
                  >
                    {t(`status.${module.status}`)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
