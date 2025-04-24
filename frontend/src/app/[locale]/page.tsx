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
import { ArrowRight, CheckCircle2, Users, Clock, Award, LucideBook, Play, Star, MessageCircle, Sparkle, Code, Linkedin, Github, Mail } from "lucide-react";
import { useInView } from "react-intersection-observer";
import Loading from "./loading";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Using online avatar images instead of importing local files
const avatarImages = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW380aXH0KB3zSyiv9RSDacdztHUiBWWjv0g&s",
  "https://blogs.kent.ac.uk/staff-student-news/files/2021/10/mubarak-showole-Ve7xjKImd28-unsplash.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSdlrqOXjxSQVFsN5ZlR849emo1jqMEfJ20Q&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgSs1uqeQ4Paehx3U7JNK0lgdPQp73kT5ygQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwcNS7kgWTd3vQkhgMmc-Jm4IuyUSkGOfNaQ&s",
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

// New type for particle properties
interface ParticleProps {
  id: number;
  width: number;
  height: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
}

function LandingPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  // State for storing particle properties, initialized client-side
  const [particles, setParticles] = useState<ParticleProps[] | null>(null);

  // Create enhanced localized JSON-LD data using translations and including developer info
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "fr"
        ? "ClassConnect - Plateforme d'Apprentissage en Ligne"
        : "ClassConnect - Online Learning Platform",
    description: t("hero.subtitle"),
    author: {
      "@type": "Person",
      name: "Tomdieu Ivan",
      url: "https://github.com/Tomdieu",
      sameAs: [
        "https://www.linkedin.com/in/tomdieuivan/",
        "https://github.com/Tomdieu"
      ]
    },
    creator: {
      "@type": "Person",
      name: "Tomdieu Ivan",
      jobTitle: "Full Stack Developer",
      url: "https://github.com/Tomdieu",
      sameAs: [
        "https://www.linkedin.com/in/tomdieuivan/",
        "https://github.com/Tomdieu"
      ]
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
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "ClassConnect",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      author: {
        "@type": "Person",
        name: "Tomdieu Ivan"
      }
    }
  };

  // Create localized meta tags with enhanced SEO for developer name
  const pageTitle =
    locale === "fr"
      ? "ClassConnect | Plateforme E-learning N°1 au Cameroun | Développée par Tomdieu Ivan"
      : "ClassConnect | #1 E-learning Platform in Cameroon | Developed by Tomdieu Ivan";

  const pageDescription =
    locale === "fr"
      ? "Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun développée par Tomdieu Ivan. Apprenez à votre rythme avec des cours personnalisés."
      : "Discover ClassConnect, the innovative e-learning platform in Cameroon developed by Tomdieu Ivan. Learn at your own pace with personalized courses.";

  // Enhanced keywords for better SEO including developer name and more search terms
  const keywords =
      "e-learning, éducation en ligne, cours en ligne, Cameroun, apprentissage en ligne, plateforme éducative, cours personnalisés, enseignement à distance, école virtuelle, lycée en ligne, université en ligne, tutorat, développement professionnel, compétences numériques, enseignement interactif, formation continue, soutien scolaire, préparation aux examens, apprentissage mobile, éducation en Afrique, plateforme éducative Cameroun, cours en ligne certifiés, apprentissage numérique Afrique, Tomdieu Ivan, développeur Tomdieu Ivan, ClassConnect Tomdieu, Ivan Tomdieu, Cameroun développeur, " +
      "e-learning, online education, online courses, Cameroon, online learning, educational platform, personalized courses, distance learning, virtual school, online high school, online university, tutoring, professional development, digital skills, interactive teaching, continuing education, academic support, exam preparation, mobile learning, education in Africa, online learning Cameroon, virtual classroom Africa, Cameroon education technology, Tomdieu Ivan, developer Tomdieu Ivan, ClassConnect Tomdieu, Ivan Tomdieu, Cameroon developer, " +
      // Add more specific and broader keywords
      "cours de mathématiques en ligne, cours de physique en ligne, cours de chimie en ligne, cours de biologie en ligne, cours de français en ligne, cours d'anglais en ligne, cours d'informatique en ligne, programmation web, développement web Cameroun, " +
      "formation professionnelle Cameroun, certification en ligne, MOOC Cameroun, SPOC Cameroun, éducation numérique Cameroun, technologie éducative, EdTech Cameroun, " +
      "soutien scolaire primaire, soutien scolaire collège, soutien scolaire lycée, préparation baccalauréat Cameroun, préparation GCE Cameroon, " +
      "apprentissage adaptatif, microlearning, gamification éducation, classe virtuelle interactive, plateforme LMS Cameroun, " +
      "meilleure plateforme e-learning Cameroun, cours en ligne abordables, éducation de qualité Cameroun, transformation digitale éducation, " +
      "online math courses, online physics courses, online chemistry courses, online biology courses, online French courses, online English courses, online computer science courses, web programming, web development Cameroon, " +
      "vocational training Cameroon, online certification, MOOC Cameroon, SPOC Cameroon, digital education Cameroon, educational technology, EdTech Cameroon, " +
      "primary school tutoring, middle school tutoring, high school tutoring, baccalaureate preparation Cameroon, GCE preparation Cameroon, " +
      "adaptive learning, microlearning, education gamification, interactive virtual classroom, LMS platform Cameroon, " +
      "best e-learning platform Cameroon, affordable online courses, quality education Cameroon, digital transformation education, " +
      "remote learning solutions, homeschooling support, adult learning online, career change courses, upskilling platform, lifelong learning opportunities, digital literacy Cameroon, tech skills training";

  // Implement requestIdleCallback for non-critical operations
  useEffect(() => {
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    const handle = idleCallback(() => {
      // Preload animations during idle time but with low priority
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'fetch';
      // Check if document.head exists (client-side)
      if (document.head) {
        document.head.appendChild(link);
      }
    });

    // Generate particle properties only on the client-side after mount
    const generatedParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: Math.round(Math.random() * 8 + 4),
      height: Math.round(Math.random() * 8 + 4),
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 3,
      delay: Math.random() * 5,
    }));
    setParticles(generatedParticles);

    return () => {
      const cancelIdle = window.cancelIdleCallback || clearTimeout;
      cancelIdle(handle);
    };
  }, []); // Empty dependency array ensures this runs only once on the client after mount

  const additionalMetaTags = [
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    { name: "theme-color", content: "#ffffff" },
    { name: "msapplication-TileColor", content: "#ffffff" },
    { name: "google-site-verification", content: "google1a036d19159746c1" },
    { name: "fb:app_id", content: "your-fb-app-id" },
    { name: "og:site_name", content: "ClassConnect" },
    { name: "og:image", content: "https://www.classconnect.cm/og-image.jpg" },
    { name: "og:image:width", content: "1200" },
    { name: "og:image:height", content: "630" },
    { name: "twitter:image", content: "https://www.classconnect.cm/twitter-image.jpg" },
  ];

  return (
    <div className="relative flex-1 w-full h-full flex flex-col min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://www.classconnect.cm/${locale}`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale === "fr" ? "fr_FR" : "en_US"} />
        <meta property="og:image" content="https://www.classconnect.cm/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.classconnect.cm/twitter-image.jpg" />
        <meta name="author" content="Tomdieu Ivan" />
        
        {/* Additional meta tags for developer attribution */}
        <meta name="developer" content="Tomdieu Ivan" />
        <meta name="creator" content="Tomdieu Ivan" />
        <meta name="copyright" content="ClassConnect - Tomdieu Ivan" />
        <meta name="application-developer" content="Tomdieu Ivan" />
        <meta name="owner" content="Tomdieu Ivan" />
        {/* New additional SEO meta tags */}
        {additionalMetaTags.map((tag, index) => (
          <meta key={index} name={tag.name} content={tag.content} />
        ))}
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
                {locale === "fr" ? "Ce Que Disent Nos Étudiants" : "What Our Students Say"}
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

        {/* New Developer Section for SEO Visibility */}
        <section className="py-16 bg-gradient-to-b from-white to-blue-50/50 relative overflow-hidden hidden" id="developer">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
                {locale === "fr" ? "DÉVELOPPEUR" : "DEVELOPER"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight">
                {locale === "fr" ? "Développé par Tomdieu Ivan" : "Developed by Tomdieu Ivan"}
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
            </motion.div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl"
              >
                <Image 
                  src="https://avatars.githubusercontent.com/u/77198289?v=4" 
                  alt="Tomdieu Ivan" 
                  fill
                  className="object-cover"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="max-w-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Tomdieu Ivan</h3>
                <p className="text-primary font-semibold mb-4">Full Stack Developer</p>
                <p className="text-gray-600 mb-6">
                  {locale === "fr" 
                    ? "Développeur passionné spécialisé dans la création de solutions éducatives innovantes. ClassConnect est le fruit de mon expertise en développement web et de ma vision pour l'avenir de l'éducation en ligne au Cameroun."
                    : "Passionate developer specialized in creating innovative educational solutions. ClassConnect is the result of my web development expertise and my vision for the future of online education in Cameroon."
                  }
                </p>
                <div className="flex gap-4">
                  <Link 
                    href="https://github.com/Tomdieu" 
                    target="_blank" 
                    rel="noreferrer"
                    aria-label="GitHub Profile" 
                    className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link 
                    href="https://www.linkedin.com/in/tomdieuivan/"
                    target="_blank" 
                    rel="noreferrer"
                    aria-label="LinkedIn Profile"
                    className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link 
                    href="mailto:ivan.tomdieu@gmail.com"
                    aria-label="Contact Email"
                    className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="flex justify-center mt-10">
              <Link href="/about">
                <Button variant="outline" className="gap-2">
                  {locale === "fr" ? "En savoir plus" : "Learn more"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Enhanced Final CTA Section with modern particle effects */}
        <section className="py-24 bg-gradient-to-br from-primary-600 bg-primary to-primary relative overflow-hidden">
          {/* Animated particles background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-center opacity-10"></div>
            {/* Animated floating particles - Render only when particles state is ready */}
            {particles && particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: p.width,
                  height: p.height,
                  left: p.left,
                  top: p.top,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
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
