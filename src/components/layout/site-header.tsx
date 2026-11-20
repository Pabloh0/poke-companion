import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { BrandMark } from "./brand-mark";
import { LocaleSwitcher, LocaleSwitcherFallback } from "./locale-switcher";
import { MainNav, MainNavFallback } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const t = useTranslations("Header");

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label={t("homeLink")}
          className="flex items-center gap-2.5 rounded-md"
        >
          <BrandMark />
          {/* On narrow screens only the mark shows (the link keeps its
              accessible name), so navigation and controls always fit. */}
          <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">
            {siteConfig.name}
          </span>
        </Link>
        <div className="mr-auto sm:ml-4">
          <Suspense fallback={<MainNavFallback />}>
            <MainNav />
          </Suspense>
        </div>
        <div className="flex items-center gap-2">
          {/* The switcher reads the current URL, which on dynamic routes is only
              known at request time. Suspense keeps the rest of the header in
              the prerendered shell. */}
          <Suspense fallback={<LocaleSwitcherFallback />}>
            <LocaleSwitcher />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
