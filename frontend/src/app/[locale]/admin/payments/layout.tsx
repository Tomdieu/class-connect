import React from "react";
import PaymentSidebar from "./_component/Sidebar";

function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={"flex flex-col md:flex-row h-full w-full gap-5 container mx-auto pt-6"}>
      <div className="w-full md:w-2/12">
        <PaymentSidebar />
      </div>
      <div className="w-full md:w-10/12">{children}</div>
    </div>
  );
}

export default PaymentLayout;
