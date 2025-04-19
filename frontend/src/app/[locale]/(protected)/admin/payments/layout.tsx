import React from "react";
import PaymentSidebar from "./_component/Sidebar";

function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full">
      <div className="flex gap-3">
        <div className="hidden md:block w-64 shrink-0">
          <PaymentSidebar />
        </div>
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

export default PaymentLayout;
