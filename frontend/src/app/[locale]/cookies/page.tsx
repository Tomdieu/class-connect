"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, Shield, Settings, Eye, BarChart3, Globe, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function CookiesPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 shadow-md bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 z-[99999999]" />
      
      {/* Add a spacer to push content below the fixed header */}
      <div className="h-20 mt-10 md:mt-0 md:h-20"></div>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex items-center justify-between mb-8"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {locale === "fr" ? "Retour à l'accueil" : "Back to Home"}
            </Button>
          </Link>
          
          <Badge variant="outline" className="text-xs">
            {locale === "fr" ? "Dernière mise à jour: 9 Octobre 2025" : "Last updated: October 9, 2025"}
          </Badge>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Hero Section */}
          <motion.div variants={fadeIn} className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Cookie className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {locale === "fr" ? "Politique des Cookies" : "Cookie Policy"}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === "fr" 
                ? "Découvrez comment ClassConnect utilise les cookies pour améliorer votre expérience d'apprentissage." 
                : "Learn how ClassConnect uses cookies to enhance your learning experience."
              }
            </p>
          </motion.div>

          {/* What are Cookies */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-orange-600" />
                  {locale === "fr" ? "1. Qu'est-ce que les Cookies ?" : "1. What are Cookies?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  {locale === "fr" 
                    ? "Les cookies sont de petits fichiers texte qui sont stockés sur votre appareil (ordinateur, tablette ou mobile) lorsque vous visitez notre site web. Ils permettent au site de reconnaître votre appareil et de stocker certaines informations sur vos préférences ou actions passées."
                    : "Cookies are small text files that are stored on your device (computer, tablet or mobile) when you visit our website. They allow the site to recognize your device and store certain information about your preferences or past actions."
                  }
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>
                      {locale === "fr" ? "Important:" : "Important:"}
                    </strong>{" "}
                    {locale === "fr"
                      ? "Les cookies ne peuvent pas endommager votre appareil ni contenir de virus. Ils ne peuvent pas accéder aux informations personnelles stockées sur votre ordinateur."
                      : "Cookies cannot damage your device or contain viruses. They cannot access personal information stored on your computer."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Types of Cookies */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  {locale === "fr" ? "2. Types de Cookies que nous Utilisons" : "2. Types of Cookies We Use"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Essential Cookies */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {locale === "fr" ? "Cookies Essentiels" : "Essential Cookies"}
                  </h4>
                  <p className="text-gray-700 mb-2">
                    {locale === "fr"
                      ? "Ces cookies sont nécessaires au fonctionnement de notre site web. Ils permettent des fonctionnalités de base comme la navigation de page et l'accès aux zones sécurisées."
                      : "These cookies are necessary for our website to function. They enable basic features like page navigation and access to secure areas."
                    }
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {locale === "fr" ? "Gestion des sessions utilisateur" : "User session management"}</li>
                    <li>• {locale === "fr" ? "Authentification et sécurité" : "Authentication and security"}</li>
                    <li>• {locale === "fr" ? "Préférences de langue" : "Language preferences"}</li>
                  </ul>
                </div>

                {/* Performance Cookies */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {locale === "fr" ? "Cookies de Performance" : "Performance Cookies"}
                  </h4>
                  <p className="text-gray-700 mb-2">
                    {locale === "fr"
                      ? "Ces cookies collectent des informations sur la façon dont vous utilisez notre site web, nous aidant à améliorer ses performances."
                      : "These cookies collect information about how you use our website, helping us improve its performance."
                    }
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {locale === "fr" ? "Analyse du trafic du site" : "Website traffic analysis"}</li>
                    <li>• {locale === "fr" ? "Temps de chargement des pages" : "Page load times"}</li>
                    <li>• {locale === "fr" ? "Détection des erreurs" : "Error detection"}</li>
                  </ul>
                </div>

                {/* Functional Cookies */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {locale === "fr" ? "Cookies Fonctionnels" : "Functional Cookies"}
                  </h4>
                  <p className="text-gray-700 mb-2">
                    {locale === "fr"
                      ? "Ces cookies permettent au site de se souvenir de vos choix et de fournir des fonctionnalités améliorées et personnalisées."
                      : "These cookies allow the website to remember your choices and provide enhanced and personalized features."
                    }
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {locale === "fr" ? "Personnalisation de l'interface" : "Interface personalization"}</li>
                    <li>• {locale === "fr" ? "Suivi de progression des cours" : "Course progress tracking"}</li>
                    <li>• {locale === "fr" ? "Recommandations personnalisées" : "Personalized recommendations"}</li>
                  </ul>
                </div>

                {/* Third-party Cookies */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {locale === "fr" ? "Cookies Tiers" : "Third-party Cookies"}
                  </h4>
                  <p className="text-gray-700 mb-2">
                    {locale === "fr"
                      ? "Ces cookies sont définis par des services tiers que nous utilisons sur notre site, comme les outils d'analyse et les widgets sociaux."
                      : "These cookies are set by third-party services that we use on our site, such as analytics tools and social widgets."
                    }
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Google Analytics</li>
                    <li>• Ahrefs Analytics</li>
                    <li>• {locale === "fr" ? "Intégrations de médias sociaux" : "Social media integrations"}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cookie Management */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  {locale === "fr" ? "3. Gestion des Cookies" : "3. Cookie Management"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Contrôle de votre Navigateur" : "Browser Control"}
                  </h4>
                  <p className="mb-3">
                    {locale === "fr"
                      ? "Vous pouvez contrôler et gérer les cookies de plusieurs façons. La plupart des navigateurs web acceptent automatiquement les cookies, mais vous pouvez généralement modifier les paramètres de votre navigateur pour refuser les cookies si vous le préférez."
                      : "You can control and manage cookies in several ways. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer."
                    }
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Chrome</h5>
                      <p className="text-sm text-gray-600">
                        {locale === "fr" 
                          ? "Paramètres → Confidentialité et sécurité → Cookies"
                          : "Settings → Privacy and security → Cookies"
                        }
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Firefox</h5>
                      <p className="text-sm text-gray-600">
                        {locale === "fr" 
                          ? "Options → Vie privée et sécurité → Cookies"
                          : "Options → Privacy & Security → Cookies"
                        }
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Safari</h5>
                      <p className="text-sm text-gray-600">
                        {locale === "fr" 
                          ? "Préférences → Confidentialité → Cookies"
                          : "Preferences → Privacy → Cookies"
                        }
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Edge</h5>
                      <p className="text-sm text-gray-600">
                        {locale === "fr" 
                          ? "Paramètres → Confidentialité → Cookies"
                          : "Settings → Privacy → Cookies"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800 mb-1">
                        {locale === "fr" ? "Impact de la Désactivation" : "Impact of Disabling"}
                      </p>
                      <p className="text-sm text-yellow-700">
                        {locale === "fr"
                          ? "La désactivation des cookies peut affecter votre expérience sur notre site. Certaines fonctionnalités peuvent ne pas fonctionner correctement, comme le suivi de progression ou les préférences personnalisées."
                          : "Disabling cookies may affect your experience on our site. Some features may not work properly, such as progress tracking or personalized preferences."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cookie Duration */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  {locale === "fr" ? "4. Durée de Conservation" : "4. Cookie Duration"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-700">
                      {locale === "fr" ? "Cookies de Session" : "Session Cookies"}
                    </h4>
                    <p className="text-sm">
                      {locale === "fr"
                        ? "Ces cookies sont temporaires et sont supprimés automatiquement lorsque vous fermez votre navigateur."
                        : "These cookies are temporary and are automatically deleted when you close your browser."
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-700">
                      {locale === "fr" ? "Cookies Persistants" : "Persistent Cookies"}
                    </h4>
                    <p className="text-sm">
                      {locale === "fr"
                        ? "Ces cookies restent sur votre appareil pendant une période définie ou jusqu'à ce que vous les supprimiez manuellement."
                        : "These cookies remain on your device for a set period or until you manually delete them."
                      }
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Périodes de Conservation Typiques" : "Typical Retention Periods"}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>{locale === "fr" ? "Cookies de session" : "Session cookies"}:</span>
                      <Badge variant="outline">{locale === "fr" ? "Jusqu'à fermeture du navigateur" : "Until browser closes"}</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>{locale === "fr" ? "Préférences utilisateur" : "User preferences"}:</span>
                      <Badge variant="outline">{locale === "fr" ? "1 an" : "1 year"}</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>{locale === "fr" ? "Analytics" : "Analytics"}:</span>
                      <Badge variant="outline">{locale === "fr" ? "2 ans" : "2 years"}</Badge>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Updates to Policy */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  {locale === "fr" ? "5. Modifications de cette Politique" : "5. Changes to this Policy"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  {locale === "fr"
                    ? "Nous pouvons mettre à jour cette politique des cookies de temps à autre pour refléter les changements dans notre utilisation des cookies ou pour d'autres raisons opérationnelles, légales ou réglementaires."
                    : "We may update this cookie policy from time to time to reflect changes in our use of cookies or for other operational, legal, or regulatory reasons."
                  }
                </p>
                <p>
                  {locale === "fr"
                    ? "Nous vous encourageons à consulter régulièrement cette page pour rester informé de notre utilisation des cookies et des technologies similaires."
                    : "We encourage you to regularly review this page to stay informed about our use of cookies and similar technologies."
                  }
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>
                      {locale === "fr" ? "Notification des Changements:" : "Change Notification:"}
                    </strong>{" "}
                    {locale === "fr"
                      ? "Les changements significatifs seront communiqués par email ou via une notification sur notre site."
                      : "Significant changes will be communicated via email or through a notification on our site."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={fadeIn}>
            <Card className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-600" />
                  {locale === "fr" ? "6. Contact" : "6. Contact Us"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  {locale === "fr"
                    ? "Si vous avez des questions concernant notre utilisation des cookies, n'hésitez pas à nous contacter:"
                    : "If you have any questions about our use of cookies, please feel free to contact us:"
                  }
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Mail className="w-4 h-4" />
                    <span>privacy@classconnect.cm</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {locale === "fr"
                    ? "Nous nous engageons à protéger votre vie privée et à utiliser les cookies de manière transparente."
                    : "We are committed to protecting your privacy and using cookies transparently."
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </main>

      <Footer />
    </>
  );
}

export default CookiesPage;