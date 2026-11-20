/**
 * Pokémon images are linked from PokeAPI's public sprites repository, the same
 * URLs PokeAPI itself returns. They are not copied to our storage (they belong
 * to their rights holders). See docs/03-Architecture.md, decision D-07.
 */
const SPRITES_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/** Small 96×96 pixel-art sprite (0.5–7 KB): ideal for lists. */
export function spriteUrl(pokemonId: number): string {
  return `${SPRITES_BASE}/${pokemonId}.png`;
}

/** Official artwork, 475×475 PNG (≈100–200 KB): for the detail page. */
export function artworkUrl(pokemonId: number): string {
  return `${SPRITES_BASE}/other/official-artwork/${pokemonId}.png`;
}
