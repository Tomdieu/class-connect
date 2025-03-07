"use client"
import { getUsers } from "@/actions/accounts";
import { DataTable } from "@/components/dashboard/global/DataTable";
import CustomPagination from "@/components/dashboard/global/Pagination";
import { UserType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { userColumns } from "./_components/columns";
import { useI18n } from '@/locales/client';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { Skeleton } from "@/components/ui/skeleton";

function UserTable() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "page", page],
    queryFn: () => getUsers({ params: {page} }),
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
          user.first_name?.toLocaleLowerCase().includes(value) ||
          user.last_name?.toLocaleLowerCase().includes(value) ||
          user.email?.toLocaleLowerCase().includes(value)
      );
      setUsers(_usersToDisplay!);
    } else {
      if (data) {
        setUsers(data);
      }
    }
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
      <div className="space-y-4 w-full overflow-x-auto w-full">
        <DataTable onChange={handleFilter} columns={userColumns} data={users} />
        <DeleteConfirmationModal />
      </div>
    );
  }
  return null;
}

export default UserTable;
