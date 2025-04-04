import { Metadata } from "next";
import { getI18n } from "@/locales/server";
import OnlineMeetingsPageClient from "@/components/online-courses/OnlineMeetingsPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n();
  return {
    title: t("onlineMeetings.title"),
    description: t("onlineMeetings.description"),
  };
}

export default async function OnlineMeetingsPage() {
  const t = await getI18n();
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">{t("onlineMeetings.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("onlineMeetings.description")}</p>
      
      <OnlineMeetingsPageClient />
    </div>
  );
}
