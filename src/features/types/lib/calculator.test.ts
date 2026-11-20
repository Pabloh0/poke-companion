import { describe, expect, it } from "vitest";
import {
  EMPTY_CALCULATOR,
  parseCalculator,
  pickType,
  serializeCalculator,
  switchMode,
} from "./calculator";

const params = (query: string) => new URLSearchParams(query);

describe("parseCalculator", () => {
  it("defends by default", () => {
    expect(parseCalculator(params(""))).toEqual(EMPTY_CALCULATOR);
  });

  it("reads up to two defending types", () => {
    expect(parseCalculator(params("types=fire,flying,water"))).toEqual({
      mode: "defense",
      types: ["fire", "flying"],
    });
  });

  it("reads a single attacking type", () => {
    expect(parseCalculator(params("mode=attack&types=ground,fire"))).toEqual({
      mode: "attack",
      types: ["ground"],
    });
  });

  it("ignores unknown values and duplicates", () => {
    expect(
      parseCalculator(params("mode=hack&types=stellar,fire,fire,<b>")),
    ).toEqual({ mode: "defense", types: ["fire"] });
  });
});

describe("serializeCalculator", () => {
  it("round-trips through the URL", () => {
    for (const state of [
      EMPTY_CALCULATOR,
      { mode: "defense", types: ["fire", "flying"] },
      { mode: "attack", types: ["ground"] },
    ] as const) {
      const query = serializeCalculator({ ...state, types: [...state.types] });
      expect(parseCalculator(params(query))).toEqual(state);
    }
  });

  it("keeps commas readable", () => {
    expect(
      serializeCalculator({ mode: "defense", types: ["water", "flying"] }),
    ).toBe("types=water,flying");
  });
});

describe("pickType", () => {
  it("adds, then removes, a type", () => {
    const one = pickType(EMPTY_CALCULATOR, "fire");
    expect(one.types).toEqual(["fire"]);
    expect(pickType(one, "fire").types).toEqual([]);
  });

  it("replaces the second type when defending with two", () => {
    const two = {
      mode: "defense" as const,
      types: ["fire", "flying"] as const,
    };
    expect(pickType({ ...two, types: [...two.types] }, "water").types).toEqual([
      "fire",
      "water",
    ]);
  });

  it("swaps the attacking type", () => {
    expect(
      pickType({ mode: "attack", types: ["fire"] }, "water").types,
    ).toEqual(["water"]);
  });
});

describe("switchMode", () => {
  it("keeps the first type when switching to attack", () => {
    expect(
      switchMode({ mode: "defense", types: ["fire", "flying"] }, "attack"),
    ).toEqual({ mode: "attack", types: ["fire"] });
  });
});
