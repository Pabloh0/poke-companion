"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Link } from "@/i18n/navigation";
import { POKEMON_TYPES } from "../data/pokemon-types";
import {
  EMPTY_CALCULATOR,
  maxTypes,
  parseCalculator,
  pickType,
  serializeCalculator,
  switchMode,
  type CalculatorState,
} from "../lib/calculator";
import {
  ATTACK_ORDER,
  DEFENSE_ORDER,
  defensiveProfile,
  MULTIPLIER_KEY,
  offensiveProfile,
} from "../lib/effectiveness";
import { MatchupList } from "./matchup-list";
import { TypeBadge } from "./type-badge";
import { TypeToggle } from "./type-toggle";

/**
 * Interactive calculator. Everything is computed in the browser from the
 * chart in code, so results change as you click. The state is mirrored to
 * the URL (?mode=attack&types=ground) to share or bookmark a matchup.
 */
export function TypeCalculator() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<CalculatorState>(() =>
    parseCalculator(searchParams),
  );

  function update(next: CalculatorState) {
    setState(next);
    // Same approach as the Pokédex: no request, no history spam.
    const query = serializeCalculator(next);
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  }

  return <CalculatorPanel state={state} onChange={update} />;
}

/** Prerendered stand-in while the browser reads the URL. */
export function TypeCalculatorFallback() {
  return <CalculatorPanel state={EMPTY_CALCULATOR} />;
}

function CalculatorPanel({
  state,
  onChange,
}: {
  state: CalculatorState;
  /** Without it the controls render disabled (placeholder while loading). */
  onChange?: (state: CalculatorState) => void;
}) {
  const t = useTranslations("TypeCalculator");
  const disabled = !onChange;

  return (
    <section aria-labelledby="calculator-heading">
      <h2 id="calculator-heading" className="sr-only">
        {t("calculatorHeading")}
      </h2>
      <div className="grid gap-x-12 gap-y-10 rounded-xl border bg-card p-4 sm:p-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <div role="group" aria-labelledby="calculator-mode-label">
            <p
              id="calculator-mode-label"
              className="font-display text-lg leading-tight font-bold condensed"
            >
              {t("modeLabel")}
            </p>
            <SegmentedControl
              name="calculator-mode"
              className="mt-2.5 grid-cols-2"
              value={state.mode}
              onChange={
                onChange
                  ? (mode) => onChange(switchMode(state, mode))
                  : undefined
              }
              options={(["defense", "attack"] as const).map((mode) => ({
                value: mode,
                label: t(`modes.${mode}`),
              }))}
            />
          </div>
          <div role="group" aria-labelledby="calculator-types-label">
            <p id="calculator-types-label">
              <span className="block font-display text-lg leading-tight font-bold condensed">
                {t("typesLabel")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t(`hint.${state.mode}`)}
              </span>
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-3">
              {POKEMON_TYPES.map((type) => (
                <TypeToggle
                  key={type}
                  type={type}
                  selected={state.types.includes(type)}
                  disabled={disabled}
                  className="w-full"
                  onToggle={() => onChange?.(pickType(state, type))}
                />
              ))}
            </div>
          </div>
          {state.types.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => onChange?.({ ...state, types: [] })}
            >
              {t("clear")}
            </Button>
          )}
        </div>

        <div aria-live="polite" className="min-w-0">
          <Results state={state} />
        </div>
      </div>
    </section>
  );
}

function Results({ state }: { state: CalculatorState }) {
  const t = useTranslations("TypeCalculator");
  const [attack] = state.types;

  if (state.types.length === 0) {
    return (
      <div className="grid h-full min-h-48 place-items-center rounded-lg border-2 border-dashed px-6 py-10 text-center">
        <p className="max-w-[36ch] font-serif text-lg text-muted-foreground">
          {t(`empty.${state.mode}`, { max: maxTypes(state.mode) })}
        </p>
      </div>
    );
  }

  const offense =
    state.mode === "attack" && attack ? offensiveProfile(attack) : null;
  const defense = defensiveProfile(state.types);
  const rows = offense
    ? ATTACK_ORDER.map((multiplier) => ({
        multiplier,
        label: t(`attack.${MULTIPLIER_KEY[multiplier]}`),
        types: offense[multiplier],
      }))
    : DEFENSE_ORDER.map((multiplier) => ({
        multiplier,
        label: t(`defense.${MULTIPLIER_KEY[multiplier]}`),
        types: defense[multiplier],
      }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm font-semibold text-muted-foreground">
          {t(`resultFor.${state.mode}`)}
        </p>
        <div className="flex gap-1.5">
          {state.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <MatchupList rows={rows} />
      </div>
      {state.mode === "defense" && (
        <p className="mt-4 text-sm">
          <Link
            // A plain string keeps the comma readable (types=fire,water).
            href={`/pokedex?types=${state.types.join(",")}`}
            className="font-semibold underline decoration-2 underline-offset-4 hover:text-highlight"
          >
            {t("seeInPokedex")}
          </Link>
        </p>
      )}
    </div>
  );
}
