export const siteConfig = {
  name: "PokéCompanion",
  /** Production URL. Set NEXT_PUBLIC_SITE_URL in Vercel once the domain exists. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
