import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for supported languages.
 *
 * - Spanish is the primary language and lives at the root: `/pokedex`.
 * - English lives under a prefix: `/en/pokedex`.
 * - First-time visitors are redirected based on their browser language
 *   (`Accept-Language`); after that, their choice is remembered in a cookie.
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
