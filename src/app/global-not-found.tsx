import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { themeScript } from "@/components/layout/theme-script";
import { buttonVariants } from "@/components/ui/button";
import { sansFont, serifFont } from "@/fonts";
import "./globals.css";

/**
 * 404 for URLs that match no route at all (e.g. `/does-not-exist`).
 *
 * Next.js serves this page directly, skipping our layouts, so it has to bring
 * its own <html>, fonts, styles and theme script. It can't know the visitor's
 * language either (it runs outside the [locale] segment), so it is bilingual.
 *
 * `notFound()` called from inside a real page (e.g. an unknown Pokémon) uses
 * `src/app/[locale]/not-found.tsx` instead, which is fully localized.
 */
export const metadata: Metadata = {
  title: "404 | PokéCompanion",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="es"
      data-theme="light"
      suppressHydrationWarning
      className={`${sansFont.variable} ${serifFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <header className="border-b border-foreground/15">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-2.5 px-4 sm:px-6">
            <BrandMark />
            <span className="font-display text-[1.35rem] font-black tracking-tight condensed">
              PokéCompanion
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-24 sm:px-6">
          <p className="font-display text-8xl leading-none font-black condensed">
            404
          </p>
          <h1 className="mt-4 text-4xl font-black condensed">
            Aquí no hay nada
          </h1>
          <p className="mt-3 max-w-[60ch] font-serif text-lg text-muted-foreground">
            La página que buscas no existe o ha cambiado de dirección.
          </p>
          <p
            lang="en"
            className="mt-1 max-w-[60ch] font-serif text-lg text-muted-foreground"
          >
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {/* next/link (not the i18n Link): this page renders outside the
                [locale] segment, so the URLs are written explicitly. */}
            <Link href="/" className={buttonVariants()}>
              Volver al inicio
            </Link>
            <Link
              href="/en"
              lang="en"
              hrefLang="en"
              className={buttonVariants({ variant: "outline" })}
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
