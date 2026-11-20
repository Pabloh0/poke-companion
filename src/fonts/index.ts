import localFont from "next/font/local";

/**
 * Fonts are self-hosted (files in this folder, SIL Open Font License 1.1):
 * builds don't depend on Google Fonts and visitors make no third-party request.
 * Only the "latin" subset is included: it covers Spanish and English.
 */

/**
 * Archivo: UI, headings and the cards. Variable in weight AND width
 * (62%–125%), so one family gives both the condensed card names/numbers and
 * normal-width interface text.
 */
export const sansFont = localFont({
  src: "./Archivo-Variable.woff2",
  weight: "100 900",
  style: "normal",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: "Arial",
});

/** Newsreader: editorial serif for prose and, in italic, Pokédex entries. */
export const serifFont = localFont({
  src: [
    { path: "./Newsreader-Variable.woff2", weight: "200 800", style: "normal" },
    {
      path: "./Newsreader-Italic-Variable.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
