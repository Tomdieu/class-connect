"use client"
import { getStats } from "@/actions/stats";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/locales/client";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminStats = () => {
  const t = useI18n();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  const statsCards = [
    {
      title: t("stats.totalUsers"),
      value: stats?.total_users || "0",
      icon: Users,
      change: stats?.user_growth || "+0%",
      changeType: "increase",
    },
    {
      title: t("stats.activeCourses"),
      value: stats?.active_courses || "0",
      icon: BookOpen,
      change: stats?.course_growth || "+0%",
      changeType: "increase",
    },
    {
      title: t("stats.monthlyRevenue"),
      value: `${stats?.monthly_revenue || "0"} XAF`,
      icon: CreditCard,
      change: stats?.revenue_growth || "+0%",
      changeType: "increase",
    },
    {
      title: t("stats.conversionRate"),
      value: `${stats?.conversion_rate || "0"}%`,
      icon: TrendingUp,
      change: stats?.conversion_growth || "+0%",
      changeType: "increase",
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-5 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[140px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
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
              <span className="text-sm text-gray-600"> {t("stats.vsPreviousMonth")}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Monthly Users Chart */}
      {/* <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("stats.monthlyUsers")}</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats?.monthly_stats}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card> */}
    </div>
  );
};

export default AdminStats;