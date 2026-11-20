import Image from "next/image";
import { TypeBadge } from "@/features/types/components/type-badge";
import { formatDexNumber, type PokedexEntry } from "../lib/filters";
import { spriteUrl } from "../lib/sprites";

export function PokemonCard({ entry }: { entry: PokedexEntry }) {
  return (
    <article className="flex h-full flex-col items-center rounded-lg border bg-card px-3 pt-3 pb-4 text-center">
      <span className="self-start font-display text-xs font-bold text-highlight tabular-nums">
        #{formatDexNumber(entry.dexNumber)}
      </span>
      {/* Decorative: the name is right below. Sprites are tiny pixel-art PNGs
          from PokeAPI, so they skip Next's image optimizer (unoptimized). */}
      <Image
        src={spriteUrl(entry.dexNumber)}
        alt=""
        width={96}
        height={96}
        unoptimized
        className="size-24 [image-rendering:pixelated]"
      />
      <h3 className="mt-1 font-sans text-base leading-tight font-bold">
        {entry.name}
      </h3>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {entry.types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </article>
  );
}

export function PokemonGrid({ entries }: { entries: readonly PokedexEntry[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {entries.map((entry) => (
        <li key={entry.dexNumber}>
          <PokemonCard entry={entry} />
        </li>
      ))}
    </ul>
  );
}
