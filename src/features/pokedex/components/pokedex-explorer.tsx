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
import { PokedexFilterBar } from "./pokedex-filter-bar";
import { PokemonGrid } from "./pokemon-card";

/** Cards rendered at first and per "Show more" click. */
export const PAGE_SIZE = 96;

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
    <div className="space-y-6">
      <PokedexFilterBar filters={filters} onChange={updateFilters} />

      <section aria-labelledby="pokedex-results" className="space-y-4">
        <h2 id="pokedex-results" className="sr-only">
          {t("resultsHeading")}
        </h2>
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="font-semibold">
            {t("results", { count: results.length })}
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
          <div className="rounded-xl border border-dashed px-6 py-14 text-center">
            <p className="font-display text-lg font-semibold">
              {t("emptyTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-[48ch] text-muted-foreground">
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
          <PokemonGrid entries={visible} />
        )}

        {visible.length < results.length && (
          <div className="flex flex-col items-center gap-3 pt-4">
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
      </section>
    </div>
  );
}

/**
 * Prerendered stand-in while the browser reads the URL's filters: the same
 * layout with the first page of Pokémon, so there is no layout jump.
 */
export function PokedexExplorerFallback({
  entries,
}: {
  entries: readonly PokedexEntry[];
}) {
  const t = useTranslations("Pokedex");
  return (
    <div className="space-y-6">
      <PokedexFilterBar filters={EMPTY_FILTERS} />
      <section className="space-y-4">
        <div className="flex min-h-9 items-center">
          <p className="font-semibold">
            {t("results", { count: entries.length })}
          </p>
        </div>
        <PokemonGrid entries={entries.slice(0, PAGE_SIZE)} />
      </section>
    </div>
  );
}
