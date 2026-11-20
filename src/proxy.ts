import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Proxy (called "middleware" up to Next.js 15) runs before every matched
 * request. For now it only resolves the language: it rewrites `/pokedex` to the
 * internal route `/es/pokedex`, and redirects to `/en/...` when appropriate.
 */
export const proxy = createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next.js internals and files with an
  // extension (images, favicon, robots.txt...).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
