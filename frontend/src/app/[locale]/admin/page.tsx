"use client"
import { Card } from "@/components/ui/card";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Utilisateurs totaux",
    value: "0",
    icon: Users,
    change: "+0%",
    changeType: "increase",
  },
  {
    title: "Cours actifs",
    value: "0",
    icon: BookOpen,
    change: "+0%",
    changeType: "increase",
  },
  {
    title: "Revenus mensuels",
    value: "0€",
    icon: CreditCard,
    change: "+0%",
    changeType: "increase",
  },
  {
    title: "Taux de conversion",
    value: "0%",
    icon: TrendingUp,
    change: "+0%",
    changeType: "increase",
  },
];

 const AdminStats = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 container mx-auto p-5">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <stat.icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-sm font-medium ${
                stat.changeType === "increase"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
            <span className="text-sm text-gray-600"> vs mois dernier</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats