"use client";
import { getStats } from "@/actions/stats";
import { getUsers } from "@/actions/accounts";
import { listTransactions } from "@/actions/payments";
import { listEnrollments, listSchoolYear } from "@/actions/enrollments";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/locales/client";
import {
  Users,
  CreditCard,
  TrendingUp,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { useState, useMemo } from "react";
import { format, parseISO, subMonths, startOfMonth, addMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HasSub } from "@/types";

const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const PIE_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

const StatisticsPage = () => {
  const t = useI18n();
  const [timeFrame, setTimeFrame] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>(undefined);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({}),
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => listTransactions({}),
  });

  const { data: schoolYears, isLoading: schoolYearsLoading } = useQuery({
    queryKey: ["school-years"],
    queryFn: listSchoolYear,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["enrollments", selectedSchoolYear, showActiveOnly],
    queryFn: () =>
      listEnrollments({
        school_year: selectedSchoolYear,
        has_class_end: showActiveOnly ? false : undefined,
      }),
  });

  const currentSchoolYear = useMemo(() => {
    if (!schoolYears) return undefined;
    return schoolYears.find((year) => year.is_active) || schoolYears[0];
  }, [schoolYears]);

  useMemo(() => {
    if (currentSchoolYear && !selectedSchoolYear) {
      setSelectedSchoolYear(currentSchoolYear.formatted_year);
    }
  }, [currentSchoolYear, selectedSchoolYear]);

  const isLoading = statsLoading || usersLoading || transactionsLoading || schoolYearsLoading || enrollmentsLoading;

  const generateLast12Months = () => {
    const months = [];
    const today = new Date();
    const startDate = subMonths(startOfMonth(today), 11);

    for (let i = 0; i < 12; i++) {
      const currentMonth = addMonths(startDate, i);
      months.push({
        monthKey: format(currentMonth, "yyyy-MM"),
        monthLabel: format(currentMonth, "MMM yyyy"),
        students: 0,
        professionals: 0,
        total: 0,
        amount: 0,
      });
    }
    return months;
  };

  const chartData = useMemo(() => {
    if (!users) return { daily: [], monthly: generateLast12Months(), yearly: [] };

    const sortedUsers = [...users].sort(
      (a, b) => new Date(a.date_joined).getTime() - new Date(b.date_joined).getTime()
    );

    const studentsByDate = new Map();
    const professionalsByDate = new Map();

    sortedUsers.forEach((user) => {
      const date = user.date_joined.split("T")[0];
      const dateKey = format(parseISO(date), "yyyy-MM-dd");

      if (
        user.education_level === "COLLEGE" ||
        user.education_level === "LYCEE" ||
        user.education_level === "UNIVERSITY"
      ) {
        studentsByDate.set(dateKey, (studentsByDate.get(dateKey) || 0) + 1);
      }

      if (user.education_level === "PROFESSIONAL") {
        professionalsByDate.set(dateKey, (professionalsByDate.get(dateKey) || 0) + 1);
      }
    });

    const dailyData = Array.from(new Set([...studentsByDate.keys(), ...professionalsByDate.keys()]))
      .map((date) => ({
        date,
        students: studentsByDate.get(date) || 0,
        professionals: professionalsByDate.get(date) || 0,
        total: (studentsByDate.get(date) || 0) + (professionalsByDate.get(date) || 0),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const monthlyData = generateLast12Months();
    const monthMap = new Map(monthlyData.map((item) => [item.monthKey, item]));

    dailyData.forEach((item) => {
      const month = format(parseISO(item.date), "yyyy-MM");
      if (monthMap.has(month)) {
        const monthData = monthMap.get(month);
        monthData.students += item.students;
        monthData.professionals += item.professionals;
        monthData.total += item.total;
      }
    });

    const formattedMonthlyData = Array.from(monthMap.values()).map((item) => ({
      ...item,
      month: item.monthLabel,
    }));

    const yearlyMap = new Map();
    formattedMonthlyData.forEach((item) => {
      const year = item.month.split(" ")[1];
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          students: 0,
          professionals: 0,
          total: 0,
        });
      }
      const yearData = yearlyMap.get(year);
      yearData.students += item.students;
      yearData.professionals += item.professionals;
      yearData.total += item.total;
    });

    const yearlyData = Array.from(yearlyMap.values()).sort((a, b) => a.year.localeCompare(b.year));

    return {
      daily: dailyData,
      monthly: formattedMonthlyData,
      yearly: yearlyData,
    };
  }, [users]);

  const subscriptionPlanData = useMemo(() => {
    if (!users) return [];

    const planCounts = users.reduce((acc, user) => {
      if (user.subscription_status && user.subscription_status.active === true) {
        const plan = user.subscription_status.plan || "Unknown";
        acc[plan] = (acc[plan] || 0) + 1;
      } else {
        acc["No Plan"] = (acc["No Plan"] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(planCounts).map(([name, value]) => ({ name, value }));
  }, [users]);

  const monthlyRevenueData = useMemo(() => {
    if (!transactions?.results) return generateLast12Months();

    const revenueByMonth = generateLast12Months();
    const monthMap = new Map(revenueByMonth.map((item) => [item.monthKey, item]));

    transactions.results.forEach((transaction) => {
      if (transaction.status === "SUCCESSFUL" && transaction.endpoint === "collect") {
        const month = format(new Date(transaction.created_at), "yyyy-MM");
        if (monthMap.has(month)) {
          const monthData = monthMap.get(month);
          monthData.amount += transaction.amount;
        }
      }
    });

    return Array.from(monthMap.values()).map((item) => ({
      month: item.monthLabel,
      amount: item.amount,
    }));
  }, [transactions]);

  const topPayingUsers = useMemo(() => {
    if (!users || !transactions?.results) return [];

    const userPayments = new Map();
    const userTotalAmounts = new Map();
    const userLastPayment = new Map();

    transactions.results.forEach((transaction) => {
      if (transaction.status === "SUCCESSFUL" && transaction.endpoint === "collect" && transaction.external_user) {
        const userId = transaction.external_user;

        userPayments.set(userId, (userPayments.get(userId) || 0) + 1);
        userTotalAmounts.set(userId, (userTotalAmounts.get(userId) || 0) + transaction.amount);

        const lastPaymentDate = userLastPayment.get(userId);
        if (!lastPaymentDate || new Date(transaction.created_at) > new Date(lastPaymentDate)) {
          userLastPayment.set(userId, transaction.created_at);
        }
      }
    });

    return users
      .map((user) => {
        let subscriptionStatusText = t("stats.noPlan");
        if (user.subscription_status) {
          if ("plan" in user.subscription_status) {
            const subscriptionStatus = user.subscription_status as HasSub;

            if (subscriptionStatus.active && subscriptionStatus.plan) {
              if (subscriptionStatus.expires_at) {
                try {
                  const expiryDate = new Date(subscriptionStatus.expires_at);
                  if (!isNaN(expiryDate.getTime())) {
                    subscriptionStatusText = `${subscriptionStatus.plan} (${format(expiryDate, "dd MMM yyyy")})`;
                  } else {
                    subscriptionStatusText = subscriptionStatus.plan;
                  }
                } catch (e) {
                  subscriptionStatusText = subscriptionStatus.plan;
                }
              } else {
                subscriptionStatusText = subscriptionStatus.plan;
              }
            }
          }
        }

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          paymentCount: userPayments.get(user.id) || 0,
          totalAmount: userTotalAmounts.get(user.id) || 0,
          lastPayment: userLastPayment.get(user.id) || null,
          subscriptionStatus: subscriptionStatusText,
        };
      })
      .filter((user) => user.paymentCount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }, [users, transactions, t]);

  const statsCards = [
    {
      title: t("stats.totalUsers"),
      value: stats?.total_users || "0",
      icon: Users,
      change: stats?.user_growth || "+0%",
      changeType: stats?.user_growth?.startsWith("+") ? "increase" : "decrease",
    },
    {
      title: t("stats.monthlyRevenue"),
      value: `${stats?.monthly_revenue?.toLocaleString() || "0"} XAF`,
      icon: CreditCard,
      change: stats?.revenue_growth || "+0%",
      changeType: stats?.revenue_growth?.startsWith("+") ? "increase" : "decrease",
    },
    {
      title: t("stats.conversionRate"),
      value: `${stats?.conversion_rate || "0"}%`,
      icon: TrendingUp,
      change: stats?.conversion_growth || "+0%",
      changeType: stats?.conversion_growth?.startsWith("+") ? "increase" : "decrease",
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
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const currentChartData = chartData[timeFrame];

  return (
    <div className="container mx-auto p-5 space-y-6">
      <h1 className="text-3xl font-bold mb-8">{t("stats.dashboardTitle")}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-600"> {t("stats.vsPreviousMonth")}</span>
            </div>
          </Card>
        ))}

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow col-span-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t(`enrollments`)}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{enrollments?.count || 0}</p>
              </div>
              <div className="rounded-full bg-indigo-50 p-3">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 gap-2">
              <Select value={selectedSchoolYear} onValueChange={(value) => setSelectedSchoolYear(value)}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select School Year" />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears?.map((year) => (
                    <SelectItem key={year.formatted_year} value={year.formatted_year}>
                      {year.formatted_year} {year.is_active && "(Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  showActiveOnly ? "text-green-600" : "text-gray-500"
                }`}
                onClick={() => setShowActiveOnly(true)}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">Active</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  !showActiveOnly ? "text-amber-600" : "text-gray-500"
                }`}
                onClick={() => setShowActiveOnly(false)}
              >
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">All</span>
              </div>
              <Badge variant={showActiveOnly ? "outline" : "secondary"} className="text-xs">
                {showActiveOnly ? "Active Only" : "All Enrollments"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t("stats.userGrowth")}</h2>
          <Tabs defaultValue="monthly" onValueChange={(v) => setTimeFrame(v as any)}>
            <TabsList>
              <TabsTrigger value="daily">{t("stats.daily")}</TabsTrigger>
              <TabsTrigger value="monthly">{t("stats.monthly")}</TabsTrigger>
              <TabsTrigger value="yearly">{t("stats.yearly")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={currentChartData}>
            <defs>
              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorProfessionals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={timeFrame === "daily" ? "date" : timeFrame === "monthly" ? "month" : "year"}
              tick={{ fontSize: 12 }}
              tickFormatter={(tick) => {
                if (timeFrame === "daily") return format(new Date(tick), "dd MMM");
                return tick;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(label) => {
                if (timeFrame === "daily" && label) {
                  try {
                    const date = new Date(label);
                    if (!isNaN(date.getTime())) {
                      return format(date, "dd MMMM yyyy");
                    }
                  } catch (e) {
                    console.error("Invalid date format:", label);
                  }
                }
                return label;
              }}
              formatter={(value, name) => {
                return [value, name === "students" ? t("stats.students") : t("stats.professionals")];
              }}
            />
            <Legend formatter={(value) => (value === "students" ? t("stats.students") : t("stats.professionals"))} />
            <Area
              type="monotone"
              dataKey="students"
              stroke={COLORS[0]}
              fillOpacity={1}
              fill="url(#colorStudents)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="professionals"
              stroke={COLORS[1]}
              fillOpacity={1}
              fill="url(#colorProfessionals)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6">{t("stats.subscriptionDistribution")}</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={subscriptionPlanData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#555", strokeWidth: 1 }}
              >
                {subscriptionPlanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6">{t("stats.monthlyRevenue")}</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value.toLocaleString()} XAF`} />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} XAF`, t("stats.revenue")]} />
              <Bar dataKey="amount" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-6">{t("stats.topPayingUsers")}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("stats.userName")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("stats.email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("stats.totalPayments")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("stats.totalAmount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("stats.lastPayment")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("stats.subscriptionStatus")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topPayingUsers.length > 0 ? (
                topPayingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.paymentCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.totalAmount.toLocaleString()} XAF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastPayment ? format(new Date(user.lastPayment), "dd MMM yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.subscriptionStatus === t("stats.noPlan")
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.subscriptionStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t("stats.noPaymentsRecorded")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StatisticsPage;