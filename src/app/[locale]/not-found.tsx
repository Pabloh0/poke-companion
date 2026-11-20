import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="font-display text-6xl font-bold text-highlight">404</p>
      <h1 className="mt-6 text-3xl font-bold">{t("title")}</h1>
      <p className="mt-3 max-w-[60ch] text-muted-foreground">
        {t("description")}
      </p>
      <Button asChild className="mt-8">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
