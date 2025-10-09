"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentLocale, useI18n } from '@/locales/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Shield, AlertTriangle, Clock, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function TermsPage() {
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
              <div className="p-3 bg-blue-100 rounded-full">
                <Scale className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {locale === "fr" ? "Conditions d'Utilisation" : "Terms of Service"}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === "fr" 
                ? "Veuillez lire attentivement ces conditions d'utilisation avant d'utiliser ClassConnect." 
                : "Please read these terms of service carefully before using ClassConnect."
              }
            </p>
          </motion.div>

          {/* Acceptance of Terms */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  {locale === "fr" ? "1. Acceptation des Conditions" : "1. Acceptance of Terms"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  {locale === "fr" 
                    ? "En accédant et en utilisant la plateforme ClassConnect, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services."
                    : "By accessing and using the ClassConnect platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
                  }
                </p>
                <p>
                  {locale === "fr"
                    ? "ClassConnect se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants."
                    : "ClassConnect reserves the right to modify these terms at any time. Users will be notified of significant changes."
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Accounts */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {locale === "fr" ? "2. Comptes Utilisateurs" : "2. User Accounts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Création de Compte" : "Account Creation"}
                  </h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      {locale === "fr"
                        ? "Vous devez fournir des informations exactes et complètes lors de l'inscription"
                        : "You must provide accurate and complete information during registration"
                      }
                    </li>
                    <li>
                      {locale === "fr"
                        ? "Vous êtes responsable de maintenir la confidentialité de votre mot de passe"
                        : "You are responsible for maintaining the confidentiality of your password"
                      }
                    </li>
                    <li>
                      {locale === "fr"
                        ? "Un seul compte par utilisateur est autorisé"
                        : "Only one account per user is allowed"
                      }
                    </li>
                    <li>
                      {locale === "fr"
                        ? "Vous devez avoir au moins 13 ans pour créer un compte"
                        : "You must be at least 13 years old to create an account"
                      }
                    </li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Responsabilités de l'Utilisateur" : "User Responsibilities"}
                  </h4>
                  <p>
                    {locale === "fr"
                      ? "Vous êtes responsable de toutes les activités qui se produisent sous votre compte et devez nous notifier immédiatement de tout usage non autorisé."
                      : "You are responsible for all activities that occur under your account and must notify us immediately of any unauthorized use."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Educational Services */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  {locale === "fr" ? "3. Services Éducatifs" : "3. Educational Services"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Contenu des Cours" : "Course Content"}
                  </h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      {locale === "fr"
                        ? "Le contenu éducatif est fourni à des fins d'apprentissage uniquement"
                        : "Educational content is provided for learning purposes only"
                      }
                    </li>
                    <li>
                      {locale === "fr"
                        ? "Nous ne garantissons pas l'exactitude complète de tout le contenu tiers"
                        : "We do not guarantee the complete accuracy of all third-party content"
                      }
                    </li>
                    <li>
                      {locale === "fr"
                        ? "L'accès au contenu est limité à votre usage personnel et non commercial"
                        : "Access to content is limited to your personal and non-commercial use"
                      }
                    </li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Subscriptions et Paiements" : "Subscriptions and Payments"}
                  </h4>
                  <p>
                    {locale === "fr"
                      ? "Les abonnements sont facturés selon les plans choisis. Les remboursements sont traités selon notre politique de remboursement disponible sur demande."
                      : "Subscriptions are billed according to chosen plans. Refunds are processed according to our refund policy available upon request."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prohibited Uses */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  {locale === "fr" ? "4. Utilisations Interdites" : "4. Prohibited Uses"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <p className="font-medium text-red-700">
                  {locale === "fr"
                    ? "Les activités suivantes sont strictement interdites:"
                    : "The following activities are strictly prohibited:"
                  }
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    {locale === "fr"
                      ? "Partage de compte ou d'informations d'identification"
                      : "Sharing account or login credentials"
                    }
                  </li>
                  <li>
                    {locale === "fr"
                      ? "Téléchargement ou redistribution non autorisés du contenu"
                      : "Unauthorized downloading or redistribution of content"
                    }
                  </li>
                  <li>
                    {locale === "fr"
                      ? "Utilisation de bots ou d'automatisation pour accéder aux services"
                      : "Use of bots or automation to access services"
                    }
                  </li>
                  <li>
                    {locale === "fr"
                      ? "Harcèlement, abus ou comportement inapproprié envers d'autres utilisateurs"
                      : "Harassment, abuse, or inappropriate behavior towards other users"
                    }
                  </li>
                  <li>
                    {locale === "fr"
                      ? "Tentative de contournement des mesures de sécurité"
                      : "Attempting to circumvent security measures"
                    }
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Intellectual Property */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  {locale === "fr" ? "5. Propriété Intellectuelle" : "5. Intellectual Property"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  {locale === "fr"
                    ? "Tout le contenu de ClassConnect, y compris les textes, graphiques, logos, icônes, images, clips audio, téléchargements numériques et logiciels, est la propriété de ClassConnect ou de ses fournisseurs de contenu et est protégé par les lois sur le droit d'auteur."
                    : "All content on ClassConnect, including text, graphics, logos, icons, images, audio clips, digital downloads, and software, is the property of ClassConnect or its content suppliers and is protected by copyright laws."
                  }
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>
                      {locale === "fr" ? "Licence d'Utilisation:" : "Usage License:"}
                    </strong>{" "}
                    {locale === "fr"
                      ? "Nous vous accordons une licence limitée, non exclusive et non transférable pour accéder et utiliser ClassConnect à des fins éducatives personnelles."
                      : "We grant you a limited, non-exclusive, and non-transferable license to access and use ClassConnect for personal educational purposes."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Termination */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  {locale === "fr" ? "6. Résiliation" : "6. Termination"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Résiliation par l'Utilisateur" : "User Termination"}
                  </h4>
                  <p>
                    {locale === "fr"
                      ? "Vous pouvez résilier votre compte à tout moment en nous contactant ou en utilisant les paramètres de votre compte."
                      : "You may terminate your account at any time by contacting us or using your account settings."
                    }
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">
                    {locale === "fr" ? "Résiliation par ClassConnect" : "ClassConnect Termination"}
                  </h4>
                  <p>
                    {locale === "fr"
                      ? "Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces conditions d'utilisation."
                      : "We reserve the right to suspend or terminate your account in case of violation of these Terms of Service."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Limitation of Liability */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  {locale === "fr" ? "7. Limitation de Responsabilité" : "7. Limitation of Liability"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    {locale === "fr"
                      ? "ClassConnect ne sera pas responsable des dommages indirects, accessoires, spéciaux ou consécutifs résultant de votre utilisation de nos services."
                      : "ClassConnect shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services."
                    }
                  </p>
                </div>
                <p>
                  {locale === "fr"
                    ? "Notre responsabilité totale ne dépassera pas le montant que vous avez payé pour nos services au cours des 12 derniers mois."
                    : "Our total liability shall not exceed the amount you have paid for our services in the past 12 months."
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={fadeIn}>
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  {locale === "fr" ? "8. Contact" : "8. Contact Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  {locale === "fr"
                    ? "Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter:"
                    : "For any questions regarding these Terms of Service, please contact us:"
                  }
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Mail className="w-4 h-4" />
                    <span>contact@classconnect.cm</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Phone className="w-4 h-4" />
                    <span>+237 XXX XXX XXX</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {locale === "fr"
                    ? "Nous nous efforçons de répondre à toutes les demandes dans les 48 heures."
                    : "We strive to respond to all inquiries within 48 hours."
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Governing Law */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-gray-600" />
                  {locale === "fr" ? "9. Droit Applicable" : "9. Governing Law"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 leading-relaxed">
                <p>
                  {locale === "fr"
                    ? "Ces conditions d'utilisation sont régies par les lois de la République du Cameroun. Tout différend sera soumis à la compétence exclusive des tribunaux camerounais."
                    : "These Terms of Service are governed by the laws of the Republic of Cameroon. Any disputes will be subject to the exclusive jurisdiction of Cameroonian courts."
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

export default TermsPage;