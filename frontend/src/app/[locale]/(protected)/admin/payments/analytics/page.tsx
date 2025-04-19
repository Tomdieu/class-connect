"use client";

import { listTransactions } from "@/actions/payments";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, isAfter, parseISO, startOfMonth, startOfYear, subMonths, subYears, isValid, eachDayOfInterval, differenceInDays, addDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
import { ChevronDown, CreditCard, Filter, CheckSquare, Loader2, Calendar, ArrowUpRight, ArrowDownRight, DollarSign, Users, Activity, PieChart as PieChartIcon, BarChart2, TrendingUp, ChevronRight, Clock } from "lucide-react";
import { useI18n } from "@/locales/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Fix the import path to use the alias instead of relative path
import type { 
  Transaction, 
  TransactionFilterParams,
  TransactionListResponse,
  Currency 
} from "@/types";

// Define the enum manually since it's not being imported correctly
const TransactionStatus = {
  SUCCESSFUL: "SUCCESSFUL",
  FAILED: "FAILED",
  PENDING: "PENDING"
} as const;

type Operator = "MTN" | "ORANGE";
type TransactionType = "collect" | "withdraw";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Colors for charts
const CHART_COLORS = {
  primary: 'var(--primary)',
  primaryTransparent: 'rgba(var(--primary-rgb), 0.2)',
  secondary: '#4b6bfb',
  secondaryTransparent: 'rgba(75, 107, 251, 0.2)',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#0ea5e9',
  mtn: '#ffcc00',
  orange: '#ff7900',
};

const PIE_COLORS = ['#4b6bfb', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-primary/20">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-base font-bold text-primary">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const t = useI18n();
  const [tab, setTab] = useState("daily");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Query for transactions with filters
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "analytics", tab, dateRange, operatorFilter, statusFilter],
    queryFn: () => listTransactions({
      params: {
        created_at: {
          after: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
          before: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        },
        operator: operatorFilter !== "all" ? operatorFilter as Operator : undefined,
        status: statusFilter !== "all" ? statusFilter as TransactionStatus : undefined,
      },
    }),
  });

  // Prepare chart data based on selected tab
  const chartData = useMemo(() => {
    if (!data?.results || data.results.length === 0) {
      // Return empty data with placeholder months/years
      if (tab === "monthly") {
        // Generate last 12 months
        return Array.from({ length: 12 }, (_, i) => {
          const date = subMonths(new Date(), 11 - i);
          return {
            month: format(date, 'MMM yyyy'),
            monthKey: format(date, 'yyyy-MM'),
            amount: 0,
            count: 0
          };
        });
      } else if (tab === "yearly") {
        // Generate last 5 years
        return Array.from({ length: 5 }, (_, i) => {
          const year = new Date().getFullYear() - 4 + i;
          return {
            year: year.toString(),
            amount: 0,
            count: 0
          };
        });
      }
      return [];
    }
    
    const transactions = data.results;

    // Filter only successful transactions for charts
    const successfulTransactions = transactions.filter(
      t => t.status === TransactionStatus.SUCCESSFUL
    );

    if (tab === "daily") {
      // Daily view (last 7 days by default)
      const daysInterval = dateRange.from && dateRange.to
        ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
        : eachDayOfInterval({ start: subDays(new Date(), 7), end: new Date() });

      return daysInterval.map(day => {
        const dayTransactions = successfulTransactions.filter(t => {
          const transactionDate = parseISO(t.created_at);
          return format(transactionDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });
        
        const totalAmount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        return {
          date: format(day, 'dd MMM'),
          fullDate: format(day, 'yyyy-MM-dd'),
          amount: totalAmount,
          count: dayTransactions.length
        };
      });
    } 
    else if (tab === "monthly") {
      // Monthly view (always show last 12 months)
      const monthsMap = new Map();
      
      // First initialize all 12 months with zero values
      for (let i = 0; i < 12; i++) {
        const date = subMonths(new Date(), 11 - i);
        const monthKey = format(date, 'yyyy-MM');
        const monthDisplay = format(date, 'MMM yyyy');
        
        monthsMap.set(monthKey, { 
          month: monthDisplay,
          monthKey,
          amount: 0,
          count: 0
        });
      }
      
      // Then populate with actual data
      successfulTransactions.forEach(transaction => {
        const date = parseISO(transaction.created_at);
        const monthKey = format(date, 'yyyy-MM');
        
        if (monthsMap.has(monthKey)) {
          const monthData = monthsMap.get(monthKey);
          monthData.amount += transaction.amount;
          monthData.count += 1;
          monthsMap.set(monthKey, monthData);
        }
      });
      
      // Convert map to array and sort by month
      return Array.from(monthsMap.values())
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    } 
    else {
      // Yearly view (always show last 5 years)
      const yearsMap = new Map();
      const currentYear = new Date().getFullYear();
      
      // Initialize 5 years with zero values
      for (let i = 0; i < 5; i++) {
        const year = (currentYear - 4 + i).toString();
        yearsMap.set(year, { 
          year,
          amount: 0,
          count: 0
        });
      }
      
      // Populate with actual data
      successfulTransactions.forEach(transaction => {
        const date = parseISO(transaction.created_at);
        const yearKey = format(date, 'yyyy');
        
        if (yearsMap.has(yearKey)) {
          const yearData = yearsMap.get(yearKey);
          yearData.amount += transaction.amount;
          yearData.count += 1;
          yearsMap.set(yearKey, yearData);
        }
      });
      
      // Convert map to array and sort by year
      return Array.from(yearsMap.values())
        .sort((a, b) => a.year.localeCompare(b.year));
    }
  }, [data, tab, dateRange]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!data?.results) {
      return {
        totalAmount: 0,
        successCount: 0,
        totalTransactions: 0,
        avgTransaction: 0,
        successRate: 0,
        mtnCount: 0,
        orangeCount: 0,
        mtnAmount: 0,
        orangeAmount: 0
      };
    }
    
    const transactions = data.results;
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(t => t.status === TransactionStatus.SUCCESSFUL);
    const totalAmount = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Operator stats
    const mtnTransactions = successfulTransactions.filter(t => t.operator === 'MTN');
    const orangeTransactions = successfulTransactions.filter(t => t.operator === 'ORANGE');
    
    return {
      totalAmount,
      successCount: successfulTransactions.length,
      totalTransactions,
      avgTransaction: totalTransactions > 0 ? totalAmount / successfulTransactions.length : 0,
      successRate: totalTransactions > 0 ? (successfulTransactions.length / totalTransactions) * 100 : 0,
      mtnCount: mtnTransactions.length,
      orangeCount: orangeTransactions.length,
      mtnAmount: mtnTransactions.reduce((sum, t) => sum + t.amount, 0),
      orangeAmount: orangeTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }, [data]);

  // Operator distribution for pie chart
  const operatorData = useMemo(() => {
    if (!data?.results) return [];
    
    const successfulTransactions = data.results.filter(
      t => t.status === TransactionStatus.SUCCESSFUL
    );
    
    const mtnAmount = successfulTransactions
      .filter(t => t.operator === 'MTN')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const orangeAmount = successfulTransactions
      .filter(t => t.operator === 'ORANGE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return [
      { name: 'MTN', value: mtnAmount },
      { name: 'ORANGE', value: orangeAmount }
    ].filter(item => item.value > 0);
  }, [data]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    if (!data?.results) return [];
    
    const statusMap = data.results.reduce((acc, transaction) => {
      if (!acc[transaction.status]) {
        acc[transaction.status] = { count: 0, amount: 0 };
      }
      acc[transaction.status].count += 1;
      if (transaction.status === TransactionStatus.SUCCESSFUL) {
        acc[transaction.status].amount += transaction.amount;
      }
      return acc;
    }, {} as Record<string, { count: number, amount: number }>);
    
    return Object.entries(statusMap).map(([status, data]) => ({
      name: status,
      value: data.count
    }));
  }, [data]);

  // Recent transactions for display
  const recentTransactions = useMemo(() => {
    if (!data?.results) return [];
    
    return [...data.results]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [data]);

  const handleDateRangeChange = useCallback((newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      setDateRange(newRange);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <motion.div 
        className="w-full flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </motion.div>
    );
  }

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
            <BarChart2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Payment Analytics
            </h1>
            <p className="text-sm text-gray-600">Monitor your payment data and performance trends</p>
          </div>
        </div>
        
        <div className="flex space-x-3 relative z-10">
          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={handleDateRangeChange} 
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
        {/* Stats Overview */}
        <motion.div 
          variants={sectionVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Revenue */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(summaryStats.totalAmount)}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {summaryStats.successCount} successful payments
                    </span>
                  </div>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData.slice(-5)}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={CHART_COLORS.primary} 
                      fill={CHART_COLORS.primaryTransparent} 
                      strokeWidth={2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <h3 className="text-2xl font-bold mt-1">{summaryStats.successRate.toFixed(1)}%</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      {summaryStats.successCount} of {summaryStats.totalTransactions} transactions
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Bar 
                      dataKey="value" 
                      fill={CHART_COLORS.success}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Average Transaction */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Transaction</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(summaryStats.avgTransaction)}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center">
                      <CreditCard className="h-3 w-3 mr-1" />
                      From {summaryStats.successCount} successful payments
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData.slice(-5)}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={CHART_COLORS.info} 
                      fill={CHART_COLORS.info + '30'} 
                      strokeWidth={2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Methods</p>
                  <h3 className="text-2xl font-bold mt-1">{summaryStats.mtnCount + summaryStats.orangeCount}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center">
                      <PieChartIcon className="h-3 w-3 mr-1" />
                      MTN: {summaryStats.mtnCount}, Orange: {summaryStats.orangeCount}
                    </span>
                  </div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={operatorData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={20}
                      innerRadius={10}
                    >
                      {operatorData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'MTN' ? CHART_COLORS.mtn : CHART_COLORS.orange} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart Section */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="col-span-1 lg:col-span-2 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Payment Trends</h3>
                  <p className="text-sm text-muted-foreground">Analyze payment patterns over time</p>
                </div>
                
                <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto mt-4 sm:mt-0">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily" className="text-xs sm:text-sm">Daily</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly" className="text-xs sm:text-sm">Yearly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select value={operatorFilter} onValueChange={setOperatorFilter}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Filter by operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Operators</SelectItem>
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="ORANGE">Orange Money</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Chart */}
              <div className="h-[300px]">
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">No transaction data for selected period</p>
                      <Button variant="outline" size="sm" onClick={() => setDateRange({
                        from: subDays(new Date(), 7),
                        to: new Date()
                      })}>
                        Reset Date Range
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 10,
                        bottom: 25,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis 
                        dataKey={tab === "daily" ? "date" : tab === "monthly" ? "month" : "year"} 
                        fontSize={12} 
                        tickMargin={10}
                      />
                      <YAxis 
                        tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`} 
                        fontSize={12}
                        tickMargin={10}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="amount" 
                        fill={CHART_COLORS.primary} 
                        radius={[4, 4, 0, 0]} 
                        barSize={tab === "daily" ? 20 : tab === "monthly" ? 30 : 40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Distribution Pie Charts */}
          <Card className="col-span-1 overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Transaction Distribution</h3>
                <p className="text-sm text-muted-foreground">Breakdown by payment method & status</p>
              </div>

              {/* Operator Distribution */}
              <div className="mb-8">
                <h4 className="text-sm font-medium mb-4">Payment Provider</h4>
                <div className="h-[130px]">
                  {operatorData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={operatorData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
                          innerRadius={35}
                          paddingAngle={2}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {operatorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'MTN' ? CHART_COLORS.mtn : CHART_COLORS.orange} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-[#ffcc00] rounded-sm mr-1"></span>
                    <span className="text-xs">MTN: {formatCurrency(summaryStats.mtnAmount)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-[#ff7900] rounded-sm mr-1"></span>
                    <span className="text-xs">Orange: {formatCurrency(summaryStats.orangeAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div>
                <h4 className="text-sm font-medium mb-4">Transaction Status</h4>
                <div className="h-[130px]">
                  {statusData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
                          innerRadius={35}
                          paddingAngle={2}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {statusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.name === 'SUCCESSFUL' ? CHART_COLORS.success : 
                                entry.name === 'FAILED' ? CHART_COLORS.error : 
                                CHART_COLORS.warning
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} transactions`} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-sm mr-1"></span>
                    <span className="text-xs">Successful</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-sm mr-1"></span>
                    <span className="text-xs">Failed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-amber-500 rounded-sm mr-1"></span>
                    <span className="text-xs">Pending</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Transactions */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <p className="text-sm text-muted-foreground">Latest payment activities</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin/payments/transactions">
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions found for the selected period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.reference} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={
                            transaction.operator === 'MTN' ? 'bg-amber-100 text-amber-800' : 
                            'bg-orange-100 text-orange-800'
                          }>
                            {transaction.operator === 'MTN' ? 'MTN' : 'OM'}
                          </AvatarFallback>
                          <AvatarImage 
                            src={`/images/${transaction.operator.toLowerCase()}.png`} 
                            alt={transaction.operator} 
                          />
                        </Avatar>
                        <div className="ml-4">
                          <p className="text-sm font-medium">{transaction.phone_number}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy - HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="mr-4 text-right">
                          <p className="text-sm font-semibold">{formatCurrency(transaction.amount)}</p>
                          <p className="text-xs">{transaction.code}</p>
                        </div>
                        
                        <Badge variant={
                          transaction.status === 'SUCCESSFUL' ? 'default' : 
                          transaction.status === 'FAILED' ? 'destructive' : 
                          'secondary'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
