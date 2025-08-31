"use client";
import { getStats } from "@/actions/stats";
import { getUsers } from "@/actions/accounts";
import { listTransactions } from "@/actions/payments";
import { listEnrollments, listSchoolYear } from "@/actions/enrollments";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import {
  Users,
  CreditCard,
  TrendingUp,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  BarChart as BarChartIcon,
  Filter,
  UserRoundCog,
  BookOpen,
  ChevronDown,
  ChartColumn,
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
  LineChart,
  Line,
} from "recharts";
import { useState, useMemo } from "react";
import { format, parseISO, subMonths, startOfMonth, addMonths, subDays, subYears, endOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HasSub } from "@/types";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

const COLORS = {
  primary: 'var(--primary)',
  primaryLight: 'rgba(var(--primary-rgb), 0.2)',
  blue: '#3B82F6',
  blueLight: 'rgba(59, 130, 246, 0.2)',
  green: '#10B981',
  greenLight: 'rgba(16, 185, 129, 0.2)',
  amber: '#F59E0B',
  amberLight: 'rgba(245, 158, 11, 0.2)',
  red: '#EF4444',
  redLight: 'rgba(239, 68, 68, 0.2)',
  purple: '#8B5CF6',
  purpleLight: 'rgba(139, 92, 246, 0.2)',
  pink: '#EC4899',
  pinkLight: 'rgba(236, 72, 153, 0.2)',
};

const PIE_COLORS = [COLORS.blue, COLORS.red, COLORS.green, COLORS.amber, COLORS.purple];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const StatisticsPage = () => {
  const t = useI18n();
  const [timeFrame, setTimeFrame] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>(undefined);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);

  // Date range filters
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 3),
    to: new Date()
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users", userFilter],
    queryFn: () => getUsers({}),
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions", dateRange],
    queryFn: () => listTransactions({
      params: {
        created_at: {
          after: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
          before: dateRange?.to ? format(endOfDay(dateRange.to), 'yyyy-MM-dd') : undefined,
        }
      }
    }),
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

  // Generate data for the last 30 days
  const generateLast30Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push({
        date: format(date, "yyyy-MM-dd"),
        dateLabel: format(date, "dd MMM"),
        students: 0,
        professionals: 0,
        total: 0,
      });
    }
    return days;
  };

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

  // Modified to better extract date_joined data from users
  const chartData = useMemo(() => {
    if (!users) return {
      daily: generateLast30Days(),
      monthly: generateLast12Months(),
      yearly: []
    };

    // Filter users based on userFilter
    const filteredUsers = userFilter === "all" 
      ? users 
      : users.filter(user => user.user_type === userFilter);

    // Create a map to count users by join date
    const userJoinDates = new Map();

    filteredUsers.forEach(user => {
      // Extract only the date part from date_joined (YYYY-MM-DD)
      const joinDate = user.date_joined.split("T")[0];

      // Increment the count for this date
      userJoinDates.set(joinDate, (userJoinDates.get(joinDate) || 0) + 1);
    });

    // Generate last 7 days data structure
    const last7Days = generateLast30Days();

    // Populate with actual user join counts
    last7Days.forEach(day => {
      const count = userJoinDates.get(day.date) || 0;
      day.total = count;

      // Try to categorize users (this part depends on your data structure)
      const dateUsers = filteredUsers.filter(user => user.date_joined.startsWith(day.date));
      day.students = dateUsers.filter(user => user.user_type === "STUDENT").length;
      day.professionals = dateUsers.filter(user => user.user_type === "PROFESSIONAL").length;
    });

    // Handle monthly data
    const monthlyData = generateLast12Months();
    const monthMap = new Map(monthlyData.map((item) => [item.monthKey, { ...item }]));

    filteredUsers.forEach(user => {
      const joinDate = user.date_joined.split("T")[0];
      const month = joinDate.substring(0, 7); // YYYY-MM format

      if (monthMap.has(month)) {
        const monthData = monthMap.get(month);
        if (monthData) {

          monthData.total += 1;

          if (user.user_type === "STUDENT") {
            monthData.students += 1;
          }
          else if (user.user_type === "PROFESSIONAL") {
            monthData.professionals += 1;
          }
        }
      }
    });

    const formattedMonthlyData = Array.from(monthMap.values()).map((item) => ({
      ...item,
      month: item.monthLabel,
    }));

    // Handle yearly data
    const yearlyMap = new Map();

    filteredUsers.forEach(user => {
      const year = user.date_joined.split("-")[0]; // Extract YYYY part
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          students: 0,
          professionals: 0,
          total: 0,
        });
      }

      const yearData = yearlyMap.get(year);
      yearData.total += 1;

      if (user.user_type === "STUDENT") {
        yearData.students += 1;
      }
      else if (user.user_type === "PROFESSIONAL") {
        yearData.professionals += 1;
      }
    });

    const currentYear = new Date().getFullYear();
    // Make sure we have data for the last 5 years
    for (let i = 0; i < 5; i++) {
      const year = (currentYear - 4 + i).toString();
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          students: 0,
          professionals: 0,
          total: 0
        });
      }
    }

    const yearlyData = Array.from(yearlyMap.values())
      .sort((a, b) => a.year.localeCompare(b.year));

    return {
      daily: last7Days,
      monthly: formattedMonthlyData,
      yearly: yearlyData,
    };
  }, [users, userFilter]);

  // New function to get daily signup count data for Admin Dashboard
  const userDailySignupData = useMemo(() => {
    if (!users) return [];

    // Group users by date joined
    const usersByDate = new Map();

    users.forEach(user => {
      const date = user.date_joined.split('T')[0];
      if (!usersByDate.has(date)) {
        usersByDate.set(date, []);
      }
      usersByDate.get(date).push(user);
    });

    // Convert to array of objects with date and count
    return Array.from(usersByDate.entries())
      .map(([date, users]) => ({
        date,
        count: users.length,
        displayDate: format(new Date(date), 'MMM dd, yyyy')
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // Last 30 days with signups
  }, [users]);

  const subscriptionPlanData = useMemo(() => {
    if (!users) return [];

    const planCounts = users.reduce((acc, user) => {
      if (user.subscription_status && user.subscription_status.active === true && "plan" in user.subscription_status) {
        const plan = (user.subscription_status as HasSub).plan || "Unknown";
        acc[plan] = (acc[plan] || 0) + 1;
      } else {
        acc["No Plan"] = (acc["No Plan"] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(planCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [users]);

  // Modified to change 'admins' to users without user_type
  const userEducationLevelData = useMemo(() => {
    if (!users) return [];

    const userTypeCounts = users.reduce((acc, user) => {
      // For users without user_type, show as "OTHER" instead of "admins"
      const type = user.user_type || "OTHER";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userTypeCounts)
      .map(([name, value]) => {
        // Map user types to display names
        let displayName: string;
        switch (name) {
          case "STUDENT":
            displayName = "Students";
            break;
          case "PROFESSIONAL":
            displayName = "Professionals";
            break;
          case "ADMIN":
            displayName = "Administrators";
            break;
          case "OTHER":
            displayName = "Other";
            break;
          default:
            displayName = name;
        }
        
        return {
          name: displayName,
          value
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [users, t]);

  const monthlyRevenueData = useMemo(() => {
    if (!transactions?.results) return generateLast12Months();

    const revenueByMonth = generateLast12Months();
    const monthMap = new Map(revenueByMonth.map((item) => [item.monthKey, item]));

    transactions.results.forEach((transaction) => {
      if (transaction.status === "SUCCESSFUL" && transaction.endpoint === "collect") {
        const month = format(new Date(transaction.created_at), "yyyy-MM");
        if (monthMap.has(month)) {
          const monthData = monthMap.get(month);
          if(monthData){

            monthData.amount += transaction.amount;
          }
        }
      }
    });

    return Array.from(monthMap.values()).map((item) => ({
      month: item.monthLabel,
      amount: item.amount,
    }));
  }, [transactions]);

  // Calculate revenue trend
  const revenueTrend = useMemo(() => {
    if (!monthlyRevenueData || monthlyRevenueData.length < 2) return 0;

    const lastMonth = monthlyRevenueData[monthlyRevenueData.length - 1].amount;
    const previousMonth = monthlyRevenueData[monthlyRevenueData.length - 2].amount;

    if (previousMonth === 0) return lastMonth > 0 ? 100 : 0;

    return ((lastMonth - previousMonth) / previousMonth) * 100;
  }, [monthlyRevenueData]);

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

  // Calculate total revenue from transactions
  const totalRevenue = useMemo(() => {
    if (!transactions?.results) return 0;

    return transactions.results.reduce((sum, transaction) => {
      if (transaction.status === "SUCCESSFUL" && transaction.endpoint === "collect") {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);
  }, [transactions]);

  // Calculate total active subscriptions
  const activeSubscriptions = useMemo(() => {
    if (!users) return 0;

    return users.filter(user =>
      user.subscription_status &&
      "active" in user.subscription_status &&
      user.subscription_status.active === true
    ).length;
  }, [users]);

  // Calculate subscription conversion rate
  const subscriptionRate = useMemo(() => {
    if (!users || users.length === 0) return 0;
    return (activeSubscriptions / users.length) * 100;
  }, [users, activeSubscriptions]);

  const statsCards = [
    {
      title: t("stats.totalUsers"),
      value: users?.length.toString() || "0",
      icon: Users,
      color: "blue",
      change: stats?.user_growth || "+0%",
      changeType: stats?.user_growth?.startsWith("+") ? "increase" : "decrease",
      changeDescription: t("stats.vsPreviousMonth"),
    },
    {
      title: t("stats.monthlyRevenue"),
      value: `${totalRevenue.toLocaleString()} XAF`,
      icon: CreditCard,
      color: "emerald",
      change: revenueTrend ? `${revenueTrend > 0 ? '+' : ''}${revenueTrend.toFixed(1)}%` : "+0%",
      changeType: revenueTrend >= 0 ? "increase" : "decrease",
      changeDescription: t("stats.vsPreviousMonth"),
    },
    {
      title: t("stats.subscriptionDistribution"),
      value: `${activeSubscriptions} / ${users?.length || 0}`,
      icon: Layers,
      color: "amber",
      change: `${subscriptionRate.toFixed(1)}%`,
      changeType: "neutral",
      changeDescription: t("stats.withPlans"),
    },
    {
      title: t(`enrollments`),
      value: enrollments?.count.toString() || "0",
      icon: GraduationCap,
      color: "purple",
      change: selectedSchoolYear || "",
      changeType: "neutral",
      changeDescription: t("studentsPage.schoolYear"),
    },
  ];

  if (isLoading) {
    return (
      <motion.div
        className="w-full flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-gray-600">{t('common.loading')}...</p>
        </div>
      </motion.div>
    );
  }

  const currentChartData = chartData[timeFrame];

  // Custom Tooltip component for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 sm:px-8 py-10 bg-gradient-to-b from-primary/5 via-background to-background min-h-screen"
    >
      <motion.div
        className="relative flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-primary/10 max-w-[2400px] mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>

        <div className="flex items-center mb-4 sm:mb-0 relative z-10">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <ChartColumn className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t("stats.dashboardTitle")}
            </h1>
            <p className="text-sm text-gray-600">{t("common.dashboard")}</p>
          </div>
        </div>

        <div className="flex space-x-3 relative z-10">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={(range) => {
              if (range?.from && range?.to) {
                setDateRange(range);
              }
            }}
            className="w-full sm:w-auto"
          />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-[2400px] mx-auto"
      >
        {/* KPI Cards */}
        <motion.div variants={cardVariants} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card key={index} className="shadow-lg border-primary/20 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className={`absolute top-0 right-0 w-[80px] h-[80px] bg-${stat.color}-100 rounded-bl-full z-0 opacity-20`}></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className={`bg-${stat.color}-100 p-2 rounded-full`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{stat.value}</h3>
                <div className="flex items-center">
                  <div className={`flex items-center ${stat.changeType === 'increase' ? 'text-green-600' :
                      stat.changeType === 'decrease' ? 'text-red-600' :
                        'text-gray-500'
                    }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    ) : (
                      <span className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">{stat.changeDescription}</span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* User Growth Chart Section */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("stats.userGrowth")}</h2>
                  <p className="text-sm text-gray-500">
                    {t("stats.userCounts")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="hover:bg-primary/5">
                        <Filter className="h-4 w-4 mr-2" />
                        {userFilter === "all"
                          ? t("users.all")
                          : userFilter === "STUDENT" ? "Students" 
                          : userFilter === "PROFESSIONAL" ? "Professionals"
                          : userFilter === "ADMIN" ? "Administrators"
                          : userFilter}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t("users.filterByType")}</h4>
                        <Select
                          value={userFilter}
                          onValueChange={(value) => setUserFilter(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("users.all")}</SelectItem>
                            <SelectItem value="STUDENT">Students</SelectItem>
                            <SelectItem value="PROFESSIONAL">Professionals</SelectItem>
                            <SelectItem value="ADMIN">Administrators</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Tabs defaultValue={timeFrame} onValueChange={(v) => setTimeFrame(v as any)} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="daily" className="text-xs sm:text-sm">{t("stats.daily")}</TabsTrigger>
                      <TabsTrigger value="monthly" className="text-xs sm:text-sm">{t("stats.monthly")}</TabsTrigger>
                      <TabsTrigger value="yearly" className="text-xs sm:text-sm">{t("stats.yearly")}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="h-[400px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorProfessionals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey={timeFrame === "daily" ? "dateLabel" : timeFrame === "monthly" ? "month" : "year"}
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      tickCount={5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <Area
                      type="monotone"
                      dataKey="students"
                      name={t("stats.students")}
                      stroke={COLORS.primary}
                      fill="url(#colorStudents)"
                      strokeWidth={2}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="professionals"
                      name={t("stats.professionals")}
                      stroke={COLORS.blue}
                      fill="url(#colorProfessionals)"
                      strokeWidth={2}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Distribution and Revenue Charts */}
        <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Distribution */}
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t("stats.subscriptionDistribution")}</h2>
              <p className="text-sm text-gray-500 mb-6">{t("users.distributionDescription")}</p>

              {subscriptionPlanData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">{t("stats.noPaymentsRecorded")}</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionPlanData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "#555", strokeWidth: 1, strokeOpacity: 0.5 }}
                      >
                        {subscriptionPlanData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Users"]} />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ paddingLeft: 20 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>

          {/* Monthly Revenue */}
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t("stats.revenue")}</h2>
              <p className="text-sm text-gray-500 mb-6">
                {t("stats.monthlyRevenue")}
              </p>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyRevenueData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 30 }}
                    barSize={timeFrame === "monthly" ? 24 : timeFrame === "daily" ? 10 : 40}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      axisLine={{ stroke: '#E5E7EB' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      tickFormatter={(value) => `${value.toLocaleString()} XAF`}
                    />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toLocaleString()} XAF`, t("stats.revenue")]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar
                      dataKey="amount"
                      name={t("stats.revenue")}
                      fill={COLORS.green}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* User Type Distribution */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">User Type Distribution</h2>
              <p className="text-sm text-gray-500 mb-6">{t("users.distribution")}</p>

              {userEducationLevelData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">No user type data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userEducationLevelData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill={COLORS.primary}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {userEducationLevelData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} users`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t("users.summary")}</h3>
                    <div className="space-y-3">
                      {userEducationLevelData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            ></div>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-sm font-medium">{item.value}</span>
                            <span className="text-sm text-gray-500">
                              {((item.value / (users?.length || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="pt-3 mt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{t("users.totalUsers")}</span>
                          <span className="font-medium">{users?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Top Paying Users Table */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t("stats.topPayingUsers")}</h2>
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
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscriptionStatus === t("stats.noPlan")
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
            </div>
          </Card>
        </motion.div>

        {/* User Daily Signup Table */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">User Registration History</h2>
              <p className="text-sm text-gray-500 mb-6">
                Daily count of new user registrations
              </p>

              {userDailySignupData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-gray-500">No user registration data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          New Users
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userDailySignupData.map((day) => (
                        <tr key={day.date} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {day.displayDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="font-semibold">{day.count}</span>
                              <div className="ml-3 h-2 w-32 bg-gray-100 rounded-full">
                                <div
                                  className="h-2 bg-primary rounded-full"
                                  style={{
                                    width: `${Math.min(100, (day.count / Math.max(...userDailySignupData.map(d => d.count))) * 100)}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StatisticsPage;