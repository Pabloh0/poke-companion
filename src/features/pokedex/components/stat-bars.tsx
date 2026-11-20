import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import type { PokemonType } from "@/features/types/data/pokemon-types";
import {
  MAX_BASE_STAT,
  statBarPercent,
  type PokemonDetail,
} from "../lib/detail";

/**
 * Base stats as horizontal bars over the maximum possible value (255).
 * The number is always printed: the bar is a visual aid, not the only
 * carrier of the information.
 */
export function StatBars({
  stats,
  total,
  type,
}: {
  stats: PokemonDetail["stats"];
  total: number;
  /** Main type: colours the bars. */
  type: PokemonType;
}) {
  const t = useTranslations("Pokemon");

  return (
    <dl
      className="space-y-3"
      style={{ "--bar": `var(--color-type-${type})` } as CSSProperties}
    >
      {stats.map(({ stat, value }) => (
        <div
          key={stat}
          className="grid grid-cols-[6.5rem_2.75rem_1fr] items-center gap-3 sm:grid-cols-[8rem_3rem_1fr]"
        >
          <dt className="text-sm font-semibold text-muted-foreground">
            {t(`stats.${stat}`)}
          </dt>
          <dd className="text-right font-display text-xl font-bold condensed tabular-nums">
            {value}
          </dd>
          <dd
            aria-hidden
            className="h-3 overflow-hidden rounded-[3px] bg-muted"
          >
            <div
              className="h-full rounded-[3px] bg-(--bar) shadow-[inset_0_-2px_0_rgb(0_0_0/0.15)]"
              style={{ width: `${statBarPercent(value)}%` }}
            />
          </dd>
        </div>
      ))}
      <div className="grid grid-cols-[6.5rem_2.75rem_1fr] items-center gap-3 border-t border-foreground/15 pt-3 sm:grid-cols-[8rem_3rem_1fr]">
        <dt className="text-sm font-bold">{t("total")}</dt>
        <dd className="text-right font-display text-xl font-black condensed tabular-nums">
          {total}
        </dd>
        <dd className="text-xs text-muted-foreground">
          {/* Context for the bars' scale. */}
          <span className="sr-only">{`/ ${MAX_BASE_STAT}`}</span>
        </dd>
      </div>
    </dl>
  );
}
