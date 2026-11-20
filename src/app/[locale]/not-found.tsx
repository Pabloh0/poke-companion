import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="font-display text-8xl leading-none font-black condensed">
        404
      </p>
      <h1 className="mt-4 text-4xl font-black condensed">{t("title")}</h1>
      <p className="mt-3 max-w-[60ch] font-serif text-lg text-muted-foreground">
        {t("description")}
      </p>
      <Button asChild className="mt-8">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
