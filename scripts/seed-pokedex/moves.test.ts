import { describe, expect, it } from "vitest";
import { buildMoveTables, pickVersionGroups, type MoveSources } from "./moves";

const ES = "7";
const EN = "9";

const move = (
  id: string,
  identifier: string,
  fields: Partial<Record<string, string>> = {},
) => ({
  id,
  identifier,
  type_id: "4",
  damage_class_id: "3",
  power: "40",
  accuracy: "100",
  pp: "30",
  priority: "0",
  ...fields,
});

const learn = (
  pokemon_id: string,
  version_group_id: string,
  move_id: string,
  pokemon_move_method_id: string,
  level = "0",
) => ({ pokemon_id, version_group_id, move_id, pokemon_move_method_id, level });

function makeRaw(): MoveSources {
  return {
    version_groups: [
      { id: "20", identifier: "sword-shield", generation_id: "8" },
      { id: "25", identifier: "scarlet-violet", generation_id: "9" },
      {
        id: "19",
        identifier: "lets-go-pikachu-lets-go-eevee",
        generation_id: "7",
      },
    ],
    moves: [
      move("84", "thunder-shock"),
      move("85", "thunderbolt", { power: "90" }),
      move("86", "thunder-wave", {
        damage_class_id: "1",
        power: "",
        accuracy: "90",
      }),
      move("344", "volt-tackle", { damage_class_id: "2", power: "120" }),
      // Recent status moves come with "0" instead of an empty field.
      move("837", "victory-dance", {
        damage_class_id: "1",
        power: "0",
        accuracy: "0",
      }),
      move("999", "unused-move"),
    ],
    move_names: [
      { move_id: "84", local_language_id: ES, name: "Impactrueno" },
      { move_id: "84", local_language_id: EN, name: "Thunder Shock" },
      { move_id: "85", local_language_id: ES, name: "Rayo" },
      { move_id: "85", local_language_id: EN, name: "Thunderbolt" },
      { move_id: "86", local_language_id: ES, name: "Onda Trueno" },
      { move_id: "86", local_language_id: EN, name: "Thunder Wave" },
      { move_id: "344", local_language_id: ES, name: "Placaje Eléc." },
      { move_id: "344", local_language_id: EN, name: "Volt Tackle" },
      { move_id: "837", local_language_id: ES, name: "Danza Triunfal" },
      { move_id: "837", local_language_id: EN, name: "Victory Dance" },
    ],
    move_flavor_text: [
      {
        move_id: "85",
        version_group_id: "20",
        language_id: ES,
        flavor_text: "Texto viejo.",
      },
      {
        move_id: "85",
        version_group_id: "25",
        language_id: ES,
        flavor_text: "Descarga una\npotente\fcorriente.",
      },
    ],
    machines: [
      {
        machine_number: "126",
        version_group_id: "25",
        item_id: "1",
        move_id: "85",
      },
    ],
    items: [{ id: "1", identifier: "tm126" }],
    pokemon_moves: [
      // Pikachu (25): Sword/Shield and Scarlet/Violet → Scarlet/Violet wins.
      learn("25", "20", "84", "1", "1"),
      learn("25", "25", "84", "1", "1"),
      learn("25", "25", "84", "1", "1"), // duplicated upstream
      learn("25", "25", "86", "1", "4"),
      learn("25", "25", "85", "4"),
      learn("25", "25", "344", "2"),
      learn("25", "25", "837", "3"),
      learn("25", "25", "84", "10"), // "form change": not imported
      // Raichu (26): only Sword/Shield.
      learn("26", "20", "85", "1", "0"),
      // Eevee (133): only Let's Go, which is skipped.
      learn("133", "19", "84", "1", "1"),
      // A Pokémon we do not import.
      learn("99999", "25", "84", "1", "1"),
    ],
  };
}

const known = {
  pokemonIds: new Set([25, 26, 133]),
  typeIds: new Set([4]),
  generationIds: new Set([7, 8, 9]),
};

describe("pickVersionGroups", () => {
  it("keeps the newest main-series game of each Pokémon", () => {
    const chosen = pickVersionGroups(makeRaw().pokemon_moves);
    expect(chosen.get(25)).toBe(25);
    expect(chosen.get(26)).toBe(20);
  });

  it("skips Let's Go and other games outside the list", () => {
    expect(pickVersionGroups(makeRaw().pokemon_moves).has(133)).toBe(false);
  });
});

describe("buildMoveTables", () => {
  const data = buildMoveTables(makeRaw(), known);
  const pikachu = data.pokemon_moves.filter((row) => row.pokemon_id === 25);

  it("keeps only the chosen game's learnset, once per row", () => {
    expect(pikachu.map((row) => [row.move_id, row.method, row.level])).toEqual([
      [84, "level-up", 1],
      [86, "level-up", 4],
      [85, "machine", 0],
      [344, "egg", 0],
      [837, "tutor", 0],
    ]);
    expect(pikachu.every((row) => row.version_group_id === 25)).toBe(true);
  });

  it("labels machine moves with their TM", () => {
    expect(pikachu.find((row) => row.method === "machine")?.machine).toBe(
      "tm126",
    );
    expect(pikachu.find((row) => row.method === "egg")?.machine).toBeNull();
  });

  it("keeps level 0 (learned on evolution) for level-up moves", () => {
    expect(
      data.pokemon_moves.find((row) => row.pokemon_id === 26),
    ).toMatchObject({ move_id: 85, method: "level-up", level: 0 });
  });

  it("ignores Pokémon we do not import", () => {
    expect(data.pokemon_moves.some((row) => row.pokemon_id === 99999)).toBe(
      false,
    );
  });

  it("imports only the moves some learnset uses, with nullable stats", () => {
    expect(data.moves.map((m) => m.slug)).toEqual([
      "thunder-shock",
      "thunderbolt",
      "thunder-wave",
      "volt-tackle",
      "victory-dance",
    ]);
    expect(data.moves.find((m) => m.slug === "thunder-wave")).toMatchObject({
      damage_class: "status",
      power: null,
      accuracy: 90,
    });
    expect(data.moves.find((m) => m.slug === "victory-dance")).toMatchObject({
      power: null,
      accuracy: null,
    });
  });

  it("uses the newest description, cleaned of the game's line breaks", () => {
    const rayo = data.move_translations.find(
      (t) => t.move_id === 85 && t.locale === "es",
    );
    expect(rayo).toEqual({
      move_id: 85,
      locale: "es",
      name: "Rayo",
      description: "Descarga una potente corriente.",
    });
    expect(
      data.move_translations.find((t) => t.move_id === 84 && t.locale === "es")
        ?.description,
    ).toBeNull();
  });

  it("imports only the games actually used", () => {
    expect(data.version_groups.map((g) => g.slug)).toEqual([
      "sword-shield",
      "scarlet-violet",
    ]);
  });

  it("fails if a move has no Spanish name", () => {
    const raw = makeRaw();
    raw.move_names = raw.move_names.filter(
      (row) => !(row.move_id === "85" && row.local_language_id === ES),
    );
    expect(() => buildMoveTables(raw, known)).toThrow(/no es name/);
  });

  it("fails if a move has a type we do not import", () => {
    const raw = makeRaw();
    raw.moves = raw.moves.map((row) =>
      row.id === "85" ? { ...row, type_id: "19" } : row,
    );
    expect(() => buildMoveTables(raw, known)).toThrow(/unknown type/);
  });
});
