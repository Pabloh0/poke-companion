"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Two-option language switch that keeps the user on the same page. */
export function LocaleSwitcher() {
  const t = useTranslations("Header");
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("language")}>
      <ul className="flex items-center rounded-md border border-foreground/25 p-0.5 text-sm">
        {routing.locales.map((locale) => {
          const isCurrent = locale === currentLocale;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-label={t(`languages.${locale}`)}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "inline-flex h-7 min-w-9 items-center justify-center rounded-[4px] px-2 font-bold condensed transition-colors",
                  isCurrent
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {locale.toUpperCase()}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Same footprint as the switcher, shown while the current URL resolves. */
export function LocaleSwitcherFallback() {
  return <div aria-hidden className="h-[34px] w-[78px] rounded-md border" />;
}
