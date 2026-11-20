import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  PokedexExplorer,
  PokedexExplorerFallback,
} from "@/features/pokedex/components/pokedex-explorer";
import { getPokedexEntries } from "@/features/pokedex/server/get-pokedex-entries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pokedex");
  return { title: t("title"), description: t("description") };
}

export default async function PokedexPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("Pokedex"),
  ]);
  const entries = await getPokedexEntries(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg text-muted-foreground">
          {t("intro")}
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
