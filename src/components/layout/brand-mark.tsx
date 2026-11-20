import { cn } from "@/lib/utils";

/**
 * Original PokéCompanion mark: a field device with its signal light.
 * Deliberately NOT a Poké Ball (trademarked design).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="9"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="5.5" className="fill-primary" />
      <circle cx="12" cy="12" r="2" className="fill-primary-foreground" />
      <rect
        x="9"
        y="21"
        width="14"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/60"
      />
    </svg>
  );
}
