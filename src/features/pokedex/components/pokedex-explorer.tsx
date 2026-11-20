"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  EMPTY_FILTERS,
  filterEntries,
  hasActiveFilters,
  parseFilters,
  serializeFilters,
  type PokedexEntry,
  type PokedexFilters,
} from "../lib/filters";
import { HoloSurface } from "./holo-surface";
import { GenerationTabs, PokedexFilterBar } from "./pokedex-filter-bar";
import { PokemonGrid } from "./pokemon-card";

/** Cards rendered at first and per "Show more" click (divisible by 2–5). */
export const PAGE_SIZE = 60;

/**
 * Interactive Pokédex. All entries are already here (≈1025 small objects),
 * so filtering happens in the browser: instant results while typing, no
 * network round-trips. Filters are mirrored to the URL so a search can be
 * shared or bookmarked.
 */
export function PokedexExplorer({
  entries,
}: {
  entries: readonly PokedexEntry[];
}) {
  const t = useTranslations("Pokedex");
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<PokedexFilters>(() =>
    parseFilters(searchParams),
  );
  const [limit, setLimit] = useState(PAGE_SIZE);

  const results = useMemo(
    () => filterEntries(entries, filters),
    [entries, filters],
  );
  const visible = results.slice(0, limit);

  function updateFilters(next: PokedexFilters) {
    setFilters(next);
    setLimit(PAGE_SIZE);
    // Native History API: Next.js keeps its router in sync, and no request
    // is made (replaceState: typing doesn't flood the back button).
    const query = serializeFilters(next);
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  }

  return (
    <div>
      <PokedexFilterBar filters={filters} onChange={updateFilters} />

      <section aria-labelledby="pokedex-results" className="mt-10">
        <h2 id="pokedex-results" className="sr-only">
          {t("resultsHeading")}
        </h2>
        <GenerationTabs
          value={filters.generation}
          onChange={(generation) => updateFilters({ ...filters, generation })}
        />
        <BinderPage>
          <div className="mb-5 flex min-h-9 flex-wrap items-center justify-between gap-3">
            <p
              aria-live="polite"
              className="font-display text-xl font-bold condensed"
            >
              {t("cardCount", { count: results.length })}
            </p>
            {hasActiveFilters(filters) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters(EMPTY_FILTERS)}
              >
                {t("clearFilters")}
              </Button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed px-6 py-16 text-center">
              <p className="font-display text-2xl font-bold condensed">
                {t("emptyTitle")}
              </p>
              <p className="mx-auto mt-2 max-w-[48ch] font-serif text-lg text-muted-foreground">
                {t("emptyDescription")}
              </p>
              <Button
                className="mt-6"
                onClick={() => updateFilters(EMPTY_FILTERS)}
              >
                {t("clearFilters")}
              </Button>
            </div>
          ) : (
            <HoloSurface>
              <PokemonGrid entries={visible} />
            </HoloSurface>
          )}

          {visible.length < results.length && (
            <div className="flex flex-col items-center gap-3 pt-10">
              <p className="text-sm text-muted-foreground">
                {t("showing", { shown: visible.length, total: results.length })}
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLimit((current) => current + PAGE_SIZE)}
              >
                {t("showMore")}
              </Button>
            </div>
          )}
        </BinderPage>
      </section>
    </div>
  );
}

/** The page of the binder the cards sit on, under the generation tabs. */
function BinderPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl rounded-tl-none border bg-card p-4 sm:p-6">
      {children}
    </div>
  );
}

/**
 * Prerendered stand-in while the browser reads the URL's filters: the same
 * layout with the first page of cards, so there is no layout jump.
 */
export function PokedexExplorerFallback({
  entries,
}: {
  entries: readonly PokedexEntry[];
}) {
  const t = useTranslations("Pokedex");
  return (
    <div>
      <PokedexFilterBar filters={EMPTY_FILTERS} />
      <section className="mt-10">
        <GenerationTabs value={null} />
        <BinderPage>
          <div className="mb-5 flex min-h-9 items-center">
            <p className="font-display text-xl font-bold condensed">
              {t("cardCount", { count: entries.length })}
            </p>
          </div>
          <PokemonGrid entries={entries.slice(0, PAGE_SIZE)} />
        </BinderPage>
      </section>
    </div>
  );
}
