"use client";

import { useCurrentLocale, useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

export default function AuthPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  
  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // JSON-LD structured data for authentication page
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": locale === 'fr' ? 'Authentification | ClassConnect' : 'Authentication | ClassConnect',
    "description": t('hero.subtitle'),
    "url": `${baseUrl}/auth`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === "fr" ? "Accueil" : "Home",
          "item": `https://www.classconnect.cm/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === "fr" ? "Authentification" : "Authentication",
          "item": `${baseUrl}/auth`
        }
      ]
    },
    "offers": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Service",
            "name": t('nav.login'),
            "description": t('loginDialog.subtitle'),
            "url": `${baseUrl}/auth/login`
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Service",
            "name": t('nav.register'),
            "description": t('registerDialog.subtitle'),
            "url": `${baseUrl}/auth/register`
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      <Helmet>
        <title>{locale === 'fr' ? 'Authentification | ClassConnect' : 'Authentication | ClassConnect'}</title>
        <meta name="description" content={t('hero.subtitle')} />
        <meta property="og:title" content={locale === 'fr' ? 'Authentification | ClassConnect' : 'Authentication | ClassConnect'} />
        <meta property="og:description" content={t('hero.subtitle')} />
        <link rel="canonical" href={`${baseUrl}/auth`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <div className="container max-w-6xl mx-auto py-8 px-4 flex-grow flex flex-col">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Link>
          </Button>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center py-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">ClassConnect</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Login Card */}
            <motion.div variants={itemVariants}>
              <Link href="/auth/login" className="block h-full">
                <Card className="shadow-md hover:shadow-lg border-primary/20 h-full transition-all duration-300 hover:translate-y-[-4px] overflow-hidden bg-card/95 backdrop-blur">
                  <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-primary/30 rounded-bl-full opacity-20"></div>
                  
                  <CardHeader className="text-center relative z-10 pb-4">
                    <div className="mx-auto rounded-full bg-primary/10 p-3 mb-3">
                      <LogIn className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t('nav.login')}</CardTitle>
                    <CardDescription>{t('loginDialog.subtitle')}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center pb-4 relative z-10">
                    <p className="text-muted-foreground">
                      {t('loginDialog.alreadyHaveAccount')}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-center pt-0 pb-6 relative z-10">
                    <Button className="bg-primary hover:bg-primary/90 transition-colors">
                      <LogIn className="mr-2 h-4 w-4" />
                      {t('loginDialog.loginButton')}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>

            {/* Register Card */}
            <motion.div variants={itemVariants}>
              <Link href="/auth/register" className="block h-full">
                <Card className="shadow-md hover:shadow-lg border-primary/20 h-full transition-all duration-300 hover:translate-y-[-4px] overflow-hidden bg-card/95 backdrop-blur">
                  <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-primary/30 rounded-bl-full opacity-20"></div>
                  
                  <CardHeader className="text-center relative z-10 pb-4">
                    <div className="mx-auto rounded-full bg-primary/10 p-3 mb-3">
                      <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t('nav.register')}</CardTitle>
                    <CardDescription>{t('registerDialog.subtitle')}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center pb-4 relative z-10">
                    <p className="text-muted-foreground">
                      {locale === 'fr' ? "Nouveau sur ClassConnect ? Créez un compte." : "New to ClassConnect? Create an account."}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-center pt-0 pb-6 relative z-10">
                    <Button className="bg-primary hover:bg-primary/90 transition-colors">
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t('registerDialog.submitButton')}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-12 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="mb-1">
              {locale === 'fr' ? 'Besoin d\'aide ?' : 'Need help?'} <Link href="/help" className="text-primary hover:underline">{locale === 'fr' ? 'Centre d\'aide' : 'Help Center'}</Link>
            </p>
            <p>
              <Link href="/privacy-policy" className="text-primary hover:underline mr-4">{locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}</Link>
              <Link href="/terms-of-service" className="text-primary hover:underline">{locale === 'fr' ? 'Conditions d\'utilisation' : 'Terms of Service'}</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}