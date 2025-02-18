"use client"
import { getUsers } from "@/actions/accounts";
import { DataTable } from "@/components/dashboard/global/DataTable";
import CustomPagination from "@/components/dashboard/global/Pagination";
import { UserType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { userColumns } from "./_components/columns";

function UserTable() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "page", page],
    queryFn: () => getUsers({ page }),
  });

  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (data) {
      setUsers(data);
    }
  }, [data]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error</p>;
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
      <div className="space-y-4">
        <DataTable onChange={handleFilter} columns={userColumns} data={users} />
        {/* {d > 1 && (
          <CustomPagination
            onPageChange={() => {}}
            itemsPerPage={25}
            currentPage={parseInt(page)}
            pagination={data}
          />
        )} */}
      </div>
    );
  }
  return null;
}

export default UserTable;
