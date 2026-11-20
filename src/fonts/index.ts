import localFont from "next/font/local";

/**
 * Fonts are self-hosted (files in this folder, SIL Open Font License 1.1):
 * builds don't depend on Google Fonts and visitors make no third-party request.
 * Only the "latin" subset is included: it covers Spanish and English.
 */

// Headings: wide, rounded geometric face with a game-UI feel.
export const headingFont = localFont({
  src: "./Unbounded-Variable.woff2",
  weight: "200 900",
  style: "normal",
  variable: "--font-heading",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Body: designed for maximum legibility, ideal for dense data (stats, tables).
export const bodyFont = localFont({
  src: [
    {
      path: "./AtkinsonHyperlegibleNext-Variable.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "./AtkinsonHyperlegibleNext-Italic-Variable.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: "Arial",
});
