import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

/**
 * Per-request i18n configuration, consumed by next-intl on the server.
 *
 * The locale comes from the `[locale]` root segment, read with
 * `next/root-params` (the mechanism recommended by Next.js 16 and next-intl).
 * An explicit locale (e.g. `getTranslations({ locale: "en" })`) takes priority.
 */
export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const candidate = explicitLocale ?? (await rootLocale());
  const locale = hasLocale(routing.locales, candidate)
    ? candidate
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
