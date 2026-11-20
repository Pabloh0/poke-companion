import { describe, expect, it } from "vitest";
import type { PokedexEntry } from "./filters";
import {
  neighbours,
  orderStats,
  pickLocalized,
  statBarPercent,
} from "./detail";

describe("pickLocalized", () => {
  it("prefers the page's language", () => {
    expect(
      pickLocalized({ es: "Pokémon Ratón", en: "Mouse Pokémon" }, "es"),
    ).toEqual({
      text: "Pokémon Ratón",
      locale: "es",
    });
  });

  it("falls back to English, flagged as English", () => {
    expect(
      pickLocalized({ es: null, en: "Poison Chain Pokémon" }, "es"),
    ).toEqual({
      text: "Poison Chain Pokémon",
      locale: "en",
    });
    expect(pickLocalized({ es: "   ", en: "Text" }, "es")?.locale).toBe("en");
  });

  it("returns null when there is no text at all", () => {
    expect(pickLocalized({ es: null, en: null }, "es")).toBeNull();
  });
});

describe("orderStats", () => {
  it("sorts the six stats in the games' order and adds them up", () => {
    const { stats, total } = orderStats([
      { stat: "speed", base_value: 90 },
      { stat: "hp", base_value: 35 },
      { stat: "special-defense", base_value: 50 },
      { stat: "attack", base_value: 55 },
      { stat: "special-attack", base_value: 50 },
      { stat: "defense", base_value: 40 },
    ]);
    expect(stats.map((s) => s.stat)).toEqual([
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ]);
    expect(total).toBe(320); // Pikachu
  });

  it("fails loudly if a stat is missing", () => {
    expect(() => orderStats([{ stat: "hp", base_value: 35 }])).toThrow(
      /attack/,
    );
  });
});

describe("statBarPercent", () => {
  it("scales against 255 and clamps", () => {
    expect(statBarPercent(255)).toBe(100);
    expect(statBarPercent(0)).toBe(0);
    expect(Math.round(statBarPercent(90))).toBe(35);
    expect(statBarPercent(999)).toBe(100);
  });
});

describe("neighbours", () => {
  const entry = (dexNumber: number): PokedexEntry => ({
    dexNumber,
    slug: `p${dexNumber}`,
    name: `P${dexNumber}`,
    genus: null,
    generation: 1,
    types: ["normal"],
    rarity: "common",
    baseStatTotal: 300,
  });
  const entries = [entry(1), entry(2), entry(3)];

  it("finds the previous and next species", () => {
    const { previous, next } = neighbours(entries, 2);
    expect(previous?.dexNumber).toBe(1);
    expect(next?.dexNumber).toBe(3);
  });

  it("has no previous for the first and no next for the last", () => {
    expect(neighbours(entries, 1).previous).toBeNull();
    expect(neighbours(entries, 3).next).toBeNull();
  });
});
