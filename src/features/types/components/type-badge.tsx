import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { typeTextTone, type PokemonType } from "../data/pokemon-types";

/**
 * Tailwind needs to see full class names in the source code to generate them,
 * so we map each type to its literal class instead of building `bg-type-${t}`.
 */
const TYPE_BG: Record<PokemonType, string> = {
  normal: "bg-type-normal",
  fire: "bg-type-fire",
  water: "bg-type-water",
  electric: "bg-type-electric",
  grass: "bg-type-grass",
  ice: "bg-type-ice",
  fighting: "bg-type-fighting",
  poison: "bg-type-poison",
  ground: "bg-type-ground",
  flying: "bg-type-flying",
  psychic: "bg-type-psychic",
  bug: "bg-type-bug",
  rock: "bg-type-rock",
  ghost: "bg-type-ghost",
  dragon: "bg-type-dragon",
  dark: "bg-type-dark",
  steel: "bg-type-steel",
  fairy: "bg-type-fairy",
};

type TypeBadgeProps = {
  type: PokemonType;
  size?: "sm" | "md";
  className?: string;
};

export function TypeBadge({ type, size = "md", className }: TypeBadgeProps) {
  const t = useTranslations("Types");

  return (
    <span
      data-type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tracking-wide",
        TYPE_BG[type],
        typeTextTone(type) === "light" ? "text-white" : "text-ink",
        size === "sm" ? "h-6 px-2.5 text-xs" : "h-8 px-3.5 text-sm",
        className,
      )}
    >
      {t(type)}
    </span>
  );
}
