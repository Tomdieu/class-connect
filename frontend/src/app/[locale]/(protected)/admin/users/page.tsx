import React from "react";
import UserTable from "./user-table";

async function UsersPage() {
  return (
    <div className="flex w-full flex-col gap-5 px-2 sm:container pt-10 overflow-x-auto">
      <UserTable />
    </div>
  );
}

export default UsersPage;
