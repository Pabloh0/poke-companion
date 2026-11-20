import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { themeScript } from "@/components/layout/theme-script";
import { bodyFont, headingFont } from "@/fonts";
import "../globals.css";

// With Cache Components, every root param needs at least one value at build
// time. We prerender both languages.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title"), template: `%s | ${siteConfig.name}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations("Common");
  const messages = await getMessages();
  // Unique per language: with Cache Components, after switching language the
  // previous layout stays mounted but hidden (React <Activity>), and a
  // duplicated id would send the skip link to the hidden copy.
  const mainId = `main-${locale}`;

  return (
    <html
      lang={locale}
      data-theme="dark"
      // The inline theme script may change data-theme before React hydrates.
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        {/* Only the namespaces used by Client Components are sent to the
            browser; Server Components read the rest on the server. */}
        <NextIntlClientProvider
          messages={{
            Header: messages.Header,
            Pokedex: messages.Pokedex,
            Types: messages.Types,
          }}
        >
          <a
            href={`#${mainId}`}
            className="sr-only z-50 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id={mainId} className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
