"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";
import { LottieWrapper } from "@/components/ui/lottie-wrapper";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { useCurrentLocale, useI18n } from "@/locales/client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Clock, Award } from "lucide-react";

// Import your animations
import studentAnimation from "@/animations/student-learning.json";
import teachingAnimation from "@/animations/teaching.json";
import learningAnimation from "@/animations/learning-process.json";
import Link from "next/link";

// Using online avatar images instead of importing local files
const avatarImages = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

// Component for the floating CTA button
const FloatingCTA: React.FC = () => {
  const t = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setVisible(scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 100 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link href="/auth/register">
        <Button
          size="lg"
          className="bg-default hover:bg-default/90 text-white rounded-full shadow-lg flex items-center gap-2 px-6 py-6"
        >
          {t("hero.start")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
  );
};

// Testimonial card component with online avatar
interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, quote, avatarUrl, delay = 0 }) => {
  return (
    <RevealOnScroll direction="up" delay={delay}>
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt={name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-900">{name}</h4>
            <p className="text-gray-500 text-sm">{role}</p>
          </div>
        </div>
        <p className="text-gray-700 italic">&ldquo;{quote}&rdquo;</p>
      </motion.div>
    </RevealOnScroll>
  );
};

// Stat card component
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, delay = 0 }) => {
  return (
    <RevealOnScroll direction="up" delay={delay}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-100"
      >
        <div className="p-4 rounded-full bg-blue-50 text-default mb-4">
          {icon}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        <p className="text-gray-600">{label}</p>
      </motion.div>
    </RevealOnScroll>
  );
};

function LandingPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  // Create localized JSON-LD data using translations
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "fr"
        ? "ClassConnect - Plateforme d'Apprentissage en Ligne"
        : "ClassConnect - Online Learning Platform",
    description: t("hero.subtitle"),
    provider: {
      "@type": "Organization",
      name: "ClassConnect",
      sameAs: ["https://www.classconnect.cm"],
    },
    offers: {
      "@type": "AggregateOffer",
      offers: [
        {
          "@type": "Offer",
          name: t("subscriptionPlans.basic.name"),
          description: t("subscriptionPlans.basic.description"),
          availableLanguage: [locale === "fr" ? "French" : "English"],
        },
        {
          "@type": "Offer",
          name: t("subscriptionPlans.standard.name"),
          description: t("subscriptionPlans.standard.description"),
          availableLanguage: [locale === "fr" ? "French" : "English"],
        },
        {
          "@type": "Offer",
          name: t("subscriptionPlans.premium.name"),
          description: t("subscriptionPlans.premium.description"),
          availableLanguage: [locale === "fr" ? "French" : "English"],
        },
      ],
    },
    inLanguage: locale === "fr" ? "fr" : "en",
  };

  // Create localized meta tags
  const pageTitle =
    locale === "fr"
      ? "ClassConnect | Plateforme E-learning N°1 au Cameroun"
      : "ClassConnect | #1 E-learning Platform in Cameroon";

  const pageDescription =
    locale === "fr"
      ? "Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun. Apprenez à votre rythme avec des cours personnalisés."
      : "Discover ClassConnect, the innovative e-learning platform in Cameroon. Learn at your own pace with personalized courses.";

  // Enhanced keywords for better SEO
  const keywords =
    locale === "fr"
      ? "e-learning, éducation en ligne, cours en ligne, Cameroun, apprentissage en ligne, plateforme éducative, cours personnalisés, enseignement à distance, école virtuelle, lycée en ligne, université en ligne, tutorat, développement professionnel, compétences numériques, enseignement interactif, formation continue, soutien scolaire, préparation aux examens, apprentissage mobile, éducation en Afrique, plateforme éducative Cameroun, cours en ligne certifiés, apprentissage numérique Afrique, préparation baccalauréat en ligne, enseignement secondaire virtuel, ressources pédagogiques digitales, formation professionnelle en ligne, système éducatif camerounais, cours de remise à niveau, pédagogie interactive, enseignement supérieur à distance, exercices corrigés en ligne, suivi académique personnalisé, technologie éducative innovante, apprentissage adaptatif, préparation concours Cameroun, tutorat en ligne francophone, éducation inclusive numérique, méthodologie d'apprentissage, réussite scolaire garantie"
      : "e-learning, online education, online courses, Cameroon, online learning, educational platform, personalized courses, distance learning, virtual school, online high school, online university, tutoring, professional development, digital skills, interactive teaching, continuing education, academic support, exam preparation, mobile learning, education in Africa, online learning Cameroon, virtual classroom Africa, Cameroon education technology, affordable e-learning Africa, interactive online courses, certified digital courses, STEM education online, GCE A-Level courses, flexible learning schedules, academic support Cameroon, career-focused courses, mobile-friendly learning, Cameroon curriculum alignment, expert-led webinars, 24/7 course access, educational subscription service, digital skills Cameroon, professional certification prep, adaptive learning technology, Cameroon student success stories";

  return (
    <div className="relative flex-1 w-full h-full flex flex-col min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta
          property="og:url"
          content={`https://www.classconnect.cm/${locale}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:locale"
          content={locale === "fr" ? "fr_FR" : "en_US"}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="author" content="ClassConnect" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1">
        <Hero />

        {/* Animated Features Section */}
        <section className="py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("features.title")}
              </h2>
              <div className="w-24 h-1 bg-default mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <RevealOnScroll direction="up" delay={0.2}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100"
                >
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper
                      animation={studentAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("animatedFeatures.selfPaced.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("animatedFeatures.selfPaced.description")}
                    </p>
                  </div>
                </motion.div>
              </RevealOnScroll>

              {/* Feature 2 */}
              <RevealOnScroll direction="up" delay={0.4}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100"
                >
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper
                      animation={teachingAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("animatedFeatures.experts.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("animatedFeatures.experts.description")}
                    </p>
                  </div>
                </motion.div>
              </RevealOnScroll>

              {/* Feature 3 */}
              <RevealOnScroll direction="up" delay={0.6}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100"
                >
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper
                      animation={learningAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("animatedFeatures.interactive.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("animatedFeatures.interactive.description")}
                    </p>
                  </div>
                </motion.div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {locale === "fr" ? "Pourquoi Nous Choisir" : "Why Choose Us"}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {locale === "fr"
                  ? "ClassConnect offre une expérience d'apprentissage unique adaptée à vos besoins"
                  : "ClassConnect offers a unique learning experience tailored to your needs"}
              </p>
              <div className="w-24 h-1 bg-default mx-auto mt-4 rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard
                icon={<Users className="h-8 w-8" />}
                value="500+"
                label={locale === "fr" ? "Étudiants Actifs" : "Active Students"}
                delay={0.1}
              />
              <StatCard
                icon={<Award className="h-8 w-8" />}
                value="150+"
                label={locale === "fr" ? "Cours de Qualité" : "Quality Courses"}
                delay={0.2}
              />
              <StatCard
                icon={<CheckCircle2 className="h-8 w-8" />}
                value="98%"
                label={
                  locale === "fr" ? "Taux de Satisfaction" : "Satisfaction Rate"
                }
                delay={0.3}
              />
              <StatCard
                icon={<Clock className="h-8 w-8" />}
                value="24/7"
                label={
                  locale === "fr" ? "Support Disponible" : "Available Support"
                }
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {locale === "fr"
                  ? "Ce Que Disent Nos Étudiants"
                  : "What Our Students Say"}
              </h2>
              <div className="w-24 h-1 bg-default mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                name="Sarah K."
                role={
                  locale === "fr"
                    ? "Étudiante en Terminale"
                    : "High School Senior"
                }
                quote={
                  locale === "fr"
                    ? "ClassConnect m'a aidée à améliorer mes notes en mathématiques. Les cours sont clairs et faciles à suivre!"
                    : "ClassConnect helped me improve my math grades. The lessons are clear and easy to follow!"
                }
                avatarUrl={avatarImages[0]}
                delay={0.1}
              />
              <TestimonialCard
                name="Jean M."
                role={
                  locale === "fr"
                    ? "Étudiant Universitaire"
                    : "University Student"
                }
                quote={
                  locale === "fr"
                    ? "J'adore pouvoir étudier à mon propre rythme. Les enseignants sont très qualifiés et toujours prêts à aider."
                    : "I love being able to study at my own pace. The teachers are highly qualified and always ready to help."
                }
                avatarUrl={avatarImages[1]}
                delay={0.2}
              />
              <TestimonialCard
                name="Daniel F."
                role={
                  locale === "fr" ? "Élève de 3ème" : "Middle School Student"
                }
                quote={
                  locale === "fr"
                    ? "Les vidéos interactives et les exercices m'ont aidé à mieux comprendre des sujets difficiles. Merci ClassConnect!"
                    : "The interactive videos and exercises helped me better understand difficult subjects. Thank you ClassConnect!"
                }
                avatarUrl={avatarImages[2]}
                delay={0.3}
              />
            </div>

            {/* <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button 
                size="lg" 
                className="bg-default hover:bg-default/90 text-white rounded-xl px-8 py-6 text-lg"
              >
                {locale === "fr" ? "Voir Plus de Témoignages" : "See More Testimonials"}
              </Button>
            </motion.div> */}
          </div>
        </section>

        {/* Enhanced Subscription Plans Section */}
        <SubscriptionPlans />

        {/* Final CTA Section */}
        <section className="py-16 bg-default text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                {locale === "fr"
                  ? "Prêt à transformer votre apprentissage ?"
                  : "Ready to transform your learning?"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl mb-8 max-w-2xl"
              >
                {locale === "fr"
                  ? "Commencez votre voyage avec ClassConnect aujourd'hui et découvrez une nouvelle façon d'apprendre."
                  : "Start your journey with ClassConnect today and discover a new way to learn."}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-white text-default hover:bg-gray-100 rounded-xl px-10 py-7 text-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    {locale === "fr"
                      ? "Commencer Gratuitement"
                      : "Start for Free"}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default LandingPage;
