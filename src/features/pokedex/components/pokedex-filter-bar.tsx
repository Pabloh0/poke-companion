"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { TypeToggle } from "@/features/types/components/type-toggle";
import { POKEMON_TYPES } from "@/features/types/data/pokemon-types";
import { cn } from "@/lib/utils";
import { GENERATIONS, type Generation } from "../data/generations";
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
 * Search box and type "divider stickers": the coloured index labels you put
 * on binder dividers. Unselected stickers show a band of the type colour;
 * selected ones are filled with it.
 */
export function PokedexFilterBar({ filters, onChange }: FilterProps) {
  const t = useTranslations("Pokedex");
  const disabled = !onChange;
  const typeLimitReached = filters.types.length >= MAX_TYPE_FILTERS;

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="space-y-5"
    >
      <div>
        <label htmlFor="pokedex-search" className="text-sm font-semibold">
          {t("searchLabel")}
        </label>
        <div className="relative mt-1.5 max-w-xl">
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
            className="h-12 w-full rounded-md border border-input bg-card pr-3 pl-11 text-lg text-foreground placeholder:text-muted-foreground disabled:opacity-60"
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">
          {t("typesLabel")}{" "}
          <span className="font-normal text-muted-foreground">
            {t("typesHint")}
          </span>
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {POKEMON_TYPES.map((type) => {
            const selected = filters.types.includes(type);
            return (
              <TypeToggle
                key={type}
                type={type}
                selected={selected}
                disabled={disabled || (!selected && typeLimitReached)}
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
      </fieldset>
    </form>
  );
}

/**
 * Generations as the index tabs of a binder: one "volume" per generation.
 * Native radio inputs, so arrow keys and screen readers work out of the box.
 */
export function GenerationTabs({
  value,
  onChange,
}: {
  value: Generation | null;
  onChange?: (generation: Generation | null) => void;
}) {
  const t = useTranslations("Pokedex");
  const disabled = !onChange;
  const options: { value: Generation | null; label: string; title: string }[] =
    [
      { value: null, label: t("allGenerations"), title: t("allGenerations") },
      ...GENERATIONS.map((generation) => ({
        value: generation,
        label: t(`generationShort.${generation}`),
        title: t(`generations.${generation}`),
      })),
    ];

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{t("generationLabel")}</legend>
      <div className="-mb-px flex gap-0.5 overflow-x-auto px-1 pt-1">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value ?? "all"}
              title={option.title}
              className={cn(
                "relative shrink-0 cursor-pointer rounded-t-md border border-b-0 px-3.5 pt-2 pb-2.5 text-sm font-bold transition-colors has-[:disabled]:cursor-not-allowed has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                checked
                  ? "z-10 border-border bg-card text-foreground"
                  : "border-transparent bg-muted/70 text-muted-foreground hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="pokedex-generation"
                className="sr-only"
                checked={checked}
                disabled={disabled}
                onChange={() => onChange?.(option.value)}
              />
              <span className="condensed">{option.label}</span>
              {option.title !== option.label && (
                <span className="sr-only">{`, ${option.title}`}</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
