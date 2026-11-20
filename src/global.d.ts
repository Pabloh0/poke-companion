import type { routing } from "@/i18n/routing";
import type messages from "@/messages/es.json";

// Makes translation keys type-safe: `t("Home.titlee")` is a compile error.
// Spanish is the reference catalogue; English must mirror its keys.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
