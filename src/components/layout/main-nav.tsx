"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [{ href: "/pokedex", key: "pokedex" }] as const;

function navLinkClass(active: boolean) {
  return cn(
    "inline-flex h-9 items-center rounded-md px-2.5 text-[0.95rem] font-bold underline-offset-[10px] transition-colors",
    active
      ? "text-foreground underline decoration-[3px]"
      : "text-muted-foreground hover:text-foreground",
  );
}

export function MainNav() {
  const t = useTranslations("Header");
  const pathname = usePathname();

  return (
    <nav aria-label={t("mainNav")}>
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                {t(`nav.${item.key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Same links without the "current page" state, while the URL resolves. */
export function MainNavFallback() {
  const t = useTranslations("Header");
  return (
    <nav aria-label={t("mainNav")}>
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={navLinkClass(false)}>
              {t(`nav.${item.key}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
