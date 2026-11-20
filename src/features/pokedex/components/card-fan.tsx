import type { CSSProperties } from "react";
import type { PokedexEntry } from "../lib/filters";
import { HoloSurface } from "./holo-surface";
import { PokemonCard } from "./pokemon-card";

/**
 * A hand of cards opened like a fan. The middle card sits in front.
 * On load the cards are "dealt" into place (the page's one orchestrated
 * animation, `animate-deal` in globals.css; skipped with reduced motion).
 */
export function CardFan({
  entries,
  label,
}: {
  entries: readonly PokedexEntry[];
  label: string;
}) {
  const middle = (entries.length - 1) / 2;

  return (
    <HoloSurface className="relative mx-auto aspect-[5/4] w-full max-w-lg">
      <ul aria-label={label}>
        {entries.map((entry, index) => {
          const offset = index - middle;
          const style = {
            "--fan": `translateX(calc(-50% + ${offset * 33}%)) translateY(${Math.abs(offset) * 5}%) rotate(${offset * 7}deg)`,
            animationDelay: `${120 + index * 90}ms`,
            zIndex: 10 - Math.abs(Math.round(offset * 2)),
          } as CSSProperties;
          return (
            <li
              key={entry.dexNumber}
              style={style}
              className="absolute bottom-[4%] left-1/2 w-[34%] origin-bottom animate-deal"
            >
              <PokemonCard entry={entry} priority />
            </li>
          );
        })}
      </ul>
    </HoloSurface>
  );
}
