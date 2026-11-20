import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SECTION_SCROLL_MARGIN } from "@/features/pokedex/lib/entry-sections";
import { TypeBadge } from "@/features/types/components/type-badge";
import { cn } from "@/lib/utils";
import {
  isKnownGame,
  type DamageClass,
  type LearnMethod,
  type LearnedMove,
  type Learnset,
} from "../lib/learnset";

/** The newest game: any other one gets a note explaining why it is shown. */
const LATEST_GAME = "scarlet-violet";

/** Scarlet/Violet numbers its machines with three digits (MT001), older
 *  games with two (MT01, DT00). */
function machineDigits(game: string): number {
  return game === "scarlet-violet" ? 3 : 2;
}

/**
 * Tailwind only generates classes it can read in the source, so each method
 * gets its literal class: the panel shows when its radio is checked.
 */
const PANEL_VISIBLE: Record<LearnMethod, string> = {
  "level-up": "group-has-[input[value=level-up]:checked]/moves:block",
  machine: "group-has-[input[value=machine]:checked]/moves:block",
  egg: "group-has-[input[value=egg]:checked]/moves:block",
  tutor: "group-has-[input[value=tutor]:checked]/moves:block",
  reminder: "group-has-[input[value=reminder]:checked]/moves:block",
};

/** A small mark per category, in the colours the games use for them:
 *  orange physical, blue special, grey status. */
const CATEGORY_MARK: Record<DamageClass, string> = {
  physical: "bg-type-fire",
  special: "bg-type-water",
  status: "bg-muted-foreground",
};

/**
 * "Movimientos" on the detail page: what the Pokémon learns in one game,
 * split by method (level-up, TM, egg…). Server-rendered with every method's
 * table in the HTML; the switcher is a radio group and CSS shows the table of
 * the checked one, so it works without JavaScript and ships no data twice.
 */
export function MovesSection({
  learnset,
  pokemonSlug,
  pokemonName,
}: {
  learnset: Learnset | null;
  /** Makes the radio group's name unique: React may keep the previous
   *  Pokémon's page hidden in the document, with its own group. */
  pokemonSlug: string;
  pokemonName: string;
}) {
  const t = useTranslations("Moves");
  const groups = learnset?.groups ?? [];
  const [first] = groups;
  const game =
    learnset && isKnownGame(learnset.game) ? t(`games.${learnset.game}`) : null;

  return (
    <section
      id="moves"
      aria-labelledby="moves-heading"
      className={cn(
        SECTION_SCROLL_MARGIN,
        "mt-16 border-t-[3px] border-foreground pt-10",
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <div>
          <h2
            id="moves-heading"
            className="text-3xl font-black tracking-tight condensed"
          >
            {t("heading")}
          </h2>
          {game && (
            <p className="mt-3 font-serif text-lg leading-snug text-muted-foreground">
              {learnset?.game === LATEST_GAME
                ? t("intro", { game })
                : t("introOlderGame", { game })}
            </p>
          )}
        </div>

        {first ? (
          <div className="group/moves min-w-0">
            {groups.length > 1 && (
              <fieldset className="mb-6">
                <legend className="sr-only">{t("methodsLabel")}</legend>
                <SegmentedControl
                  name={`moves-method-${pokemonSlug}`}
                  defaultValue={first.method}
                  options={groups.map((group) => ({
                    value: group.method,
                    label: t(`methods.${group.method}`),
                    count: group.moves.length,
                    srLabel: t("moveCount", { count: group.moves.length }),
                  }))}
                  className="grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))]"
                />
              </fieldset>
            )}
            {groups.map((group) => (
              <div
                key={group.method}
                className={cn(
                  groups.length > 1 && "hidden",
                  groups.length > 1 && PANEL_VISIBLE[group.method],
                )}
              >
                <p className="text-sm text-muted-foreground">
                  {t(`methodIntro.${group.method}`)}
                </p>
                <MovesTable
                  method={group.method}
                  moves={group.moves}
                  digits={machineDigits(learnset?.game ?? "")}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="font-serif text-lg text-muted-foreground lg:pt-1.5">
            {t("empty", { name: pokemonName })}
          </p>
        )}
      </div>
    </section>
  );
}

function MovesTable({
  method,
  moves,
  digits,
}: {
  method: LearnMethod;
  moves: LearnedMove[];
  /** How many digits machine numbers have in this game. */
  digits: number;
}) {
  const t = useTranslations("Moves");
  const firstColumn =
    method === "level-up" ? "level" : method === "machine" ? "machine" : null;

  return (
    <table className="mt-3 w-full border-collapse text-sm">
      <caption className="sr-only">{t(`methods.${method}`)}</caption>
      <thead>
        <tr className="border-b-2 border-foreground text-left text-xs font-bold text-muted-foreground">
          {firstColumn && (
            <th scope="col" className="w-16 py-2 pr-3 font-bold">
              {t(`columns.${firstColumn}`)}
            </th>
          )}
          <th scope="col" className="py-2 pr-3 font-bold">
            {t("columns.move")}
          </th>
          <th scope="col" className="hidden py-2 pr-3 font-bold md:table-cell">
            {t("columns.type")}
          </th>
          <th scope="col" className="hidden py-2 pr-3 font-bold md:table-cell">
            {t("columns.category")}
          </th>
          <Stat as="th" title={t("columnsFull.power")}>
            {t("columns.power")}
          </Stat>
          <Stat as="th" title={t("columnsFull.accuracy")}>
            {t("columns.accuracy")}
          </Stat>
          <Stat as="th" title={t("columnsFull.pp")}>
            {t("columns.pp")}
          </Stat>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {moves.map((move) => (
          <tr key={`${move.slug}-${move.level}`} className="align-top">
            {firstColumn && (
              <td className="py-3 pr-3 font-bold whitespace-nowrap tabular-nums">
                <FirstCell move={move} digits={digits} />
              </td>
            )}
            <td className="py-3 pr-3">
              <span
                className="font-semibold"
                lang={move.name.locale === "en" ? "en" : undefined}
              >
                {move.name.text}
              </span>
              {/* Phones: type, category and numbers on one line. */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:hidden">
                <TypeBadge type={move.type} size="sm" />
                <Category damageClass={move.damageClass} />
                <span className="tabular-nums">
                  {t("columns.power")} <Value value={move.power} />
                </span>
                <span className="tabular-nums">
                  {t("columns.accuracy")} <Value value={move.accuracy} />
                </span>
                <span className="tabular-nums">
                  {t("columns.pp")} <Value value={move.pp} />
                </span>
              </div>
              {move.description && (
                <p
                  className="mt-1.5 max-w-prose text-[0.8125rem] leading-snug text-muted-foreground"
                  lang={move.description.locale === "en" ? "en" : undefined}
                >
                  {move.description.text}
                </p>
              )}
            </td>
            <td className="hidden py-3 pr-3 md:table-cell">
              <TypeBadge type={move.type} size="sm" />
            </td>
            <td className="hidden py-3 pr-3 text-xs md:table-cell">
              <Category damageClass={move.damageClass} />
            </td>
            <Stat as="td">
              <Value value={move.power} />
            </Stat>
            <Stat as="td">
              <Value value={move.accuracy} />
            </Stat>
            <Stat as="td">
              <Value value={move.pp} />
            </Stat>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** "Evo." / level number, or the machine ("MT126"). */
function FirstCell({ move, digits }: { move: LearnedMove; digits: number }) {
  const t = useTranslations("Moves");
  if (move.machine) {
    return (
      <>
        {t(`machine.${move.machine.kind}`, {
          number: String(move.machine.number).padStart(digits, "0"),
        })}
      </>
    );
  }
  if (move.level === 0) {
    return <abbr title={t("evolveFull")}>{t("evolve")}</abbr>;
  }
  return <>{move.level}</>;
}

function Category({ damageClass }: { damageClass: DamageClass }) {
  const t = useTranslations("Moves");
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
      <span
        aria-hidden
        className={cn("size-2 rounded-full", CATEGORY_MARK[damageClass])}
      />
      {t(`categories.${damageClass}`)}
    </span>
  );
}

/** Power, accuracy and PP: hidden on phones, where the meta line has them. */
function Stat({
  as: Cell,
  title,
  children,
}: {
  as: "th" | "td";
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Cell
      scope={Cell === "th" ? "col" : undefined}
      className={cn(
        "hidden w-14 py-2 pl-2 text-right tabular-nums md:table-cell",
        Cell === "th" ? "font-bold" : "py-3",
      )}
    >
      {title ? <abbr title={title}>{children}</abbr> : children}
    </Cell>
  );
}

/** A number, or a dash when the move has none (status moves, sure hits). */
function Value({ value }: { value: number | null }) {
  const t = useTranslations("Moves");
  if (value !== null) return <>{value}</>;
  return (
    <>
      <span aria-hidden>—</span>
      <span className="sr-only">{t("noValue")}</span>
    </>
  );
}
