"use client";

import { useCurrentLocale, useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, LogIn, ArrowLeft, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Helmet } from 'react-helmet-async';

export default function LoginPage() {
  const t = useI18n();
  const router = useRouter();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/students';
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;

  // JSON-LD structured data for login page - localized
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('loginDialog.title'),
    "description": t('loginDialog.subtitle'),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'fr' ? "Accueil" : "Home",
          "item": `https://www.classconnect.cm/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t('nav.login'),
          "item": `${baseUrl}/auth/login`
        }
      ]
    },
    "mainEntity": {
      "@type": "LoginAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/auth/login`,
        "actionPlatform": [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform"
        ]
      },
      "potentialAction": {
        "@type": "AuthenticateAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/auth/login`
        }
      }
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError(t('loginDialog.errors.emailRequired'));
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // This needs to match the parameter names expected by the authorize function
      const res = await signIn('credentials', {
        email: email, // Use the same field name as in LoginDialog
        password: password,
        redirect: false,
      });
      
      console.log("Login response:", res); // For debugging
      
      // Handle specific error code like in LoginDialog
      if (res?.error === "CredentialsSignin") {
        setError(t('loginDialog.invalidCredential'));
        setIsLoading(false);
        return;
      }
      
      if (res && res.ok && !res.error) {
        setIsLoading(false);
        toast.success("Login successful!");
        
        // Handle URL parsing similar to LoginDialog
        if (res.url) {
          const url = new URL(res.url);
          const urlCallbackParam = url.searchParams.get("callbackUrl");
          if (urlCallbackParam) {
            const decodedCallbackUrl = decodeURIComponent(urlCallbackParam);
            router.push(decodedCallbackUrl);
          } else {
            router.push(callbackUrl || "/students");
          }
        } else {
          router.push(callbackUrl || "/students");
        }
        
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(t('loginDialog.invalidCredential'));
      toast.error(t('loginDialog.invalidCredential'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-full bg-background px-4">
      <Helmet>
        <title>{locale === 'fr' ? 'Connexion | ClassConnect' : 'Login | ClassConnect'}</title>
        <meta name="description" content={t('loginDialog.subtitle')} />
        <meta property="og:title" content={locale === 'fr' ? 'Connexion | ClassConnect' : 'Login | ClassConnect'} />
        <meta property="og:description" content={t('loginDialog.subtitle')} />
        <link rel="canonical" href={`${baseUrl}/auth/login`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Link>
          </Button>
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{t('loginDialog.title')}</CardTitle>
            <CardDescription>
              {t('loginDialog.subtitle')}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('loginDialog.emailLabel')}</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('loginDialog.passwordLabel')}</Label>
                  <Button 
                    variant="link" 
                    className="p-0 text-xs"
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
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('loginDialog.loginButton')}
                  </div>
                )}
              </Button>
              
              <div className="text-center text-sm mt-4">
                <p>
                  {t('registerDialog.closeButton')}{" "}
                  <Link href="/auth/register" className="text-primary hover:underline">
                    {t('nav.register')}
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
