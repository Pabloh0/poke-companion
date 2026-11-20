import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <p className="max-w-[72ch]">{t("disclaimer")}</p>
        <p className="font-display text-xs font-semibold text-foreground">
          {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
