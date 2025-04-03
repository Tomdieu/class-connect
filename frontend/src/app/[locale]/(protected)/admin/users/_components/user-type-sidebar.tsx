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
import { Users, GraduationCap, Briefcase, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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
    { 
      id: "all", 
      label: t('users.all') || "All Users", 
      color: "#4F46E5", 
      icon: Users 
    },
    { 
      id: "student", 
      label: t('users.students') || "Students", 
      color: "#10B981", 
      icon: GraduationCap 
    },
    { 
      id: "professional", 
      label: t('users.professionals') || "Professionals", 
      color: "#F59E0B", 
      icon: Briefcase 
    },
    { 
      id: "admin", 
      label: t('users.admins') || "Admins", 
      color: "#EF4444", 
      icon: ShieldCheck 
    },
  ];

  const createQueryString = (type: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", type);
    params.delete("page"); // Reset pagination when changing filters
    if (type !== "student" && type !== "professional") {
      params.delete("subscription"); // Remove subscription filter if not applicable
    }
    return params.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-[120px]" />
            <Skeleton className="h-4 w-[180px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[40px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[52px] w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardHeader className="pb-2 bg-gray-50 border-b">
          <CardTitle className="text-lg text-gray-800">
            {t('users.statistics') || 'User Statistics'}
          </CardTitle>
          <CardDescription>
            {t('users.userCounts') || 'User counts by type'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {userTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </div>
                <span className="font-medium text-gray-900">
                  {type.id === "all"
                    ? stats?.total_users
                    : type.id === "student"
                    ? stats?.total_students
                    : type.id === "professional"
                    ? stats?.total_professionals
                    : stats?.total_admins}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium text-gray-800">{t('users.filterByType') || 'Filter by type'}</h3>
        </div>
        <div className="p-2">
          {userTypes.map((type) => {
            const isActive = currentUserType === type.id;
            const Icon = type.icon;
            const count = type.id === "all"
              ? stats?.total_users
              : type.id === "student"
                ? stats?.total_students
                : type.id === "professional"
                  ? stats?.total_professionals
                  : stats?.total_admins;
                  
            return (
              <Link
                href={`${pathname}?${createQueryString(type.id)}`}
                key={type.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md mb-1 transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-gray-50 text-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1 rounded-md",
                    isActive ? "bg-primary-foreground/20" : "bg-gray-100"
                  )}>
                    <Icon 
                      size={18}
                      className={isActive ? "text-primary-foreground" : "text-gray-500"}
                    />
                  </div>
                  <span className={isActive ? "font-medium" : ""}>{type.label}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-sm font-medium",
                  isActive 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-gray-100 text-gray-700"
                )}>
                  {count || 0}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserTypeSidebar;
