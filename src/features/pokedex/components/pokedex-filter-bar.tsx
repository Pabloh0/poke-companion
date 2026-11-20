"use client";

import { useState } from "react";
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TypeToggle } from "@/features/types/components/type-toggle";
import { POKEMON_TYPES } from "@/features/types/data/pokemon-types";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import { GENERATIONS } from "../data/generations";
import { REGIONS } from "../data/regional-forms";
import {
  MAX_TYPE_FILTERS,
  toggleType,
  type PokedexFilters,
} from "../lib/filters";

type FilterProps = {
  filters: PokedexFilters;
  /** Without it the controls render disabled (placeholder while loading). */
  onChange?: (filters: PokedexFilters) => void;
};

/**
 * The filter panel, laid out like the index sheet at the front of a binder:
 * one row per filter, its name on the left and the controls on the right,
 * separated by thin rules. Types sit in a fixed grid (6 × 3, or 3 × 6 on a
 * phone) instead of a ragged line, so the panel always has the same shape.
 *
 * Every control fills the same column, so their edges line up, and they all
 * sit on the same plane: the selected option is filled, nothing is stacked
 * behind anything else.
 *
 * On phones, generation, types and regions fold behind a "Filters" button so
 * the cards are not pushed far down the page; search stays visible.
 */
export function PokedexFilterBar({ filters, onChange }: FilterProps) {
  const t = useTranslations("Pokedex");
  const [open, setOpen] = useState(false);
  const disabled = !onChange;
  const typeLimitReached = filters.types.length >= MAX_TYPE_FILTERS;
  const tForms = useTranslations("Forms");
  const activeCount =
    filters.types.length +
    (filters.region ? 1 : 0) +
    (filters.generation ? 1 : 0);

  return (
    <form
      role="search"
      aria-label={t("filtersHeading")}
      onSubmit={(event) => event.preventDefault()}
      className="divide-y rounded-xl border bg-card"
    >
      <FilterRow
        label={t("searchLabel")}
        hint={t("searchHint")}
        htmlFor="pokedex-search"
      >
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="pokedex-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              maxLength={50}
              placeholder={t("searchPlaceholder")}
              value={filters.query}
              disabled={disabled}
              onChange={(event) =>
                onChange?.({ ...filters, query: event.target.value })
              }
              className="h-11 w-full rounded-md border border-input bg-background pr-3 pl-11 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-60"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            aria-expanded={open}
            aria-controls="pokedex-more-filters"
            onClick={() => setOpen((value) => !value)}
            className="h-11 shrink-0 gap-1.5 sm:hidden"
          >
            <SlidersHorizontalIcon aria-hidden />
            {t("filtersButton")}
            {activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-foreground text-xs font-bold text-background tabular-nums">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </FilterRow>

      <div
        id="pokedex-more-filters"
        className={cn(open ? "block" : "hidden", "divide-y sm:block")}
      >
        <FilterRow
          label={t("generationLabel")}
          hint={t("generationHint")}
          groupId="pokedex-generation-label"
        >
          <SegmentedControl
            name="pokedex-generation"
            className="grid-cols-5 sm:grid-cols-10"
            value={filters.generation}
            onChange={
              onChange
                ? (generation) => onChange({ ...filters, generation })
                : undefined
            }
            options={[
              { value: null, label: t("allGenerations") },
              ...GENERATIONS.map((generation) => ({
                value: generation,
                label: t(`generationShort.${generation}`),
                srLabel: t(`regions.${generation}`),
              })),
            ]}
          />
        </FilterRow>

        <FilterRow
          label={t("typesLabel")}
          hint={t("typesHint")}
          groupId="pokedex-types-label"
        >
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {POKEMON_TYPES.map((type) => {
              const selected = filters.types.includes(type);
              return (
                <TypeToggle
                  key={type}
                  type={type}
                  selected={selected}
                  disabled={disabled || (!selected && typeLimitReached)}
                  className="w-full"
                  onToggle={() =>
                    onChange?.({
                      ...filters,
                      types: toggleType(filters.types, type),
                    })
                  }
                />
              );
            })}
          </div>
        </FilterRow>

        <FilterRow
          label={t("formsLabel")}
          hint={t("formsHint")}
          groupId="pokedex-forms-label"
        >
          <SegmentedControl
            name="pokedex-region"
            className="grid-cols-5"
            value={filters.region}
            onChange={
              onChange
                ? (region) => onChange({ ...filters, region })
                : undefined
            }
            options={[
              { value: null, label: t("allForms") },
              ...REGIONS.map((region) => ({
                value: region,
                label: tForms(`regions.${region}`),
              })),
            ]}
          />
        </FilterRow>
      </div>
    </form>
  );
}

/**
 * One line of the panel. With `htmlFor` the name labels a single input;
 * with `groupId` it names a group of buttons (role="group").
 */
function FilterRow({
  label,
  hint,
  htmlFor,
  groupId,
  children,
}: {
  label: string;
  hint: string;
  htmlFor?: string;
  groupId?: string;
  children: React.ReactNode;
}) {
  const heading = (
    <>
      <span className="block font-display text-lg leading-tight font-bold condensed">
        {label}
      </span>
      <span className="block text-xs text-muted-foreground">{hint}</span>
    </>
  );
  return (
    <div
      role={groupId ? "group" : undefined}
      aria-labelledby={groupId}
      className="grid gap-x-8 gap-y-2.5 px-4 py-4 sm:px-6 md:grid-cols-[9rem_minmax(0,1fr)] md:items-center"
    >
      {htmlFor ? (
        <label htmlFor={htmlFor}>{heading}</label>
      ) : (
        <div id={groupId}>{heading}</div>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
