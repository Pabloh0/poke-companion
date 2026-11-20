import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";

/** Set like the fine print at the bottom of a card. */
export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-24 border-t-[3px] border-foreground">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-[auto_1fr] sm:gap-10 sm:px-6">
        <p className="font-display text-2xl font-black tracking-tight condensed">
          {siteConfig.name}
        </p>
        <p className="max-w-[72ch] font-serif text-sm leading-relaxed text-muted-foreground">
          {t("disclaimer")}
        </p>
      </div>
    </footer>
  );
}
