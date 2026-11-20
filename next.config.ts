import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Cache Components: data is dynamic by default and we opt in to caching
  // with the `use cache` directive. It also enables Partial Prerendering.
  // See docs/03-Architecture.md.
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Real 404 (status + full HTML) for URLs that match no route.
    // Needed because our root layout lives inside the dynamic [locale]
    // segment. See src/app/global-not-found.tsx and docs/03-Architecture.md.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// The next-intl plugin connects `src/i18n/request.ts` (per-request i18n config).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
