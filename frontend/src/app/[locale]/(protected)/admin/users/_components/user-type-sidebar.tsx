"use client";

import { getUserStats } from "@/actions/accounts";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/locales/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Custom tooltip component for the pie chart
import { TooltipProps } from 'recharts';

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          {`${payload[0].value} users`} 
          <span className="inline-block ml-2 w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></span>
        </p>
      </div>
    );
  }
  return null;
};

const UserTypeSidebar = () => {
  const t = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUserType = searchParams.get("type") || "all";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => getUserStats(),
  });

  const userTypes = [
    { id: "all", label: t('users.all') || "All Users", color: "#4F46E5" },
    { id: "student", label: t('users.students') || "Students", color: "#10B981" },
    { id: "professional", label: t('users.professionals') || "Professionals", color: "#F59E0B" },
    { id: "admin", label: t('users.admins') || "Admins", color: "#EF4444" },
  ];

  const createQueryString = (type: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", type);
    params.delete("page"); // Reset pagination when changing filters
    return params.toString();
  };

  const getChartData = () => {
    if (!stats) return [];
    
    return [
      { name: t('users.students'), value: stats.total_students, color: "#10B981" },
      { name: t('users.professionals'), value: stats.total_professionals, color: "#F59E0B" },
      { name: t('users.admins'), value: stats.total_admins, color: "#EF4444" },
    ];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle>{t('users.statistics') || 'User Statistics'}</CardTitle>
          <CardDescription>{t('users.distribution') || 'User distribution by type'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="transparent"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-2 grid grid-cols-1 gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#10B981]" />
                <span className="text-sm">{t('users.students') || 'Students'}</span>
              </div>
              <span className="font-medium">{stats?.total_students || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                <span className="text-sm">{t('users.professionals') || 'Professionals'}</span>
              </div>
              <span className="font-medium">{stats?.total_professionals || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#EF4444]" />
                <span className="text-sm">{t('users.admins') || 'Admins'}</span>
              </div>
              <span className="font-medium">{stats?.total_admins || 0}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t mt-2">
              <span className="font-medium">{t('users.total') || 'Total'}</span>
              <span className="font-medium">{stats?.total_users || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {userTypes.map((type) => (
          <Link
            href={`${pathname}?${createQueryString(type.id)}`}
            key={type.id}
            className={`flex items-center justify-between p-3 rounded-md transition-colors ${
              currentUserType === type.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <div className="flex items-center">
              <div
                className="h-3 w-3 rounded-full mr-3"
                style={{ backgroundColor: type.color }}
              ></div>
              <span>{type.label}</span>
            </div>
            <span className="font-medium">
              {type.id === "all"
                ? stats?.total_users
                : type.id === "student"
                ? stats?.total_students
                : type.id === "professional"
                ? stats?.total_professionals
                : stats?.total_admins}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserTypeSidebar;
