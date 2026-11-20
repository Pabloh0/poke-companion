import { cn } from "@/lib/utils";

/**
 * Original PokéCompanion mark: two stacked collectible cards, the front one
 * with a foil stripe. Deliberately NOT a Poké Ball (trademarked design).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <rect
        x="4"
        y="6"
        width="15"
        height="21"
        rx="2.5"
        transform="rotate(-14 11.5 16.5)"
        className="fill-card stroke-foreground"
        strokeWidth="1.5"
      />
      <rect
        x="12"
        y="4"
        width="15"
        height="21"
        rx="2.5"
        transform="rotate(6 19.5 14.5)"
        className="fill-primary"
      />
      <rect
        x="14.5"
        y="7"
        width="10"
        height="9"
        rx="1"
        transform="rotate(6 19.5 14.5)"
        className="fill-primary-foreground"
        opacity="0.9"
      />
      <path
        d="M13 20 L27 22"
        transform="rotate(6 19.5 14.5)"
        className="stroke-primary-foreground"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
