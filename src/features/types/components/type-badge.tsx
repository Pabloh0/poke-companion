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

export function typeBackgroundClass(type: PokemonType): string {
  return TYPE_BG[type];
}

export function typeTextClass(type: PokemonType): string {
  return typeTextTone(type) === "light" ? "text-white" : "text-ink";
}

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
        "inline-flex items-center justify-center rounded-[4px] font-semibold",
        typeBackgroundClass(type),
        typeTextClass(type),
        size === "sm" ? "h-5 px-1.5 text-[0.7rem]" : "h-7 px-2.5 text-sm",
        className,
      )}
    >
      {t(type)}
    </span>
  );
}
