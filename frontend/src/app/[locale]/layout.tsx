import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Modals from "@/components/modals";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ClassConnect",
  description: "Apprenez à votre rythme avec ClassConnect",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {
    locale: string
  }
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`antialiased overflow-y-auto flex flex-col`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Providers locale={locale}>

            {children}
            <Modals />
          </Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
