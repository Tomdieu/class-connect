"use client"
import { getUsers } from "@/actions/accounts";
import { DataTable } from "@/components/dashboard/global/DataTable";
import CustomPagination from "@/components/dashboard/global/Pagination";
import { UserParams, UserType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { userColumns } from "./_components/columns";
import { useI18n } from '@/locales/client';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { Skeleton } from "@/components/ui/skeleton";

function UserTable() {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const userType = searchParams.get("type") || "all";
  const subscriptionStatus = searchParams.get("subscription") || "all";
  const subscriptionPlan = searchParams.get("subscription_plan") || "";
  
  // Education level filters
  const educationLevel = searchParams.get("education_level") || "";
  const collegeClass = searchParams.get("college_class") || "";
  const lyceeClass = searchParams.get("lycee_class") || "";
  const lyceeSpeciality = searchParams.get("lycee_speciality") || "";
  const universityLevel = searchParams.get("university_level") || "";
  const universityYear = searchParams.get("university_year") || "";
  
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "users", 
      "page", page, 
      "type", userType, 
      "subscription", subscriptionStatus,
      "subscription_plan", subscriptionPlan,
      "education_level", educationLevel,
      "college_class", collegeClass,
      "lycee_class", lyceeClass,
      "lycee_speciality", lyceeSpeciality,
      "university_level", universityLevel,
      "university_year", universityYear
    ],
    queryFn: () => {
      // Create params object with correct boolean flags based on user type and subscription status
      const params: UserParams = { page: Number(page) };
      
      // Handle user type filters
      if (userType === "student") {
        params.is_student = true;
      } else if (userType === "professional") {
        params.is_professional = true;
      } else if (userType === "admin") {
        params.is_admin = true;
      }
      
      // Handle subscription status filters
      if (subscriptionStatus === "active") {
        params.has_subscription = true;
      } else if (subscriptionStatus === "expiring") {
        params.subscription_expiring = true;
      } else if (subscriptionStatus === "expired") {
        params.subscription_expired = true;
      }
      
      // Handle subscription plan filter
      if (subscriptionPlan && ["BASIC", "STANDARD", "PREMIUM"].includes(subscriptionPlan)) {
        params.subscription_plan = subscriptionPlan as "BASIC" | "STANDARD" | "PREMIUM";
      }
      
      // Handle education level filters
      if (educationLevel) {
        params.education_level = educationLevel;
        
        // Add specific education level filters
        if (educationLevel === "COLLEGE" && collegeClass) {
          params.college_class = collegeClass;
        } 
        else if (educationLevel === "LYCEE") {
          if (lyceeClass) params.lycee_class = lyceeClass;
          if (lyceeSpeciality) params.lycee_speciality = lyceeSpeciality;
        } 
        else if (educationLevel === "UNIVERSITY") {
          if (universityLevel) params.university_level = universityLevel;
          if (universityYear) params.university_year = universityYear;
        }
      }
      
      return getUsers({ params });
    },
  });

  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (data) {
      setUsers(data);
    }
  }, [data]);

  const handleFilter = (value: string) => {
    if (value) {
      const _usersToDisplay = data?.filter(
        (user) =>
          user.first_name?.toLocaleLowerCase().includes(value.toLowerCase()) ||
          user.last_name?.toLocaleLowerCase().includes(value.toLowerCase()) ||
          user.email?.toLocaleLowerCase().includes(value.toLowerCase())
      );
      setUsers(_usersToDisplay!);
    } else {
      if (data) {
        setUsers(data);
      }
    }
  };

  const handleRowClick = (row: UserType) => {
    console.log("Row clicked:", row.id); // Debug log
    router.push(`/admin/users/${row.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        {/* Skeleton for search input */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        
        {/* Skeleton for table header */}
        <div className="rounded-md border">
          <div className="border-b h-12 bg-gray-50 flex items-center px-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-24 mx-4" />
            ))}
          </div>
          
          {/* Skeleton for table rows */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center h-16 px-4 border-b last:border-0">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-5 w-full mx-4" />
              ))}
              <div className="flex space-x-2 ml-auto">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Skeleton for pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Skeleton className="h-10 w-[300px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <p>{t('users.error')}</p>;
  }

  if (data) {
    return (
      <div className="space-y-4 w-full overflow-x-auto">
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 rounded-t-lg border border-b-0 border-gray-200">
          <p>Click on any row to view user details</p>
        </div>
        <DataTable 
          onChange={handleFilter} 
          columns={userColumns} 
          data={users}
          onRowClick={handleRowClick}
          rowClassName="cursor-pointer hover:bg-blue-50 transition-colors"
        />
        <DeleteConfirmationModal />
      </div>
    );
  }
  return null;
}

export default UserTable;
