"use client";

import { I18nProviderClient } from "@/locales/client";
export const Providers = ({
  children,
  locale,
}: {
  locale: string;
  children: React.ReactNode;
}) => {
  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
};
