"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type EntryBarLink = {
  href: string;
  /** "#024 Arbok", shown from `sm`. */
  label: string;
  /** "Anterior: Arbok (tecla ←)", for screen readers and the tooltip. */
  description: string;
};

export type EntryBarSection = { id: string; label: string };

/**
 * Where a section counts as "reached": the bottom of the header (65 px) and
 * of this bar (44 px), plus some air.
 */
const ACTIVE_LINE = 140;

/**
 * The bar under the site header on a Pokémon's page, like the index tabs on
 * the edge of a binder: previous / next Pokémon at the ends and the page's
 * sections in between, with the one you are reading highlighted. It stays
 * in place while scrolling, so it does not matter how long the page grows.
 *
 * ← and → also turn the page (except while typing or choosing in a control,
 * where the arrows already mean something).
 *
 * Sections need `SECTION_SCROLL_MARGIN` (lib/entry-sections.ts).
 * Must sit inside an element with `data-entry-page`: sections are looked up
 * there, not in the whole document, because React may keep the previous
 * Pokémon's page hidden in the document, with the same ids.
 */
export function EntryBar({
  label,
  previous,
  next,
  sections,
}: {
  /** Accessible name of the section list ("En esta ficha"). */
  label: string;
  previous: EntryBarLink | null;
  next: EntryBarLink | null;
  sections: readonly EntryBarSection[];
}) {
  const router = useRouter();
  const barRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(sections[0]?.id ?? null);

  const findSection = (id: string) =>
    barRef.current
      ?.closest("[data-entry-page]")
      ?.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ?? null;

  // Highlight the last section whose top has passed under the bar (or the
  // last one at the very bottom, where a short section may never get there).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = barRef.current?.closest("[data-entry-page]");
      if (!root) return;
      let current = sections[0]?.id ?? null;
      for (const { id } of sections) {
        const element = root.querySelector(`#${CSS.escape(id)}`);
        if (element && element.getBoundingClientRect().top <= ACTIVE_LINE) {
          current = id;
        }
      }
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = sections.at(-1)?.id ?? current;
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  // On phones the list scrolls sideways: keep the highlighted tab in view
  // (scrolling the list only, never the page).
  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>("[aria-current]");
    if (!list || !tab) return;
    const left = tab.offsetLeft - list.offsetLeft;
    if (
      left < list.scrollLeft ||
      left + tab.offsetWidth > list.scrollLeft + list.clientWidth
    ) {
      list.scrollTo({ left: left - 16 });
    }
  }, [active]);

  // ← / → turn the page.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            "input, textarea, select, [role=slider], [role=radiogroup]",
          ))
      ) {
        return;
      }
      const link =
        event.key === "ArrowLeft"
          ? previous
          : event.key === "ArrowRight"
            ? next
            : null;
      if (!link) return;
      event.preventDefault();
      router.push(link.href);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previous, next, router]);

  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = findSection(id);
    if (!section) return; // let the browser try the plain #anchor
    event.preventDefault();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(window.history.state, "", `#${id}`);
    setActive(id);
  };

  return (
    <div
      ref={barRef}
      className="sticky top-[calc(4rem+1px)] z-30 border-b border-foreground/15 bg-background/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-11 max-w-6xl items-center gap-1 px-2 sm:gap-3 sm:px-6">
        <PageLink link={previous} direction="previous" />
        <nav aria-label={label} className="min-w-0 flex-1">
          {/* On phones the tabs that do not fit fade out at the edges, a
              hint that the list slides sideways. */}
          <ul
            ref={listRef}
            className="flex [scrollbar-width:none] gap-1 overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_0.75rem,#000_calc(100%-0.75rem),transparent)] px-3 sm:justify-center sm:[mask-image:none] sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {sections.map((section) => (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  onClick={(event) => goTo(event, section.id)}
                  aria-current={section.id === active ? "true" : undefined}
                  className={cn(
                    "flex h-8 items-center rounded-[5px] px-2.5 text-sm font-semibold whitespace-nowrap condensed transition-colors",
                    section.id === active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <PageLink link={next} direction="next" />
      </div>
    </div>
  );
}

function PageLink({
  link,
  direction,
}: {
  link: EntryBarLink | null;
  direction: "previous" | "next";
}) {
  const Chevron = direction === "previous" ? ChevronLeftIcon : ChevronRightIcon;
  // Keep the sections centred even when one end has no link (#1, #1025).
  if (!link) return <span className="w-9 shrink-0 sm:w-40" />;
  return (
    <Link
      href={link.href}
      rel={direction === "previous" ? "prev" : "next"}
      title={link.description}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center gap-1 rounded-[5px] text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:w-40 sm:px-2",
        direction === "previous"
          ? "sm:justify-start"
          : "flex-row-reverse sm:justify-start",
      )}
    >
      <Chevron aria-hidden className="size-5 shrink-0" />
      <span aria-hidden className="hidden truncate condensed sm:inline">
        {link.label}
      </span>
      <span className="sr-only">{link.description}</span>
    </Link>
  );
}
