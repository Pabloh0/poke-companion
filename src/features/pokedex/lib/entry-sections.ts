/**
 * `scroll-margin-top` for every section the entry bar links to, so a jump
 * leaves the section's title below the site header (65 px) and the bar
 * (44 px) instead of under them.
 *
 * Lives here, not in entry-bar.tsx: a Server Component that imports a value
 * from a "use client" file gets a client reference, not the string.
 */
export const SECTION_SCROLL_MARGIN = "scroll-mt-28";
