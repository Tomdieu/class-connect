"use client";

import { useCurrentLocale, useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EyeIcon,
  EyeOffIcon,
  LogIn,
  ArrowLeft,
  LoaderCircle,
  BookOpen,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Helmet } from "react-helmet-async";

export default function LoginPage() {
  const t = useI18n();
  const router = useRouter();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    if (status === "authenticated") {
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
      } else {
        router.push("/redirect");
      }
    }
  }, [status, callbackUrl, router]);

  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;

  // JSON-LD structured data for login page - localized
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("loginDialog.title"),
    description: t("loginDialog.subtitle"),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "fr" ? "Accueil" : "Home",
          item: `https://www.classconnect.cm/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("nav.login"),
          item: `${baseUrl}/auth/login`,
        },
      ],
    },
    mainEntity: {
      "@type": "LoginAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/auth/login`,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      potentialAction: {
        "@type": "AuthenticateAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/auth/login`,
        },
      },
    },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setError(t("loginDialog.errors.emailRequired"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // This needs to match the parameter names expected by the authorize function
      const res = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });

      // Handle specific error code
      if (res?.error === "CredentialsSignin") {
        setError(t("loginDialog.invalidCredential"));
        setIsLoading(false);
        return;
      }

      if (res && res.ok && !res.error) {
        setIsLoading(false);
        toast.success("Login successful!");
        router.refresh();

        // If a callbackUrl is provided, use it
        if (callbackUrl) {
          router.push(decodeURIComponent(callbackUrl));
        } else {
          // Use the automatic redirection feature
          router.push("/redirect");
          // window.location.href = "/redirect";
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(t("loginDialog.invalidCredential"));
      toast.error(t("loginDialog.invalidCredential"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-md mx-auto py-10 px-4">
        <Helmet>
          <title>
            {locale === "fr"
              ? "Connexion | ClassConnect"
              : "Login | ClassConnect"}
          </title>
          <meta name="description" content={t("loginDialog.subtitle")} />
          <meta
            property="og:title"
            content={
              locale === "fr"
                ? "Connexion | ClassConnect"
                : "Login | ClassConnect"
            }
          />
          <meta property="og:description" content={t("loginDialog.subtitle")} />
          <link rel="canonical" href={`${baseUrl}/auth/login`} />
          <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
        </Helmet>

        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/30 rounded-bl-full z-0 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20"></div>

          <CardHeader className="space-y-1 text-center relative z-10">
            <div className="text-center w-full flex items-center justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {t("loginDialog.title")}
            </CardTitle>
            <CardDescription>{t("loginDialog.subtitle")}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 relative z-10">
              {error && (
                <div className="p-4 text-sm bg-destructive/15 text-destructive rounded-md border border-destructive/30 shadow-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {t("loginDialog.emailLabel")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-background"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {t("loginDialog.passwordLabel")}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-xs text-primary hover:text-primary/80 hover:bg-transparent"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <EyeIcon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-background"
                  autoComplete="current-password"
                />
              </div>
              
              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  {t("loginDialog.forgotPasswordButton")}
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 relative z-10">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("loginDialog.loginButton")}
                  </div>
                )}
              </Button>

              <div className="text-center text-sm">
                <p>
                  {t("loginDialog.alreadyHaveAccount")}{" "}
                  <Link
                    href="/auth/register"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("nav.register")}
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
