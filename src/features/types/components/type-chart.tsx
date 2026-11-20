import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { POKEMON_TYPES } from "../data/pokemon-types";
import type { Multiplier } from "../data/type-chart";
import { attackMultiplier, MULTIPLIER_KEY } from "../lib/effectiveness";
import { typeBackgroundClass, typeTextClass } from "./type-badge";

const CELL: Record<Multiplier, { symbol: string; className: string }> = {
  2: { symbol: "2", className: "bg-primary text-primary-foreground" },
  1: { symbol: "", className: "bg-muted/40" },
  0.5: { symbol: "½", className: "bg-muted text-foreground" },
  0: { symbol: "0", className: "bg-foreground text-background" },
};

/**
 * The full 18 × 18 chart as a real <table>: rows are the attacking type,
 * columns the defending one. Server-rendered (no JavaScript). On narrow
 * screens it scrolls sideways inside its own box, with the row headers
 * pinned, instead of shrinking the cells until they are unreadable.
 * Every cell carries its number, so colour is never the only cue.
 */
export function TypeChart() {
  const t = useTranslations("TypeCalculator");
  const tTypes = useTranslations("Types");

  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {([2, 0.5, 0] as const).map((multiplier) => (
          <li key={multiplier} className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "grid size-6 place-items-center rounded-[3px] text-xs font-black",
                CELL[multiplier].className,
              )}
            >
              {CELL[multiplier].symbol}
            </span>
            {t(`legend.${MULTIPLIER_KEY[multiplier]}`)}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn("size-6 rounded-[3px]", CELL[1].className)}
          />
          {t("legend.x1")}
        </li>
      </ul>

      <div
        role="region"
        aria-labelledby="chart-heading"
        tabIndex={0}
        // `relative`: the screen-reader-only texts inside are absolutely
        // positioned; without it they escape this scroll box and widen the
        // whole page.
        className="relative mt-5 overflow-x-auto rounded-lg border bg-card p-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <table className="border-separate border-spacing-0.5 text-sm">
          <caption className="sr-only">{t("chartCaption")}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-card pr-2 text-left align-bottom text-xs font-semibold text-muted-foreground"
              >
                <span className="block">{t("axisAttack")} ↓</span>
                <span className="block">{t("axisDefense")} →</span>
              </th>
              {POKEMON_TYPES.map((defender) => (
                <th key={defender} scope="col" className="p-0 align-bottom">
                  <span
                    className={cn(
                      "mx-auto flex h-[5.5rem] w-8 rotate-180 items-center justify-start rounded-[3px] py-1.5 text-xs font-semibold [writing-mode:vertical-rl]",
                      typeBackgroundClass(defender),
                      typeTextClass(defender),
                    )}
                  >
                    {tTypes(defender)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POKEMON_TYPES.map((attack) => (
              <tr key={attack}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-card p-0 pr-1 text-left"
                >
                  <span
                    className={cn(
                      "flex h-8 w-[5.75rem] items-center rounded-[3px] px-2 text-xs font-semibold",
                      typeBackgroundClass(attack),
                      typeTextClass(attack),
                    )}
                  >
                    {tTypes(attack)}
                  </span>
                </th>
                {POKEMON_TYPES.map((defender) => {
                  const multiplier = attackMultiplier(attack, defender);
                  return (
                    <td
                      key={defender}
                      className={cn(
                        "size-8 rounded-[3px] p-0 text-center font-black tabular-nums",
                        CELL[multiplier].className,
                      )}
                    >
                      {CELL[multiplier].symbol || (
                        <span className="sr-only">1</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
