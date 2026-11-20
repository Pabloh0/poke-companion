import { cn } from "@/lib/utils";
import type { PokemonType } from "../data/pokemon-types";
import { formatMultiplier, type DamageMultiplier } from "../lib/effectiveness";
import { TypeBadge } from "./type-badge";

export type MatchupRow = {
  multiplier: DamageMultiplier;
  /** "Muy débil", "Resiste"… */
  label: string;
  types: readonly PokemonType[];
};

/**
 * Type matchups as a printed reference card: the multiplier in big numerals
 * on the left, the types on the right. Neutral damage (×1) is shown quieter
 * because it is the least useful information. Empty rows are skipped.
 */
export function MatchupList({
  rows,
  size = "md",
}: {
  rows: readonly MatchupRow[];
  size?: "sm" | "md";
}) {
  const visible = rows.filter((row) => row.types.length > 0);
  return (
    <dl className="divide-y divide-foreground/15 border-y border-foreground/15">
      {visible.map((row) => {
        const neutral = row.multiplier === 1;
        return (
          <div
            key={row.multiplier}
            className={cn(
              "grid items-baseline gap-x-4",
              size === "md"
                ? "grid-cols-[5.5rem_1fr] py-3.5"
                : "grid-cols-[4.5rem_1fr] py-2.5",
            )}
          >
            <dt className={cn(neutral && "text-muted-foreground")}>
              <span
                className={cn(
                  "block leading-none font-black condensed tabular-nums",
                  size === "md" ? "text-4xl" : "text-3xl",
                )}
              >
                {formatMultiplier(row.multiplier)}
              </span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                {row.label}
              </span>
            </dt>
            <dd
              className={cn(
                "flex flex-wrap gap-1.5 self-center",
                neutral && "opacity-75",
              )}
            >
              {row.types.map((type) => (
                <TypeBadge key={type} type={type} />
              ))}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
