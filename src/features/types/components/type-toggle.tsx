import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PokemonType } from "../data/pokemon-types";
import { typeBackgroundClass, typeTextClass } from "./type-badge";

/**
 * A type as a binder "divider sticker" that can be switched on and off.
 * Unselected: a band of the type colour on card stock. Selected: filled with
 * the colour. A real toggle button (`aria-pressed`) for screen readers.
 */
export function TypeToggle({
  type,
  selected,
  disabled = false,
  className,
  onToggle,
}: {
  type: PokemonType;
  selected: boolean;
  disabled?: boolean;
  className?: string;
  onToggle?: (type: PokemonType) => void;
}) {
  const t = useTranslations("Types");
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle?.(type)}
      className={cn(
        "relative inline-flex h-9 min-w-0 items-center overflow-hidden rounded-[5px] border pr-2 pl-3.5 text-sm font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? cn(
              typeBackgroundClass(type),
              typeTextClass(type),
              "border-transparent",
            )
          : "border-border bg-card hover:bg-accent",
        className,
      )}
    >
      {!selected && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-1.5",
            typeBackgroundClass(type),
          )}
        />
      )}
      <span className="condensed">{t(type)}</span>
    </button>
  );
}
