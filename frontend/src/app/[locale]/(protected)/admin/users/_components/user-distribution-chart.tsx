"use client";

import { getUserStats } from "@/actions/accounts";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/locales/client";
import { useSearchParams } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TooltipProps } from 'recharts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChartIcon } from "lucide-react";

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white border border-gray-200 p-3 rounded-md shadow-md">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <div className="flex items-center mt-1">
          <div 
            className="h-3 w-3 rounded-full mr-2" 
            style={{ backgroundColor: payload[0].payload.color }}
          />
          <p className="font-medium">
            {`${payload[0].value} users`} 
            <span className="text-gray-500 ml-1">
              ({Math.round((payload[0].value / payload[0].payload.total) * 100)}%)
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const UserDistributionChart = () => {
  const t = useI18n();
  const searchParams = useSearchParams();
  const currentUserType = searchParams?.get("type") || "all";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => getUserStats(),
  });

  const getChartData = () => {
    if (!stats) return [];
    
    const total = stats.total_users;
    return [
      { 
        name: t('users.students'), 
        value: stats.total_students, 
        color: "#10B981",
        total 
      },
      { 
        name: t('users.professionals'), 
        value: stats.total_professionals, 
        color: "#F59E0B",
        total 
      },
      { 
        name: t('users.admins'), 
        value: stats.total_admins, 
        color: "#EF4444",
        total 
      },
    ];
  };

  // Don't show the chart if we're filtering by a specific user type
  if (currentUserType !== "all") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm mb-4">
        <div className="px-4 py-3 border-b">
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[250px] mt-1" />
        </div>
        <div className="p-4">
          <div className="flex">
            <Skeleton className="h-[300px] w-1/2 rounded-lg" />
            <div className="w-1/2 pl-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-[140px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <Accordion type="single" collapsible className="bg-white rounded-lg border shadow-sm mb-4" defaultValue="userDistribution">
      <AccordionItem value="userDistribution" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
          <div className="flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-lg font-medium">{t('users.distribution') || 'User Distribution'}</h3>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <p className="text-sm text-gray-500 mb-4">
            {t('users.distributionDescription') || 'Distribution of users across different user types'}
          </p>
          
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    animationDuration={800}
                    animationBegin={300}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="transparent"
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

            <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
              <h4 className="font-medium text-gray-800 mb-4">{t('users.summary') || 'User Summary'}</h4>
              
              <div className="space-y-4">
                {chartData.map((entry, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                      <h5 className="font-medium">{entry.name}</h5>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <p>{t('users.count') || 'Count'}: <span className="font-medium text-gray-900">{entry.value}</span></p>
                      <p>{t('users.percentage') || 'Percentage'}: <span className="font-medium text-gray-900">
                        {Math.round((entry.value / entry.total) * 100)}%
                      </span></p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${Math.round((entry.value / entry.total) * 100)}%`,
                          backgroundColor: entry.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t('users.total') || 'Total Users'}</span>
                    <span className="font-bold text-lg">{stats?.total_users || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default UserDistributionChart;
