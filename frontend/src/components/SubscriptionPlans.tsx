"use client";
import { Check, Sparkles } from "lucide-react";
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

export const SubscriptionPlans = () => {
  const t = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  const { openLogin } = useAuthDialog();

  const handleSubscribe = (planType: "basic" | "standard" | "premium") => {
    if (!session?.user) {
      router.replace("/");
      openLogin();
      return;
    }
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
      price: "5,000",
      period: "month",
      gradient: "from-blue-50 to-blue-100/50",
      popular: false,
      keyName:"basic"
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
      price: "10,000",
      period: "month",
      gradient: "from-blue-100 to-blue-200/50",
      popular: true,
      keyName:"standard"
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
      price: "15,000",
      period: "month",
      gradient: "from-blue-200 to-blue-300/50",
      popular: false,
      keyName:"premium"
    },
  ];

  return (
    <div className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-200/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200/20 rounded-full filter blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("subscriptionPlans.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            {t("subscriptionPlans.subtitle")}
          </p>
          <div className="w-24 h-1 bg-default mx-auto rounded-full" />
        </div> */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-gradient-to-br ${
                plan.gradient
              } ${plan.popular ? "scale-105 lg:scale-110" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-default text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Popular
                  </div>
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
                      <div className="flex-shrink-0 pt-1">
                        <Check className="h-5 w-5 text-default" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8 px-8">
                <Button
                  className={`w-full h-12 text-lg font-medium rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? "bg-default hover:bg-default/90 text-white"
                      : "bg-white hover:bg-gray-50 text-default border-2 border-default"
                  }`}
                  onClick={() =>
                    handleSubscribe(
                      plan.keyName.toLowerCase() as
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
