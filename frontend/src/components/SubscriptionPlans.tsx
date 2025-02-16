"use client";
import { Check } from "lucide-react";
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

export const SubscriptionPlans = () => {
  const t = useI18n();
  const router = useRouter();

  const handleSubscribe = (planType: "basic" | "standard" | "premium") => {
    router.push(`/subscribe/${planType}`);
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
    },
  ];

  return (
    <div className="py-12 bg-[#F0F9FF]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("subscriptionPlans.title")}
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className="flex flex-col border-[#0EA5E9]/20 bg-white text-black"
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-[#0EA5E9]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md"
                  onClick={() =>
                    handleSubscribe(
                      plan.name.toLowerCase() as
                        | "basic"
                        | "standard"
                        | "premium"
                    )
                  }
                >
                  {t("subscriptionPlans.choose")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
