import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Modals from "@/components/modals";
import { Providers } from "./providers";

import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const Inter = localFont({
  src: [
    {
      path: "../../../public/fonts/Inter/static/Inter-Regular.ttf",
      weight: "400",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-Medium.ttf",
      weight: "500",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-SemiBold.ttf",
      weight: "600",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-Bold.ttf",
      weight: "700",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-Black.ttf",
      weight: "800",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-ExtraBold.ttf",
      weight: "900",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClassConnect",
  description: "Apprenez à votre rythme avec ClassConnect",
  keywords:
    "ClassConnect, apprendre, tutoriel, cours, e-learning, formation, enseignement, éducation, apprentissage, tutoriel, cours, e-learning, formation, enseignement, éducation",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://class-connect-alpha.vercel.app",
    title: "ClassConnect",
    description: "Apprenez à votre rythme avec ClassConnect",
    images: [
      {
        url: "https://class-connect-alpha.vercel.app/next.svg",
        width: 1200,
        height: 630,
        alt: "ClassConnect",
      },
    ],
    siteName: "ClassConnect",
    alternateLocale: ["en", "fr"],
    countryName: "Cameroon",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClassConnect",
    description: "Apprenez à votre rythme avec ClassConnect",
    site: "@classconnect",
    creator: "@tomdieuivan",
    images: [
      {
        url: "https://class-connect-alpha.vercel.app/icon.svg",
        width: 1200,
        height: 630,
        alt: "ClassConnect",
      },
    ],
  },
  metadataBase: new URL("https://class-connect-alpha.vercel.app"),
  creator: "Tomdieu Ivan",
  category: "Education",
  icons: [
    {
      rel: "icon",
      href: "/icon.svg",
      type: "image/svg",
      sizes: "32x32",
      url: "/icon.svg",
    },
  ],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`antialiased overflow-y-auto flex flex-col ${Inter.variable} font-inter`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <SessionProvider>
            <Providers locale={locale}>
              <ReactQueryProvider>{children}</ReactQueryProvider>
              <Modals />
              <Toaster />
            </Providers>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
