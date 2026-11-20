import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import {
  compareMoves,
  groupLearnset,
  isKnownGame,
  KNOWN_GAMES,
  parseMachine,
  type LearnedMove,
} from "./learnset";

function move(name: string, fields: Partial<LearnedMove> = {}): LearnedMove {
  return {
    slug: name.toLowerCase(),
    name: { text: name, locale: "es" },
    description: null,
    type: "electric",
    damageClass: "special",
    power: 40,
    accuracy: 100,
    pp: 30,
    method: "level-up",
    level: 1,
    machine: null,
    ...fields,
  };
}

const names = (moves: LearnedMove[]) => moves.map((m) => m.name.text);

describe("isKnownGame", () => {
  it("knows the games the import can choose", () => {
    expect(isKnownGame("scarlet-violet")).toBe(true);
    expect(isKnownGame("omega-ruby-alpha-sapphire")).toBe(true);
    expect(isKnownGame("lets-go-pikachu-lets-go-eevee")).toBe(false);
  });

  it("has a name for every known game in both languages", () => {
    for (const game of KNOWN_GAMES) {
      expect(es.Moves.games[game]).toBeTruthy();
      expect(en.Moves.games[game]).toBeTruthy();
    }
  });
});

describe("parseMachine", () => {
  it("reads the kind and number", () => {
    expect(parseMachine("tm045")).toEqual({ kind: "tm", number: 45 });
    expect(parseMachine("tr12")).toEqual({ kind: "tr", number: 12 });
    expect(parseMachine("hm03")).toEqual({ kind: "hm", number: 3 });
  });

  it("returns null for anything else", () => {
    expect(parseMachine(null)).toBeNull();
    expect(parseMachine("")).toBeNull();
    expect(parseMachine("tm")).toBeNull();
    expect(parseMachine("potion")).toBeNull();
  });
});

describe("compareMoves", () => {
  it("sorts level-up moves by level, evolution moves first", () => {
    const sorted = [
      move("Trueno", { level: 44 }),
      move("Impactrueno", { level: 1 }),
      move("Puño Trueno", { level: 0 }),
      move("Onda Trueno", { level: 4 }),
    ].sort((a, b) => compareMoves(a, b, "es"));
    expect(names(sorted)).toEqual([
      "Puño Trueno",
      "Impactrueno",
      "Onda Trueno",
      "Trueno",
    ]);
  });

  it("breaks ties alphabetically, with Spanish rules", () => {
    const sorted = [
      move("Placaje", { level: 1 }),
      move("Ácido", { level: 1 }),
      move("Gruñido", { level: 1 }),
    ].sort((a, b) => compareMoves(a, b, "es"));
    expect(names(sorted)).toEqual(["Ácido", "Gruñido", "Placaje"]);
  });

  it("sorts machines by kind then number, not as text", () => {
    const tm = (name: string, label: string) =>
      move(name, { method: "machine", level: 0, machine: parseMachine(label) });
    const sorted = [
      tm("Rayo", "tm126"),
      tm("Protección", "tm7"),
      tm("Cara Susto", "tr1"),
      tm("Destello", "hm5"),
      tm("Agilidad", "tm20"),
    ].sort((a, b) => compareMoves(a, b, "es"));
    expect(names(sorted)).toEqual([
      "Protección",
      "Agilidad",
      "Rayo",
      "Cara Susto",
      "Destello",
    ]);
  });
});

describe("groupLearnset", () => {
  it("keeps only methods with moves, in the page's order", () => {
    const groups = groupLearnset(
      [
        move("Volt Tackle", { method: "egg", level: 0 }),
        move("Trueno", { level: 44 }),
        move("Impactrueno", { level: 1 }),
      ],
      "es",
    );
    expect(groups.map((g) => g.method)).toEqual(["level-up", "egg"]);
    expect(names(groups[0]?.moves ?? [])).toEqual(["Impactrueno", "Trueno"]);
  });

  it("returns no groups for an empty learnset", () => {
    expect(groupLearnset([], "es")).toEqual([]);
  });
});
