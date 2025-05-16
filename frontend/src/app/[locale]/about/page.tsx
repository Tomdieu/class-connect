"use client";

import React from 'react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Github, Linkedin, Twitter, Youtube, Mail, 
  BookOpen, Users, Binary, Briefcase, MapPin, 
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function AboutPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  
  // Developer information
  const developer = {
    name: "TOMDIEU IVAN",
    title: "Full Stack Developer",
    description: "Passionate about creating innovative web solutions",
    location: "Cameroon",
    image: "https://avatars.githubusercontent.com/u/77198289?v=4",
    social: [
      { icon: <Github className="h-5 w-5" />, url: "https://github.com/Tomdieu", name: "GitHub" },
      { icon: <Linkedin className="h-5 w-5" />, url: "https://www.linkedin.com/in/tomdieuivan/", name: "LinkedIn" },
      { icon: <Twitter className="h-5 w-5" />, url: "https://twitter.com/navicorp_", name: "Twitter" },
      { icon: <Youtube className="h-5 w-5" />, url: "https://www.youtube.com/channel/UCqkkqlqY2WXx7gVmFe7htuQ", name: "YouTube" },
    ]
  };
  
  // For animations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  // Base URL with locale for canonical and JSON-LD
  const baseUrl = `https://www.classconnect.cm/${locale}`;
  
  // Define SEO metadata variables
  const pageTitle = t('about.pageTitle');
  const pageDescription = t('about.pageDescription');
  const pageUrl = `${baseUrl}/about`;

  // Enhanced Keywords for Developer SEO
  const keywords = `ClassConnect, Tomdieu Ivan, Ivan Tomdieu, Tomdieu Ivan developer, Full Stack Developer Cameroon, ClassConnect developer, E-learning Platform Cameroon, Online Education, About ClassConnect, ${t('about.title')}, ${t('about.subtitle')}, ${developer.name}, ${developer.title}`;
  
  // JSON-LD structured data for about page
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": pageUrl,
    "mainEntity": {
      "@type": "Organization",
      "name": "ClassConnect",
      "description": t('about.subtitle'),
      "url": `https://www.classconnect.cm/${locale}`,
      "sameAs": [
        "https://github.com/Tomdieu",
        "https://www.linkedin.com/in/tomdieuivan/",
        "https://twitter.com/navicorp_",
        "https://www.youtube.com/channel/UCqkkqlqY2WXx7gVmFe7htuQ"
      ],
      "founder": {
        "@type": "Person",
        "name": developer.name,
        "jobTitle": developer.title,
        "description": developer.description,
        "image": developer.image,
        "url": "https://github.com/Tomdieu",
        "sameAs": developer.social.map(s => s.url),
        "address": {
          "@type": "PostalAddress",
          "addressCountry": developer.location
        }
      },
      "offers": {
        "@type": "Offer",
        "category": "Education",
        "description": t('about.whatIs.desc1')
      }
    },
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
          "name": pageTitle,
          "item": pageUrl
        }
      ]
    }
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name='keywords' content={keywords}/>
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
        
        {/* SEO: Open Graph tags for social sharing */}
        <meta property="og:title" content={`${pageTitle} | Developed by Tomdieu Ivan`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={developer.image} /> 

        {/* SEO: Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${pageTitle} | Developed by Tomdieu Ivan`} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={developer.image} />
        
        {/* Additional metadata for better SEO */}
        <meta name="author" content="Tomdieu Ivan" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content={locale} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container px-4 mx-auto max-w-6xl py-12">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex mb-8 h-auto p-1">
            <TabsTrigger value="about" className="py-2.5">{t('about.tabs.platform')}</TabsTrigger>
            <TabsTrigger value="features" className="py-2.5">{t('about.tabs.features')}</TabsTrigger>
            <TabsTrigger value="developer" className="py-2.5">{t('about.tabs.developer')}</TabsTrigger>
          </TabsList>
          
          {/* About Platform Content */}
          <TabsContent value="about" className="space-y-12">
            <motion.div 
              className="grid md:grid-cols-2 gap-8 items-center"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeIn}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('about.whatIs.title')}</h2>
                <p className="text-muted-foreground mb-4">
                  {t('about.whatIs.desc1')} {locale === 'fr' ? 'Développée par' : 'Developed by'} {developer.name}, ClassConnect {locale === 'fr' ? 'est conçue pour...' : 'is designed to...'}
                </p>
                <p className="text-muted-foreground">{t('about.whatIs.desc2')}</p>
              </motion.div>
              
              <motion.div variants={fadeIn} className="rounded-xl overflow-hidden shadow-lg">
                <div className="relative h-72 bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-primary/60" />
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('about.howItWorks.title')}</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border border-border/50">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{t('about.howItWorks.registration')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{t(`about.howItWorks.steps.${idx}` as keyof typeof t)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/50">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Binary className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{t('about.platform.learn.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('about.platform.learn.description')}</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.platform.learn.points.0')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.platform.learn.points.1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.platform.learn.points.2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.platform.learn.points.3')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/50">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{t('about.platform.grow.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{t('about.platform.grow.description')}</p>
                    <div className="flex items-center gap-2 text-primary">
                      <Link href="/auth/register" className="flex items-center">
                        <span className="underline underline-offset-4 font-medium">
                          {t('about.platform.grow.startNow')}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            
            <motion.div variants={fadeIn} initial="hidden" animate="visible" className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('about.conclusion.title')}</h2>
              <p className="text-muted-foreground mb-6">{t('about.conclusion.text')}</p>
              <Button asChild size="lg">
                <Link href="/auth/register">
                  {t('about.conclusion.joinUs')}
                </Link>
              </Button>
            </motion.div>
          </TabsContent>
          
          {/* Features Content */}
          <TabsContent value="features" className="space-y-12">
            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeIn}>
                <Card className="h-full border border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M18 8a6 6 0 0 0-6-6H4v20h9a6 6 0 0 0 5.33-8.75A6 6 0 0 0 18 8Z"></path>
                        <line x1="6" x2="9" y1="9" y2="9"></line>
                        <line x1="6" x2="9" y1="15" y2="15"></line>
                        <line x1="10" x2="17" y1="9" y2="9"></line>
                        <line x1="10" x2="17" y1="15" y2="15"></line>
                      </svg>
                    </div>
                    <CardTitle>{t('about.features.courseManagement.title')}</CardTitle>
                    <CardDescription>{t('features.courseManagement.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.courseManagement.desc.0')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.courseManagement.desc.1')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.courseManagement.desc.2')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="h-full border border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </div>
                    <CardTitle>{t('about.features.virtualClassroom.title')}</CardTitle>
                    <CardDescription>{t('features.virtualClassroom.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.virtualClassroom.desc.0')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.virtualClassroom.desc.1')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.virtualClassroom.desc.2')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="h-full border border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <CardTitle>{t('about.features.experience.title')}</CardTitle>
                    <CardDescription>{t('features.experience.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.experience.desc.0')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.experience.desc.1')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.experience.desc.2')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="h-full border border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
                        <path d="M3 7h18"></path>
                        <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path>
                      </svg>
                    </div>
                    <CardTitle>{t('about.features.subscriptions.title')}</CardTitle>
                    <CardDescription>{t('features.subscriptions.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.subscriptions.desc.0')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.subscriptions.desc.1')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.subscriptions.desc.2')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="h-full border border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                        <line x1="2" x2="22" y1="10" y2="10"></line>
                      </svg>
                    </div>
                    <CardTitle>{t('about.features.payments.title')}</CardTitle>
                    <CardDescription>{t('features.payments.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.payments.desc.0')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.payments.desc.1')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.payments.desc.2')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Card className="h-full border border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                      </svg>
                    </div>
                    <CardTitle>{t('about.features.support.title')}</CardTitle>
                    <CardDescription>{t('features.support.desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.support.desc.0')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.support.desc.1')}</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{t('about.features.support.desc.2')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          {/* Developer Content */}
          <TabsContent value="developer" className="space-y-10">
            <motion.div 
              className="grid md:grid-cols-3 gap-8 items-start"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeIn} className="md:col-span-1">
                <Card className="overflow-hidden border-primary/20">
                  <div className="relative h-48 flex items-center justify-center bg-gray-100">
                    <Image 
                      src={developer.image}
                      alt={`${developer.name} - ${developer.title} - Developer of ClassConnect`}
                      width={150}
                      height={150}
                      className="object-cover rounded-full border-4 border-white shadow-md"
                    />
                  </div>
                  <CardContent className="pt-6 text-center">
                    <h3 className="text-2xl font-bold mb-1">{developer.name}</h3>
                    <p className="text-primary font-medium mb-3">{developer.title}</p>
                    
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{developer.location}</span>
                    </div>
                    
                    <div className="flex gap-3 justify-center mt-4">
                      {developer.social.map((item, index) => (
                        <Link 
                          key={index}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                          title={item.name}
                        >
                          {item.icon}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeIn} className="md:col-span-2">
                <Card className="h-full border-primary/20">
                  <CardHeader>
                    <CardTitle>{t('about.developer.aboutTitle')} - {developer.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p>{t('about.developer.bio')} {locale === 'fr' ? 'En tant que développeur principal de ClassConnect...' : 'As the lead developer of ClassConnect...'}</p>
                    
                    <div>
                      <h4 className="font-medium mb-3">{t('about.developer.skills')}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {t('about.developer.skillsList.0')}
                        </span>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {t('about.developer.skillsList.1')}
                        </span>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {t('about.developer.skillsList.2')}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">{t('about.developer.projectRole')}</h4>
                      <ul className="space-y-2">
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{t('about.developer.responsibilities.0')}</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{t('about.developer.responsibilities.1')}</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{t('about.developer.responsibilities.2')}</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{t('about.developer.responsibilities.3')}</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{t('about.developer.responsibilities.4')}</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{t('about.developer.responsibilities.5')}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="pt-4">
                      <Button asChild variant="outline" className="gap-2">
                        <Link href="mailto:ivan.tomdieu@gmail.com">
                          <Mail className="h-4 w-4" />
                          {t('about.developer.contact')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

export default AboutPage;