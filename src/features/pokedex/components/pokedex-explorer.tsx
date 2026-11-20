"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";
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
import { PokedexFilterBar } from "./pokedex-filter-bar";
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

      <section aria-labelledby="pokedex-results" className="mt-8">
        <h2 id="pokedex-results" className="sr-only">
          {t("resultsHeading")}
        </h2>
        <BinderPage>
          <div className="mb-5 flex min-h-9 flex-wrap items-center gap-x-4 gap-y-2.5">
            <p
              aria-live="polite"
              className="font-display text-xl font-bold condensed"
            >
              {t("cardCount", { count: results.length })}
            </p>
            <ActiveFilters filters={filters} onChange={updateFilters} />
            {hasActiveFilters(filters) && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
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

/** The binder page the cards sit on. */
function BinderPage({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card p-3 sm:p-6">{children}</div>;
}

/**
 * What is being filtered, as small chips next to the count. Each one removes
 * its own filter, which matters most on phones, where the panel is folded.
 */
function ActiveFilters({
  filters,
  onChange,
}: {
  filters: PokedexFilters;
  onChange: (filters: PokedexFilters) => void;
}) {
  const t = useTranslations("Pokedex");
  const tTypes = useTranslations("Types");
  const tForms = useTranslations("Forms");
  const query = filters.query.trim();

  const chips: { key: string; label: string; next: PokedexFilters }[] = [
    ...(query
      ? [
          {
            key: "query",
            label: t("searchChip", { query }),
            next: { ...filters, query: "" },
          },
        ]
      : []),
    ...(filters.generation
      ? [
          {
            key: "generation",
            label: t(`generations.${filters.generation}`),
            next: { ...filters, generation: null },
          },
        ]
      : []),
    ...filters.types.map((type) => ({
      key: type,
      label: tTypes(type),
      next: { ...filters, types: filters.types.filter((tp) => tp !== type) },
    })),
    ...(filters.region
      ? [
          {
            key: "region",
            label: tForms("formOf", {
              region: tForms(`regions.${filters.region}`),
            }),
            next: { ...filters, region: null },
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            aria-label={t("removeFilter", { filter: chip.label })}
            onClick={() => onChange(chip.next)}
            className="inline-flex h-7 items-center gap-1 rounded-full border bg-background pr-1.5 pl-2.5 text-sm font-semibold transition-colors hover:border-foreground/40"
          >
            {chip.label}
            <XIcon aria-hidden className="size-3.5 text-muted-foreground" />
          </button>
        </li>
      ))}
    </ul>
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
      <section className="mt-8">
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
