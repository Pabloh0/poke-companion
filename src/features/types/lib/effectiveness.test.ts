import { describe, expect, it } from "vitest";
import { POKEMON_TYPES, type PokemonType } from "../data/pokemon-types";
import { TYPE_CHART } from "../data/type-chart";
import {
  attackMultiplier,
  damageMultiplier,
  DEFENSE_ORDER,
  defensiveProfile,
  formatMultiplier,
  offensiveProfile,
} from "./effectiveness";

/** Every possible Pokémon typing: 18 single types + 153 pairs. */
const ALL_TYPINGS: PokemonType[][] = POKEMON_TYPES.flatMap((first, i) => [
  [first],
  ...POKEMON_TYPES.slice(i + 1).map((second) => [first, second]),
]);

describe("TYPE_CHART", () => {
  it("has a row for each of the 18 types", () => {
    expect(Object.keys(TYPE_CHART)).toEqual([...POKEMON_TYPES]);
  });

  it("matches the Generation VI+ totals: 51 ×2, 61 ×½ and 8 immunities", () => {
    const values = Object.values(TYPE_CHART).flatMap((row) =>
      Object.values(row),
    );
    expect(values.filter((v) => v === 2)).toHaveLength(51);
    expect(values.filter((v) => v === 0.5)).toHaveLength(61);
    expect(values.filter((v) => v === 0)).toHaveLength(8);
  });

  it("has exactly the eight known immunities", () => {
    const immunities = POKEMON_TYPES.flatMap((attack) =>
      POKEMON_TYPES.filter((d) => attackMultiplier(attack, d) === 0).map(
        (defender) => `${attack}→${defender}`,
      ),
    );
    expect(immunities.sort()).toEqual(
      [
        "normal→ghost",
        "electric→ground",
        "fighting→ghost",
        "poison→steel",
        "ground→flying",
        "psychic→dark",
        "ghost→normal",
        "dragon→fairy",
      ].sort(),
    );
  });
});

describe("damageMultiplier", () => {
  it("multiplies both types (Rock vs Fire/Flying = ×4)", () => {
    expect(damageMultiplier("rock", ["fire", "flying"])).toBe(4);
  });

  it("an immunity wins over a weakness (Ground vs Fire/Flying = ×0)", () => {
    expect(damageMultiplier("ground", ["fire", "flying"])).toBe(0);
  });

  it("is ×1 when nothing is selected", () => {
    expect(damageMultiplier("fire", [])).toBe(1);
  });

  it("does not count the same type twice", () => {
    expect(damageMultiplier("water", ["fire", "fire"])).toBe(2);
  });

  it("only produces values the games can produce, for every typing", () => {
    for (const typing of ALL_TYPINGS) {
      for (const attack of POKEMON_TYPES) {
        expect([0, 0.25, 0.5, 1, 2, 4]).toContain(
          damageMultiplier(attack, typing),
        );
      }
    }
  });
});

describe("defensiveProfile", () => {
  it("gives Charizard's (Fire/Flying) well-known weaknesses", () => {
    expect(defensiveProfile(["fire", "flying"])).toEqual({
      4: ["rock"],
      2: ["water", "electric"],
      1: [
        "normal",
        "ice",
        "poison",
        "flying",
        "psychic",
        "ghost",
        "dragon",
        "dark",
      ],
      0.5: ["fire", "fighting", "steel", "fairy"],
      0.25: ["grass", "bug"],
      0: ["ground"],
    });
  });

  it("does not depend on the order of the two types", () => {
    expect(defensiveProfile(["flying", "fire"])).toEqual(
      defensiveProfile(["fire", "flying"]),
    );
  });

  it("places all 18 attacking types exactly once, for every typing", () => {
    for (const typing of ALL_TYPINGS) {
      const placed = DEFENSE_ORDER.flatMap(
        (multiplier) => defensiveProfile(typing)[multiplier],
      );
      expect(placed.sort()).toEqual([...POKEMON_TYPES].sort());
    }
  });
});

describe("offensiveProfile", () => {
  it("lists what Ground hits, resists and cannot touch", () => {
    const ground = offensiveProfile("ground");
    expect(ground[2]).toEqual(["fire", "electric", "poison", "rock", "steel"]);
    expect(ground[0.5]).toEqual(["grass", "bug"]);
    expect(ground[0]).toEqual(["flying"]);
    expect(ground[1]).toHaveLength(18 - 5 - 2 - 1);
  });
});

describe("formatMultiplier", () => {
  it("writes fractions as players do", () => {
    expect(DEFENSE_ORDER.map(formatMultiplier)).toEqual([
      "×4",
      "×2",
      "×1",
      "×½",
      "×¼",
      "×0",
    ]);
  });
});
