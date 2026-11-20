import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatDexNumber, type PokedexEntry } from "../lib/filters";
import { imageIdOf } from "../lib/regional";
import { spriteUrl } from "../lib/sprites";

/** Previous / next species, like turning the pages of a binder. */
export function PokemonPager({
  previous,
  next,
}: {
  previous: PokedexEntry | null;
  next: PokedexEntry | null;
}) {
  const t = useTranslations("Pokemon");

  return (
    <nav aria-label={t("pager")} className="grid gap-3 sm:grid-cols-2">
      {previous ? (
        <PagerLink
          entry={previous}
          direction="previous"
          label={t("previous")}
        />
      ) : (
        <span />
      )}
      {next && <PagerLink entry={next} direction="next" label={t("next")} />}
    </nav>
  );
}

function PagerLink({
  entry,
  direction,
  label,
}: {
  entry: PokedexEntry;
  direction: "previous" | "next";
  label: string;
}) {
  const Arrow = direction === "previous" ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <Link
      href={`/pokedex/${entry.slug}`}
      rel={direction === "previous" ? "prev" : "next"}
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-foreground/40",
        direction === "next" && "flex-row-reverse text-right sm:col-start-2",
      )}
    >
      <Arrow
        aria-hidden
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:text-foreground motion-safe:group-hover:translate-x-0.5"
      />
      <Image
        src={spriteUrl(imageIdOf(entry))}
        alt=""
        width={96}
        height={96}
        unoptimized
        className="size-14 shrink-0 [image-rendering:pixelated]"
      />
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-muted-foreground">
          {label} · #{formatDexNumber(entry.dexNumber)}
        </span>
        <span className="block truncate font-display text-xl font-bold condensed">
          {entry.name}
        </span>
      </span>
    </Link>
  );
}
