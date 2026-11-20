import { cn } from "@/lib/utils";

export type SegmentOption<T> = {
  value: T;
  label: string;
  /** Extra words for screen readers ("Kanto" after "I"). */
  srLabel?: string;
};

/**
 * A grid of equal-width options where exactly one is selected. Each option
 * is its own bordered tile, like the type buttons, all on the same plane:
 * the selected one is simply filled. Native radio inputs underneath, so
 * arrow keys and screen readers work out of the box.
 *
 * `className` sets the grid columns (e.g. "grid-cols-5 sm:grid-cols-10").
 */
export function SegmentedControl<T extends string | number | null>({
  name,
  options,
  value,
  onChange,
  className,
}: {
  name: string;
  options: readonly SegmentOption<T>[];
  value: T;
  /** Without it the options render disabled (placeholder while loading). */
  onChange?: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={String(option.value)}
            className={cn(
              "relative flex h-9 min-w-0 cursor-pointer items-center justify-center rounded-[5px] border px-1 text-sm font-semibold whitespace-nowrap transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
              checked
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={checked}
              disabled={!onChange}
              onChange={() => onChange?.(option.value)}
            />
            <span className="condensed">{option.label}</span>
            {option.srLabel && (
              <span className="sr-only">{`, ${option.srLabel}`}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}
