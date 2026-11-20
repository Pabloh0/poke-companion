/**
 * Regional forms: the same species with a different look and typing in
 * another region (Alolan Vulpix is Ice, the original is Fire).
 *
 * Generated from PokeAPI's `pokemon_forms.csv` at the same pinned commit as
 * the database import. Included: forms whose identifier is a region
 * (alola, galar, hisui, paldea), plus Galarian Darmanitan and the three
 * Paldean Tauros breeds. Left out: battle-only forms (Zen Mode Darmanitan),
 * Totem Pokémon and Pikachu's caps, which are not regional forms.
 *
 * The list lives in code because the database already has every form's
 * types, stats and abilities (rows of `pokemon` with is_default = false);
 * what it lacks is which ones are regional. See docs/03-Architecture.md, D-24.
 */

export const REGIONS = ["alola", "galar", "hisui", "paldea"] as const;
export type Region = (typeof REGIONS)[number];

/** Paldean Tauros comes in three breeds. */
export type FormVariant = "combat" | "blaze" | "aqua";

export type RegionalFormRef = {
  /** Row id in `pokemon` (also the sprite file name). */
  pokemonId: number;
  slug: string;
  /** National Pokédex number of its species. */
  dexNumber: number;
  region: Region;
  variant?: FormVariant;
};

export function isRegion(value: unknown): value is Region {
  return REGIONS.includes(value as Region);
}

export const REGIONAL_FORMS: readonly RegionalFormRef[] = [
  { pokemonId: 10091, slug: "rattata-alola", dexNumber: 19, region: "alola" },
  { pokemonId: 10092, slug: "raticate-alola", dexNumber: 20, region: "alola" },
  { pokemonId: 10100, slug: "raichu-alola", dexNumber: 26, region: "alola" },
  { pokemonId: 10101, slug: "sandshrew-alola", dexNumber: 27, region: "alola" },
  { pokemonId: 10102, slug: "sandslash-alola", dexNumber: 28, region: "alola" },
  { pokemonId: 10103, slug: "vulpix-alola", dexNumber: 37, region: "alola" },
  { pokemonId: 10104, slug: "ninetales-alola", dexNumber: 38, region: "alola" },
  { pokemonId: 10105, slug: "diglett-alola", dexNumber: 50, region: "alola" },
  { pokemonId: 10106, slug: "dugtrio-alola", dexNumber: 51, region: "alola" },
  { pokemonId: 10107, slug: "meowth-alola", dexNumber: 52, region: "alola" },
  { pokemonId: 10108, slug: "persian-alola", dexNumber: 53, region: "alola" },
  { pokemonId: 10109, slug: "geodude-alola", dexNumber: 74, region: "alola" },
  { pokemonId: 10110, slug: "graveler-alola", dexNumber: 75, region: "alola" },
  { pokemonId: 10111, slug: "golem-alola", dexNumber: 76, region: "alola" },
  { pokemonId: 10112, slug: "grimer-alola", dexNumber: 88, region: "alola" },
  { pokemonId: 10113, slug: "muk-alola", dexNumber: 89, region: "alola" },
  {
    pokemonId: 10114,
    slug: "exeggutor-alola",
    dexNumber: 103,
    region: "alola",
  },
  { pokemonId: 10115, slug: "marowak-alola", dexNumber: 105, region: "alola" },
  { pokemonId: 10161, slug: "meowth-galar", dexNumber: 52, region: "galar" },
  { pokemonId: 10162, slug: "ponyta-galar", dexNumber: 77, region: "galar" },
  { pokemonId: 10163, slug: "rapidash-galar", dexNumber: 78, region: "galar" },
  { pokemonId: 10164, slug: "slowpoke-galar", dexNumber: 79, region: "galar" },
  { pokemonId: 10165, slug: "slowbro-galar", dexNumber: 80, region: "galar" },
  { pokemonId: 10166, slug: "farfetchd-galar", dexNumber: 83, region: "galar" },
  { pokemonId: 10167, slug: "weezing-galar", dexNumber: 110, region: "galar" },
  { pokemonId: 10168, slug: "mr-mime-galar", dexNumber: 122, region: "galar" },
  { pokemonId: 10169, slug: "articuno-galar", dexNumber: 144, region: "galar" },
  { pokemonId: 10170, slug: "zapdos-galar", dexNumber: 145, region: "galar" },
  { pokemonId: 10171, slug: "moltres-galar", dexNumber: 146, region: "galar" },
  { pokemonId: 10172, slug: "slowking-galar", dexNumber: 199, region: "galar" },
  { pokemonId: 10173, slug: "corsola-galar", dexNumber: 222, region: "galar" },
  {
    pokemonId: 10174,
    slug: "zigzagoon-galar",
    dexNumber: 263,
    region: "galar",
  },
  { pokemonId: 10175, slug: "linoone-galar", dexNumber: 264, region: "galar" },
  { pokemonId: 10176, slug: "darumaka-galar", dexNumber: 554, region: "galar" },
  {
    pokemonId: 10177,
    slug: "darmanitan-galar-standard",
    dexNumber: 555,
    region: "galar",
  },
  { pokemonId: 10179, slug: "yamask-galar", dexNumber: 562, region: "galar" },
  { pokemonId: 10180, slug: "stunfisk-galar", dexNumber: 618, region: "galar" },
  { pokemonId: 10229, slug: "growlithe-hisui", dexNumber: 58, region: "hisui" },
  { pokemonId: 10230, slug: "arcanine-hisui", dexNumber: 59, region: "hisui" },
  { pokemonId: 10231, slug: "voltorb-hisui", dexNumber: 100, region: "hisui" },
  {
    pokemonId: 10232,
    slug: "electrode-hisui",
    dexNumber: 101,
    region: "hisui",
  },
  {
    pokemonId: 10233,
    slug: "typhlosion-hisui",
    dexNumber: 157,
    region: "hisui",
  },
  { pokemonId: 10234, slug: "qwilfish-hisui", dexNumber: 211, region: "hisui" },
  { pokemonId: 10235, slug: "sneasel-hisui", dexNumber: 215, region: "hisui" },
  { pokemonId: 10236, slug: "samurott-hisui", dexNumber: 503, region: "hisui" },
  {
    pokemonId: 10237,
    slug: "lilligant-hisui",
    dexNumber: 549,
    region: "hisui",
  },
  { pokemonId: 10238, slug: "zorua-hisui", dexNumber: 570, region: "hisui" },
  { pokemonId: 10239, slug: "zoroark-hisui", dexNumber: 571, region: "hisui" },
  { pokemonId: 10240, slug: "braviary-hisui", dexNumber: 628, region: "hisui" },
  { pokemonId: 10241, slug: "sliggoo-hisui", dexNumber: 705, region: "hisui" },
  { pokemonId: 10242, slug: "goodra-hisui", dexNumber: 706, region: "hisui" },
  { pokemonId: 10243, slug: "avalugg-hisui", dexNumber: 713, region: "hisui" },
  {
    pokemonId: 10244,
    slug: "decidueye-hisui",
    dexNumber: 724,
    region: "hisui",
  },
  {
    pokemonId: 10250,
    slug: "tauros-paldea-combat-breed",
    dexNumber: 128,
    region: "paldea",
    variant: "combat",
  },
  {
    pokemonId: 10251,
    slug: "tauros-paldea-blaze-breed",
    dexNumber: 128,
    region: "paldea",
    variant: "blaze",
  },
  {
    pokemonId: 10252,
    slug: "tauros-paldea-aqua-breed",
    dexNumber: 128,
    region: "paldea",
    variant: "aqua",
  },
  { pokemonId: 10253, slug: "wooper-paldea", dexNumber: 194, region: "paldea" },
];

const BY_SLUG = new Map(REGIONAL_FORMS.map((form) => [form.slug, form]));

export function regionalFormBySlug(slug: string): RegionalFormRef | undefined {
  return BY_SLUG.get(slug);
}
