"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  typeBackgroundClass,
  typeTextClass,
} from "@/features/types/components/type-badge";
import { POKEMON_TYPES } from "@/features/types/data/pokemon-types";
import { cn } from "@/lib/utils";
import { GENERATIONS, isGeneration } from "../data/generations";
import {
  MAX_TYPE_FILTERS,
  toggleType,
  type PokedexFilters,
} from "../lib/filters";

type FilterBarProps = {
  filters: PokedexFilters;
  /** Without it the bar renders disabled (placeholder while loading). */
  onChange?: (filters: PokedexFilters) => void;
};

const fieldClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-60";

export function PokedexFilterBar({ filters, onChange }: FilterBarProps) {
  const t = useTranslations("Pokedex");
  const tTypes = useTranslations("Types");
  const disabled = !onChange;
  const typeLimitReached = filters.types.length >= MAX_TYPE_FILTERS;

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="space-y-5 rounded-xl border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="pokedex-search" className="text-sm font-semibold">
            {t("searchLabel")}
          </label>
          <div className="relative mt-1.5">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
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
              className={cn(fieldClass, "pl-9")}
            />
          </div>
        </div>
        <div className="sm:w-60">
          <label htmlFor="pokedex-generation" className="text-sm font-semibold">
            {t("generationLabel")}
          </label>
          <select
            id="pokedex-generation"
            value={filters.generation ?? ""}
            disabled={disabled}
            onChange={(event) => {
              const value = Number(event.target.value);
              onChange?.({
                ...filters,
                generation: isGeneration(value) ? value : null,
              });
            }}
            className={cn(fieldClass, "mt-1.5")}
          >
            <option value="">{t("allGenerations")}</option>
            {GENERATIONS.map((generation) => (
              <option key={generation} value={generation}>
                {t(`generations.${generation}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">
          {t("typesLabel")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("typesHint")}
          </span>
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {POKEMON_TYPES.map((type) => {
            const selected = filters.types.includes(type);
            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                disabled={disabled || (!selected && typeLimitReached)}
                onClick={() =>
                  onChange?.({
                    ...filters,
                    types: toggleType(filters.types, type),
                  })
                }
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  selected
                    ? cn(
                        typeBackgroundClass(type),
                        typeTextClass(type),
                        "border-transparent",
                      )
                    : "bg-background hover:bg-accent",
                )}
              >
                {!selected && (
                  <span
                    aria-hidden
                    className={cn(
                      "size-2.5 rounded-full",
                      typeBackgroundClass(type),
                    )}
                  />
                )}
                {tTypes(type)}
              </button>
            );
          })}
        </div>
      </fieldset>
    </form>
  );
}
