import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TypeBadge } from "@/features/types/components/type-badge";
import { POKEMON_TYPES } from "@/features/types/data/pokemon-types";
import { cn } from "@/lib/utils";

// Order matches docs/06-DevelopmentRoadmap.md.
const MODULES = [
  { id: "pokedex", status: "inProgress", href: "/pokedex" },
  { id: "typeCalculator", status: "planned" },
  { id: "evolutions", status: "planned" },
  { id: "database", status: "planned" },
  { id: "accounts", status: "planned" },
  { id: "teamBuilder", status: "planned" },
  { id: "collection", status: "planned" },
  { id: "community", status: "planned" },
] as const;

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-20">
        <h1 className="max-w-[16ch] text-4xl leading-[1.1] font-bold tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-muted-foreground">
          {t("intro")}
        </p>
      </section>

      <section aria-labelledby="types-heading" className="border-t py-12">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <div>
            <h2 id="types-heading" className="text-xl font-semibold">
              {t("typesHeading")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("typesIntro")}</p>
          </div>
          {/* The one orchestrated motion moment of the page: chips arrive in
              sequence on load. Disabled automatically with reduced motion. */}
          <ul className="flex flex-wrap content-start gap-2.5">
            {POKEMON_TYPES.map((type, index) => (
              <li
                key={type}
                className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <TypeBadge type={type} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="roadmap-heading" className="border-t py-12">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <div>
            <h2 id="roadmap-heading" className="text-xl font-semibold">
              {t("roadmapHeading")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("roadmapIntro")}</p>
          </div>
          <ol className="divide-y">
            {MODULES.map((module, index) => (
              <li
                key={module.id}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 py-5 first:pt-0 sm:grid-cols-[2.5rem_1fr_auto]"
              >
                <span
                  aria-hidden
                  className="font-display text-lg font-bold text-highlight tabular-nums"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-sans text-lg font-bold">
                    {t(`modules.${module.id}.name`)}
                  </h3>
                  <p className="mt-1 max-w-[60ch] text-muted-foreground">
                    {t(`modules.${module.id}.description`)}
                  </p>
                  {"href" in module && (
                    <Link
                      href={module.href}
                      className="mt-2 inline-block font-semibold text-highlight underline-offset-4 hover:underline"
                    >
                      {t("openPokedex")}
                    </Link>
                  )}
                </div>
                <span
                  className={cn(
                    "col-start-2 mt-2 inline-flex h-7 w-fit items-center rounded-full border px-3 text-sm font-semibold sm:col-start-3 sm:mt-0",
                    module.status === "inProgress"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {t(`status.${module.status}`)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
