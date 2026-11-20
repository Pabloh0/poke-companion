import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  PokedexExplorer,
  PokedexExplorerFallback,
} from "@/features/pokedex/components/pokedex-explorer";
import { comparePokedexOrder } from "@/features/pokedex/lib/regional";
import { getPokedexEntries } from "@/features/pokedex/server/get-pokedex-entries";
import { getRegionalForms } from "@/features/pokedex/server/get-regional-forms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pokedex");
  return {
    title: t("title"),
    description: t("description", { species: 1025, forms: 57 }),
  };
}

export default async function PokedexPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Pokedex"),
  ]);
  const [species, forms] = await Promise.all([
    getPokedexEntries(locale),
    getRegionalForms(locale),
  ]);
  // Each regional form right after its original: Vulpix, Vulpix de Alola…
  const entries = [...species, ...forms].sort(comparePokedexOrder);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      {/* Like the spine label of a binder: big title over a heavy rule. */}
      <header className="mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b-[3px] border-foreground pb-5">
        <h1 className="text-7xl leading-[0.82] font-black tracking-tight condensed sm:text-8xl">
          {t("title")}
        </h1>
        <p className="max-w-[44ch] font-serif text-lg leading-snug text-muted-foreground">
          {t("intro", { species: species.length, forms: forms.length })}
        </p>
      </header>
      {/* The explorer reads the URL (?q=…&types=…) in the browser; until then
          the prerendered fallback shows the same layout, unfiltered. */}
      <Suspense fallback={<PokedexExplorerFallback entries={entries} />}>
        <PokedexExplorer entries={entries} />
      </Suspense>
    </div>
  );
}
