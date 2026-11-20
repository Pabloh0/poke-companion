import { cn } from "@/lib/utils";

export type SegmentOption<T> = {
  value: T;
  label: string;
  /** Extra words for screen readers ("Kanto" after "I"). */
  srLabel?: string;
  /** A small number after the label (how many moves, results…). */
  count?: number;
};

/**
 * A grid of equal-width options where exactly one is selected. Each option
 * is its own bordered tile, like the type buttons, all on the same plane:
 * the selected one is simply filled. Native radio inputs underneath, so
 * arrow keys and screen readers work out of the box.
 *
 * Two ways to use it:
 * - controlled: `value` + `onChange` (without `onChange` the options render
 *   disabled, as a placeholder while loading);
 * - uncontrolled: `defaultValue` only. The browser keeps the selection, with
 *   no JavaScript at all, and CSS can react to it: each input carries its
 *   value, so a parent `group` can use `group-has-[input[value=x]:checked]`.
 *
 * The selected style comes from CSS (`has-[:checked]`), so it works the same
 * in both modes. `className` sets the grid columns.
 */
export function SegmentedControl<T extends string | number | null>({
  name,
  options,
  value,
  defaultValue,
  onChange,
  className,
}: {
  name: string;
  options: readonly SegmentOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  className?: string;
}) {
  const uncontrolled = defaultValue !== undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      {options.map((option) => (
        <label
          key={String(option.value)}
          className="relative flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border border-border bg-card px-1 text-sm font-semibold whitespace-nowrap transition-colors not-has-[:checked]:hover:bg-accent has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
        >
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            className="sr-only"
            {...(uncontrolled
              ? { defaultChecked: option.value === defaultValue }
              : {
                  checked: option.value === value,
                  disabled: !onChange,
                  onChange: () => onChange?.(option.value),
                })}
          />
          <span className="condensed">{option.label}</span>
          {option.count !== undefined && (
            <span
              // With an srLabel the number is already in it ("20 moves").
              aria-hidden={option.srLabel ? true : undefined}
              className="text-xs tabular-nums opacity-70"
            >
              {option.count}
            </span>
          )}
          {option.srLabel && (
            <span className="sr-only">{`, ${option.srLabel}`}</span>
          )}
        </label>
      ))}
    </div>
  );
}
