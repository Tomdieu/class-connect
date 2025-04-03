"use client";

import { useI18n } from "@/locales/client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreditCard, Calendar, AlertCircle, CheckCircle2, Crown, Star, Award } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const SubscriptionFilters = () => {
  const t = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const subscriptionStatus = searchParams.get("subscription") || "all";
  const subscriptionPlan = searchParams.get("subscription_plan") || "all";
  const userType = searchParams.get("type") || "all";

  const [activeTab, setActiveTab] = useState("status");
  
  // Only show subscription filters for student or professional user types
  if (userType !== "student" && userType !== "professional") {
    return null;
  }
  
  const statusFilters = [
    { 
      label: "All Subscriptions", 
      value: "all", 
      icon: CreditCard,
      description: "View users with any subscription status" 
    },
    { 
      label: "Active Subscriptions", 
      value: "active", 
      icon: CheckCircle2,
      description: "Users with current subscriptions",
      color: "text-green-500" 
    },
    { 
      label: "Expiring Soon", 
      value: "expiring", 
      icon: Calendar,
      description: "Subscriptions about to expire",
      color: "text-amber-500"
    },
    { 
      label: "Expired", 
      value: "expired", 
      icon: AlertCircle,
      description: "Users with expired subscriptions",
      color: "text-red-500"
    },
  ];

  const planFilters = [
    { 
      label: "All Plans", 
      value: "all", 
      icon: CreditCard,
      description: "View users with any subscription plan" 
    },
    { 
      label: "Basic Plan", 
      value: "BASIC", 
      icon: Star,
      description: "Basic subscription tier",
      color: "text-blue-500" 
    },
    { 
      label: "Standard Plan", 
      value: "STANDARD", 
      icon: Award,
      description: "Standard subscription tier",
      color: "text-indigo-500"
    },
    { 
      label: "Premium Plan", 
      value: "PREMIUM", 
      icon: Crown,
      description: "Premium subscription tier",
      color: "text-amber-500"
    },
  ];


  // Update URL when tab changes
  const createQueryString = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Process each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // Reset pagination when changing filters
    newParams.set("page", "1");
    
    return newParams.toString();
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <h3 className="text-lg font-medium mb-2 sm:mb-0">{t('subscription.filters')}</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="plan">Plan Type</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {activeTab === "status" ? (
        <div className="flex flex-wrap gap-3">
          {statusFilters.map((filter) => {
            const isActive = subscriptionStatus === filter.value;
            
            return (
              <Link
                key={filter.value}
                href={`${pathname}?${createQueryString({ 
                  subscription: filter.value,
                  // Don't reset plan filter when changing status
                  subscription_plan: searchParams.get("subscription_plan") || null
                })}`}
                className={cn(
                  "flex-1 min-w-[140px] flex flex-col items-center p-3 rounded-lg transition-all border",
                  isActive 
                    ? "bg-primary/10 border-primary shadow-sm" 
                    : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                )}
              >
                <filter.icon 
                  className={cn(
                    "h-5 w-5 mb-1", 
                    isActive ? "text-primary" : filter.color || "text-gray-500"
                  )} 
                />
                <span className={cn(
                  "font-medium text-sm", 
                  isActive ? "text-primary" : "text-gray-700"
                )}>
                  {filter.label}
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  {filter.description}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {planFilters.map((filter) => {
            const isActive = subscriptionPlan === filter.value;
            
            return (
              <Link
                key={filter.value}
                href={`${pathname}?${createQueryString({ 
                  subscription_plan: filter.value === "all" ? null : filter.value,
                  // Don't reset status filter when changing plan
                  subscription: searchParams.get("subscription") || null
                })}`}
                className={cn(
                  "flex-1 min-w-[140px] flex flex-col items-center p-3 rounded-lg transition-all border",
                  isActive 
                    ? "bg-primary/10 border-primary shadow-sm" 
                    : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                )}
              >
                <filter.icon 
                  className={cn(
                    "h-5 w-5 mb-1", 
                    isActive ? "text-primary" : filter.color || "text-gray-500"
                  )} 
                />
                <span className={cn(
                  "font-medium text-sm", 
                  isActive ? "text-primary" : "text-gray-700"
                )}>
                  {filter.label}
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  {filter.description}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubscriptionFilters;
