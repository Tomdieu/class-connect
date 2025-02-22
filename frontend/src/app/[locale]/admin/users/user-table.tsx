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

function UserTable() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "page", page],
    queryFn: () => getUsers({ params: {page} }),
    initialData: [], // Provide initial data as empty array
  });

  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (data) {
      setUsers(data);
    }
  }, [data]);

  if (isLoading) {
    return <p>{t('users.loading')}</p>;
  }

  if (isError) {
    return <p>{t('users.error')}</p>;
  }

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

  if (data) {
    return (
      <div className="space-y-4 w-full">
        <DataTable onChange={handleFilter} columns={userColumns} data={users} />
        <DeleteConfirmationModal />
      </div>
    );
  }
  return null;
}

export default UserTable;
