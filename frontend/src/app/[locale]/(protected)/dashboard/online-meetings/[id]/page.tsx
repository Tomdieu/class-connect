import { Metadata } from "next";
import { getI18n } from "@/locales/server";
import OnlineMeetingDetailClient from "@/components/online-courses/OnlineMeetingDetailClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n();
  return {
    title: t("onlineMeetings.details.title"),
    description: t("onlineMeetings.description"),
  };
}

export default async function OnlineMeetingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getI18n();
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-primary/5 via-background to-background px-4 py-6 md:px-6 md:py-8">
      {/* <h1 className="text-2xl font-bold mb-6">{t("onlineMeetings.details.title")}</h1> */}
      
      <OnlineMeetingDetailClient meetingId={params.id} />
    </div>
  );
}
