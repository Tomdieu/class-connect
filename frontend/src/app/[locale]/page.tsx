"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";
import { LottieWrapper } from "@/components/ui/lottie-wrapper";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { useCurrentLocale, useI18n } from "@/locales/client";
import React, { useState, useEffect, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Clock, Award, LucideBook, Play, Star, MessageCircle, Sparkle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import Loading from "./loading";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Using online avatar images instead of importing local files
const avatarImages = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/86.jpg",
  "https://randomuser.me/api/portraits/women/22.jpg",
];

// Dynamic imports for animations to prevent them from blocking
const studentAnimationLoader = () => import("@/animations/student-learning.json");
const teachingAnimationLoader = () => import("@/animations/teaching.json");
const learningAnimationLoader = () => import("@/animations/learning-process.json");

// Expanded feature list with corresponding icons
const features = [
  { 
    id: 'personalized',
    icon: <Users className="h-8 w-8" />,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
  },
  { 
    id: 'interactive',
    icon: <Play className="h-8 w-8" />,
    color: "bg-gradient-to-br from-sky-500 to-sky-600"
  },
  { 
    id: 'expert',
    icon: <Star className="h-8 w-8" />,
    color: "bg-gradient-to-br from-amber-500 to-amber-600"
  },
  { 
    id: 'community',
    icon: <MessageCircle className="h-8 w-8" />,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
  }
];

// Skeleton components with enhanced design
const TestimonialSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 rounded-full bg-gray-200"></div>
      <div>
        <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center border border-gray-100 animate-pulse">
    <div className="p-5 rounded-full bg-gray-200 mb-4 w-20 h-20"></div>
    <div className="h-9 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-5 bg-gray-200 rounded w-36"></div>
  </div>
);

type LottieLoader = () => Promise<any>;

const useLazyLottie = (loader: LottieLoader) => {
  const [animation, setAnimation] = useState(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Load when within 200px of viewport
  });
  
  useEffect(() => {
    if (inView && !animation) {
      loader().then(loadedAnimation => {
        setAnimation(loadedAnimation.default || loadedAnimation);
      });
    }
  }, [inView, animation, loader]);
  
  return [ref, animation];
};

interface OptimizedLottieProps {
  loader: LottieLoader;
  className?: string;
}

const OptimizedLottie = ({ loader, className = "" }: OptimizedLottieProps) => {
  const [ref, animation] = useLazyLottie(loader);
  
  return (
    <div ref={ref} className={`relative w-72 h-72 mb-6 ${className}`}>
      {animation ? (
        <LottieWrapper animation={animation} className="pointer-events-none select-none" />
      ) : (
        <div className="w-full h-full rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

// Enhanced floating CTA button with attention-grabbing animation
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
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <motion.span 
            className="absolute -inset-3 rounded-full bg-primary/20 blur-sm"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          ></motion.span>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl flex items-center gap-2 px-6 py-6 border-2 border-white/40 relative"
          >
            <Sparkle className="h-5 w-5 mr-1 text-yellow-200" />
            {t("hero.start")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  );
};

// Enhanced testimonial card with better visuals and animations
interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating?: number;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  quote,
  avatarUrl,
  rating = 5,
  delay = 0,
}) => {
  return (
    <RevealOnScroll direction="up" delay={delay}>
      <motion.div
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary/10 relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary"></div>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/10"></div>
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
            <Suspense fallback={<div className="w-16 h-16 rounded-full bg-gray-200"></div>}>
              <Image
                src={avatarUrl}
                alt={name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </Suspense>
          </div>
          <div>
            <h4 className="font-bold text-xl text-gray-900">{name}</h4>
            <p className="text-gray-600 text-sm">{role}</p>
            <div className="flex mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i}
                  fill={i < rating ? "currentColor" : "none"}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < rating ? "text-amber-500" : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-700 italic relative z-10 font-medium">&ldquo;{quote}&rdquo;</p>
      </motion.div>
    </RevealOnScroll>
  );
};

// Enhanced stat card with dynamic colors and animations
interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  delay?: number;
  gradient?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  delay = 0,
  gradient = "bg-gradient-to-br from-primary-500 to-primary-600",
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      whileHover={{ scale: 1.05, translateY: -8 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center border border-primary/10 overflow-hidden relative group"
    >
      <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-primary/10 transition-all duration-500 group-hover:scale-150"></div>
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5 transition-all duration-700 group-hover:scale-150"></div>
      
      <div className={`p-5 rounded-full ${gradient} text-white mb-5 shadow-lg relative z-10`}>
        {icon}
      </div>
      <h3 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight relative z-10">
        {inView ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {value}
          </motion.span>
        ) : (
          value
        )}
      </h3>
      <p className="text-gray-600 font-medium relative z-10">{label}</p>
    </motion.div>
  );
};

// New Feature Card component with enhanced design
interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  color,
  title,
  description,
  delay = 0
}) => {
  return (
    <RevealOnScroll direction="up" delay={delay}>
      <motion.div
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="flex flex-col bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-primary/10 overflow-hidden relative group"
      >
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-150"></div>
        
        <div className={`${color} text-white p-4 rounded-2xl shadow-lg w-16 h-16 flex items-center justify-center mb-5 relative z-10`}>
          {icon}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">{title}</h3>
        <p className="text-gray-600 leading-relaxed relative z-10">{description}</p>
      </motion.div>
    </RevealOnScroll>
  );
};

// New CountUpNumber component for animated statistics
interface CountUpNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

const CountUpNumber: React.FC<CountUpNumberProps> = ({ value, suffix = "", duration = 1.5 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const step = value / (duration * 60); // For 60fps over duration seconds
      
      const timer = setInterval(() => {
        start = Math.min(start + step, value);
        setCount(Math.floor(start));
        
        if (start >= value) {
          clearInterval(timer);
        }
      }, 1000 / 60);
      
      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{inView ? count : 0}{suffix}</span>;
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

  // Implement requestIdleCallback for non-critical operations
  useEffect(() => {
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    
    const handle = idleCallback(() => {
      // Preload animations during idle time but with low priority
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'fetch';
      document.head.appendChild(link);
    });
    
    return () => {
      const cancelIdle = window.cancelIdleCallback || clearTimeout;
      cancelIdle(handle);
    };
  }, []);

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

      <Header className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 sticky top-0 z-50" />

      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <div className="hero-container">
            <Hero />
          </div>
        </Suspense>

        {/* Enhanced Features Section with beautiful gradients */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white via-blue-50/50 to-white relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
                {locale === "fr" ? "POURQUOI NOUS CHOISIR" : "WHY CHOOSE US"}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                {t("features.title")}
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {locale === "fr"
                  ? "Notre plateforme innovante combine technologie et pédagogie pour offrir une expérience d'apprentissage exceptionnelle"
                  : "Our innovative platform combines technology and pedagogy to deliver an exceptional learning experience"}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Users className="h-7 w-7" />}
                color="bg-gradient-to-r from-primary to-primary-600"
                title={locale === "fr" ? "Apprentissage Personnalisé" : "Personalized Learning"}
                description={locale === "fr" 
                  ? "Contenu adapté à votre niveau et vos objectifs pour des progrès optimaux"
                  : "Content tailored to your level and goals for optimal progress"}
                delay={0.1}
              />
              
              <FeatureCard
                icon={<Play className="h-7 w-7" />}
                color="bg-gradient-to-r from-sky-500 to-blue-600"
                title={locale === "fr" ? "Cours Interactifs" : "Interactive Courses"}
                description={locale === "fr"
                  ? "Des vidéos, quiz et exercices pratiques qui rendent l'apprentissage captivant"
                  : "Videos, quizzes and practical exercises that make learning engaging"}
                delay={0.2}
              />
              
              <FeatureCard
                icon={<Star className="h-7 w-7" />}
                color="bg-gradient-to-r from-amber-500 to-orange-600"
                title={locale === "fr" ? "Experts Qualifiés" : "Qualified Experts"}
                description={locale === "fr"
                  ? "Enseignants expérimentés dédiés à votre réussite académique"
                  : "Experienced teachers dedicated to your academic success"}
                delay={0.3}
              />
              
              <FeatureCard
                icon={<MessageCircle className="h-7 w-7" />}
                color="bg-gradient-to-r from-emerald-500 to-green-600"
                title={locale === "fr" ? "Communauté Active" : "Active Community"}
                description={locale === "fr"
                  ? "Échangez avec d'autres étudiants et enseignants pour un apprentissage collaboratif"
                  : "Engage with other students and teachers for collaborative learning"}
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Animated Learning Process Section */}
        <section className="py-24 bg-gradient-to-b from-white to-blue-50/70 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-blue-50/70 to-transparent"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
                {locale === "fr" ? "NOTRE APPROCHE" : "OUR APPROACH"}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                {locale === "fr" ? "Comment Nous Enseignons" : "How We Teach"}
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {locale === "fr"
                  ? "Notre méthode pédagogique combine technologie et expertise humaine pour des résultats exceptionnels"
                  : "Our teaching method combines technology and human expertise for exceptional results"}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-1 order-2 lg:order-1">
                <RevealOnScroll direction="left">
                  <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary-600 to-primary"></div>
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full transition-all duration-500 group-hover:scale-150"></div>
                      
                      <h3 className="text-xl font-bold mb-3 pl-4 relative">
                        <span className="absolute left-0 top-2 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">1</span>
                        <span>{locale === "fr" ? "Évaluation Initiale" : "Initial Assessment"}</span>
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {locale === "fr" 
                          ? "Nous identifions votre niveau et vos besoins d'apprentissage spécifiques"
                          : "We identify your level and specific learning needs"}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-sky-600 to-sky-500"></div>
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-sky-500/5 rounded-full transition-all duration-500 group-hover:scale-150"></div>
                      
                      <h3 className="text-xl font-bold mb-3 pl-4 relative">
                        <span className="absolute left-0 top-2 h-5 w-5 rounded-full bg-sky-500/20 flex items-center justify-center text-sm font-bold text-sky-600">2</span>
                        <span>{locale === "fr" ? "Parcours Personnalisé" : "Personalized Path"}</span>
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {locale === "fr" 
                          ? "Nous créons un parcours d'apprentissage adapté à vos objectifs"
                          : "We create a learning path tailored to your goals"}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-amber-600 to-amber-500"></div>
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/5 rounded-full transition-all duration-500 group-hover:scale-150"></div>
                      
                      <h3 className="text-xl font-bold mb-3 pl-4 relative">
                        <span className="absolute left-0 top-2 h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600">3</span>
                        <span>{locale === "fr" ? "Suivi Continu" : "Continuous Monitoring"}</span>
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {locale === "fr" 
                          ? "Nous suivons vos progrès et adaptons votre apprentissage en conséquence"
                          : "We track your progress and adapt your learning accordingly"}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
              
              <div className="lg:col-span-2 order-1 lg:order-2 flex justify-center mb-10 lg:mb-0">
                <RevealOnScroll direction="right">
                  <motion.div
                    whileHover={{ y: -15 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="relative w-full max-w-xl"
                  >
                    <div className="absolute -top-6 -left-6 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-indigo-100/30 overflow-hidden p-6">
                      <OptimizedLottie 
                        loader={teachingAnimationLoader} 
                        className="w-[400px] h-[400px] mx-auto"
                      />
                    </div>
                  </motion.div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section with beautiful gradients and animated counters */}
        <section className="py-20 bg-gradient-to-b from-blue-50/70 to-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50/70 to-transparent"></div>
          <div className="absolute top-40 left-60 w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-10 right-40 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
                {locale === "fr" ? "NOTRE IMPACT" : "OUR IMPACT"}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                {locale === "fr" ? "En Chiffres" : "By The Numbers"}
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<Users className="h-8 w-8" />}
                  value={<CountUpNumber value={5000} suffix="+" />}
                  label={locale === "fr" ? "Étudiants Actifs" : "Active Students"}
                  delay={0.1}
                  gradient="bg-gradient-to-br from-primary to-primary-600"
                />
              </Suspense>
              
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<LucideBook className="h-8 w-8" />}
                  value={<CountUpNumber value={350} suffix="+" />}
                  label={locale === "fr" ? "Cours de Qualité" : "Quality Courses"}
                  delay={0.2}
                  gradient="bg-gradient-to-br from-sky-500 to-blue-600"
                />
              </Suspense>
              
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<CheckCircle2 className="h-8 w-8" />}
                  value={<CountUpNumber value={98} suffix="%" />}
                  label={
                    locale === "fr" ? "Taux de Satisfaction" : "Satisfaction Rate"
                  }
                  delay={0.3}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                />
              </Suspense>
              
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<Clock className="h-8 w-8" />}
                  value="24/7"
                  label={
                    locale === "fr" ? "Support Disponible" : "Available Support"
                  }
                  delay={0.4}
                  gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="py-24 bg-gradient-to-b from-white to-blue-50/80 relative">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
                {locale === "fr" ? "TÉMOIGNAGES" : "TESTIMONIALS"}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                {locale === "fr"
                  ? "Ce Que Disent Nos Étudiants"
                  : "What Our Students Say"}
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {locale === "fr"
                  ? "Découvrez comment ClassConnect transforme l'expérience d'apprentissage de nos étudiants"
                  : "Discover how ClassConnect transforms our students' learning experience"}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Suspense fallback={<TestimonialSkeleton />}>
                <TestimonialCard
                  name="Sarah K."
                  role={
                    locale === "fr"
                      ? "Étudiante en Terminale"
                      : "High School Senior"
                  }
                  quote={
                    locale === "fr"
                      ? "ClassConnect a transformé ma façon d'apprendre. J'ai amélioré mes notes en mathématiques de façon spectaculaire et j'ai gagné en confiance. Les cours sont clairs et les enseignants vraiment investis!"
                      : "ClassConnect transformed how I learn. I dramatically improved my math grades and gained confidence. The lessons are clear and the teachers truly invested!"
                  }
                  avatarUrl={avatarImages[0]}
                  delay={0.1}
                  rating={5}
                />
              </Suspense>
              
              <Suspense fallback={<TestimonialSkeleton />}>
                <TestimonialCard
                  name="Jean M."
                  role={
                    locale === "fr"
                      ? "Étudiant Universitaire"
                      : "University Student"
                  }
                  quote={
                    locale === "fr"
                      ? "La flexibilité de ClassConnect est incroyable. Je peux étudier à mon rythme tout en travaillant à temps partiel. Les enseignants sont extrêmement qualifiés et toujours disponibles pour répondre à mes questions."
                      : "The flexibility of ClassConnect is incredible. I can study at my own pace while working part-time. The teachers are extremely qualified and always available to answer my questions."
                  }
                  avatarUrl={avatarImages[1]}
                  delay={0.2}
                  rating={5}
                />
              </Suspense>
              
              <Suspense fallback={<TestimonialSkeleton />}>
                <TestimonialCard
                  name="Amina L."
                  role={
                    locale === "fr" ? "Professionnelle en reconversion" : "Career Changer"
                  }
                  quote={
                    locale === "fr"
                      ? "Grâce à ClassConnect, j'ai pu me reconvertir dans le domaine du numérique. La qualité des cours et le soutien personnalisé m'ont permis d'acquérir rapidement les compétences dont j'avais besoin pour ma nouvelle carrière."
                      : "Thanks to ClassConnect, I was able to transition into the digital field. The quality of courses and personalized support helped me quickly acquire the skills I needed for my new career."
                  }
                  avatarUrl={avatarImages[4]}
                  delay={0.3}
                  rating={5}
                />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Enhanced Subscription Plans Section */}
        <Suspense fallback={
          <div className="py-24 bg-blue-50">
            <div className="container mx-auto px-4 animate-pulse">
              <div className="text-center mb-16">
                <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-8 shadow-md">
                    <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded w-40 mb-6"></div>
                    <div className="space-y-3 mb-8">
                      {[1, 2, 3, 4].map(j => (
                        <div key={j} className="h-5 bg-gray-200 rounded w-full"></div>
                      ))}
                    </div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }>
          <SubscriptionPlans />
        </Suspense>

        {/* Enhanced Final CTA Section with modern particle effects */}
        <section className="py-24 bg-gradient-to-br from-primary-600 bg-primary to-primary relative overflow-hidden">
          {/* Animated particles background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-center opacity-10"></div>
            
            {/* Animated floating particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: Math.round(Math.random() * 8 + 4),
                  height: Math.round(Math.random() * 8 + 4),
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
          
          {/* Decorative blurred circles */}
          {/* <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
           */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-white/90 font-semibold tracking-wider uppercase mb-4 bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm"
              >
                {locale === "fr" ? "COMMENCEZ MAINTENANT" : "START NOW"}
              </motion.span>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
              >
                {locale === "fr"
                  ? "Prêt à transformer votre façon d'apprendre ?"
                  : "Ready to transform your learning experience?"}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-xl text-white/90 mb-10 leading-relaxed"
              >
                {locale === "fr"
                  ? "Rejoignez des milliers d'étudiants qui ont déjà révolutionné leur apprentissage avec ClassConnect. Votre succès commence maintenant."
                  : "Join thousands of students who have already revolutionized their learning with ClassConnect. Your success starts now."}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Enhanced glow effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -inset-5 rounded-full bg-white/30 blur-xl"
                ></motion.div>
                
                <Link href="/auth/register">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 rounded-xl px-10 py-7 text-xl font-bold shadow-2xl border border-white/20 backdrop-blur-sm"
                    >
                      <Sparkle className="h-5 w-5 mr-2 text-amber-500" />
                      {locale === "fr"
                        ? "Commencer Maintenant"
                        : "Start now"}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
              
              {/* Social proof elements */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="mt-12 flex flex-col gap-4 items-center"
              >
                <p className="text-sm text-white/80">
                  {locale === "fr"
                    ? "Rejoignez plus de 5,000 étudiants satisfaits"
                    : "Join over 5,000 satisfied students"}
                </p>
                
                <div className="flex -space-x-2 overflow-hidden">
                  {avatarImages.map((avatar, index) => (
                    <Image 
                      key={index}
                      src={avatar} 
                      alt="Student Avatar" 
                      width={32}
                      height={32}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-400 text-xs font-medium text-white ring-2 ring-white">
                    +99
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-white/90">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm">4.9/5 ({locale === 'fr' ? 'Plus de 500 avis' : 'Over 500 reviews'})</span>
                </div>
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
