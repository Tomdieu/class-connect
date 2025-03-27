import React from "react";
import UserTable from "./user-table";
import UserTypeSidebar from "./_components/user-type-sidebar";

async function UsersPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 lg:max-w-[300px]">
          <UserTypeSidebar />
        </div>
        <div className="w-full lg:flex-1">
          <UserTable />
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
