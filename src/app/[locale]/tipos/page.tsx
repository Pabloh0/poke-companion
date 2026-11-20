import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  TypeCalculator,
  TypeCalculatorFallback,
} from "@/features/types/components/type-calculator";
import { TypeChart } from "@/features/types/components/type-chart";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TypeCalculator");
  return { title: t("title"), description: t("metaDescription") };
}

/**
 * Type calculator. Needs no data from the database: the chart lives in code,
 * so the whole page is static and works offline once loaded.
 */
export default async function TypesPage() {
  const t = await getTranslations("TypeCalculator");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      {/* Same "binder spine" header as the Pokédex. */}
      <header className="mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b-[3px] border-foreground pb-5">
        <h1 className="max-w-[12ch] text-6xl leading-[0.85] font-black tracking-tight condensed sm:text-7xl">
          {t("title")}
        </h1>
        <p className="max-w-[44ch] font-serif text-lg leading-snug text-muted-foreground">
          {t("intro")}
        </p>
      </header>

      {/* The calculator reads ?mode=…&types=… in the browser; until then the
          prerendered fallback shows the same layout, empty. */}
      <Suspense fallback={<TypeCalculatorFallback />}>
        <TypeCalculator />
      </Suspense>

      <section
        aria-labelledby="chart-heading"
        className="mt-16 border-t-[3px] border-foreground pt-10"
      >
        {/* minmax(0, 1fr): without it the column grows to the table's width
            and the whole page scrolls sideways instead of the table. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div>
            <h2
              id="chart-heading"
              className="text-3xl font-black tracking-tight condensed"
            >
              {t("chartHeading")}
            </h2>
            <p className="mt-3 font-serif text-lg leading-snug text-muted-foreground">
              {t("chartIntro")}
            </p>
          </div>
          <div className="min-w-0">
            <TypeChart />
          </div>
        </div>
      </section>
    </div>
  );
}
