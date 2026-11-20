"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

const MAX_TILT_X = 10; // degrees, up/down
const MAX_TILT_Y = 14; // degrees, left/right

function resetCard(card: HTMLElement) {
  for (const prop of ["--mx", "--my", "--rx", "--ry"]) {
    card.style.removeProperty(prop);
  }
  delete card.dataset.active;
}

/**
 * Drives the holographic effect of every `[data-holo]` card inside it with a
 * single pair of listeners (event delegation), instead of one per card.
 *
 * It only writes CSS variables; globals.css (.holo-card) does the drawing.
 * Mouse only: on touch screens, tilting while scrolling feels broken.
 * With "reduce motion" enabled, CSS keeps the card flat.
 */
export function HoloSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const activeCard = useRef<HTMLElement | null>(null);
  const frame = useRef<number | null>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const card = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-holo]",
    );
    if (activeCard.current && activeCard.current !== card) {
      resetCard(activeCard.current);
    }
    activeCard.current = card;
    if (!card) return;

    const { clientX, clientY } = event;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    // At most one style update per frame, however fast the mouse moves.
    frame.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      card.style.setProperty(
        "--rx",
        `${((0.5 - y) * MAX_TILT_X).toFixed(2)}deg`,
      );
      card.style.setProperty(
        "--ry",
        `${((x - 0.5) * MAX_TILT_Y).toFixed(2)}deg`,
      );
      card.dataset.active = "";
    });
  }

  function handlePointerLeave() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (activeCard.current) resetCard(activeCard.current);
    activeCard.current = null;
  }

  return (
    <div
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}
