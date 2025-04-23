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
  // Since OnlineMeetingsPageClient now has its own heading and layout,
  // we don't need to render duplicate elements here
  return (
    <OnlineMeetingsPageClient />
  );
}
