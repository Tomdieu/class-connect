"use client";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { useEffect, useState } from "react";
import { getSubscriptionPlanByIdorSlug } from "@/actions/payments";
import { SubscriptionPlan } from "@/types";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export const SubscriptionPlans = () => {
  const t = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  const { openLogin } = useAuthDialog();
  
  // State for fetched plan data
  const [planData, setPlanData] = useState<Record<string, SubscriptionPlan | null>>({
    basic: null,
    standard: null,
    premium: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(1); // Default to standard plan

  // Animation variants
  const cardVariants = {
    selected: {
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    notSelected: {
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  // Fetch plan data on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        // Fetch plans in parallel
        const results = await Promise.allSettled([
          getSubscriptionPlanByIdorSlug("basic"),
          getSubscriptionPlanByIdorSlug("standard"),
          getSubscriptionPlanByIdorSlug("premium"),
        ]);
        
        const newPlanData: Record<string, SubscriptionPlan | null> = {
          basic: null,
          standard: null,
          premium: null,
        };
        
        // Process results
        if (results[0].status === 'fulfilled') newPlanData.basic = results[0].value;
        if (results[1].status === 'fulfilled') newPlanData.standard = results[1].value;
        if (results[2].status === 'fulfilled') newPlanData.premium = results[2].value;
        
        setPlanData(newPlanData);
      } catch (err) {
        console.error("Failed to fetch plan data:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  const handleSubscribe = (planType: "basic" | "standard" | "premium", index: number) => {
    setSelectedPlanIndex(index);
    
    // Add a small delay to show the animation before navigating
    setTimeout(() => {
      if (!session?.user) {
        router.replace("/");
        openLogin();
        return;
      }
      router.push(`/subscribe/${planType}`);
    }, 300);
  };

  const plans = [
    {
      name: t("subscriptionPlans.basic.name"),
      description: t("subscriptionPlans.basic.description"),
      features: [
        t("subscriptionPlans.basic.features.0"),
        t("subscriptionPlans.basic.features.1"),
        t("subscriptionPlans.basic.features.2"),
      ],
      // Use fetched price if available, otherwise fall back to default
      price: planData.basic ? Math.floor(planData.basic.price).toLocaleString() : "5,000",
      period: "month",
      gradient: "from-blue-50 to-blue-100/50",
      popular: false,
      keyName:"basic",
      badgeText: "",
    },
    {
      name: t("subscriptionPlans.standard.name"),
      description: t("subscriptionPlans.standard.description"),
      features: [
        t("subscriptionPlans.standard.features.0"),
        t("subscriptionPlans.standard.features.1"),
        t("subscriptionPlans.standard.features.2"),
        t("subscriptionPlans.standard.features.3"),
      ],
      // Use fetched price if available, otherwise fall back to default
      price: planData.standard ? Math.floor(planData.standard.price).toLocaleString() : "10,000",
      period: "month",
      gradient: "from-blue-100 to-blue-200/50",
      popular: true,
      keyName:"standard",
      badgeText: "Most Popular",
    },
    {
      name: t("subscriptionPlans.premium.name"),
      description: t("subscriptionPlans.premium.description"),
      features: [
        t("subscriptionPlans.premium.features.0"),
        t("subscriptionPlans.premium.features.1"),
        t("subscriptionPlans.premium.features.2"),
        t("subscriptionPlans.premium.features.3"),
        t("subscriptionPlans.premium.features.4"),
      ],
      // Use fetched price if available, otherwise fall back to default
      price: planData.premium ? Math.floor(planData.premium.price).toLocaleString() : "15,000",
      period: "month",
      gradient: "from-blue-200 to-blue-300/50",
      popular: false,
      keyName:"premium",
      badgeText: "Best Value",
    },
  ];

  // Features that standard and premium have, but basic doesn't
  const basicMissingFeatures = [
    "Weekly Q&A sessions",
    "Resource downloads",
    "Unlimited video sessions",
    "Priority support",
    "Exclusive content",
  ];

  return (
    <div className="py-24 relative overflow-hidden" id="pricing">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-200/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-purple-100/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("subscriptionPlans.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            {t("subscriptionPlans.subtitle")}
          </p>
          <div className="w-24 h-1 bg-default mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              variants={cardVariants}
              animate={selectedPlanIndex === index ? "selected" : "notSelected"}
              whileHover={{ y: -10 }}
              className="h-full"
            >
              <Card
                className={`relative flex flex-col h-full border-0 shadow-lg backdrop-blur-sm bg-gradient-to-br ${
                  plan.gradient
                } ${plan.popular ? "" : ""}`}
              >
                {plan.badgeText && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant={index === 1 ? "default" : "secondary"} className={`px-4 py-1 text-sm font-medium flex items-center gap-1 ${index === 1 ? 'bg-default text-white' : 'bg-purple-600 text-white'}`}>
                      {index === 1 && <Sparkles className="h-4 w-4" />}
                      {plan.badgeText}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-10">
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price} FCFA
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow px-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-1 text-default">
                          <Check className="h-5 w-5 text-default" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    
                    {/* Show what's missing for the basic plan */}
                    {index === 0 && basicMissingFeatures.map((feature, i) => (
                      <li key={`missing-${i}`} className="flex items-start gap-3 opacity-50">
                        <div className="flex-shrink-0 pt-1">
                          <X className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pb-8 px-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Button
                      className={`w-full h-12 text-lg font-medium rounded-xl transition-all duration-300 ${
                        plan.popular || selectedPlanIndex === index
                          ? "bg-default hover:bg-default/90 text-white"
                          : "bg-white hover:bg-gray-50 text-default border-2 border-default"
                      }`}
                      onClick={() =>
                        handleSubscribe(
                          plan.keyName.toLowerCase() as
                            | "basic"
                            | "standard"
                            | "premium",
                          index
                        )
                      }
                    >
                      {t("subscriptionPlans.choose")}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center text-gray-500"
        >
          <p>
            {t("subscriptionPlans.title") === "Our Subscription Plans" 
              ? "All plans include a 7-day free trial. No credit card required." 
              : "Tous les forfaits incluent un essai gratuit de 7 jours. Aucune carte de crédit requise."}
          </p>
        </motion.div> */}
      </div>
    </div>
  );
};
