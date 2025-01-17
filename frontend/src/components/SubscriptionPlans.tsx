"use client"
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

const plans = [
  {
    name: "Basic",
    description: "Parfait pour commencer",
    features: [
      "Accès aux cours de base",
      "Forum communautaire",
      "Ressources d'apprentissage limitées",
    ],
  },
  {
    name: "Standard",
    description: "Pour les apprenants sérieux",
    features: [
      "Toutes les fonctionnalités Basic",
      "Accès à plus de cours",
      "Sessions Q&R hebdomadaires",
      "Téléchargement des ressources",
    ],
  },
  {
    name: "Premium",
    description: "L'expérience complète",
    features: [
      "Toutes les fonctionnalités Standard",
      "Accès à tous les cours",
      "Sessions vidéo illimitées",
      "Support prioritaire",
      "Contenu exclusif",
    ],
  },
];

export const SubscriptionPlans = () => {

  return (
    <div className="py-12 bg-[#F0F9FF]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Nos formules d'abonnement</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col border-[#0EA5E9]/20 bg-white text-black">
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
                >
                  Choisir cette formule
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};