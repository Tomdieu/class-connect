import { AdminSidebar } from '@/components/dashboard/admin/AdminSidebar'
import DashboardHeader from '@/components/dashboard/global/DashboardHeader'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function AdminLayout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider aria-describedby="dashboard-layout">

      <div className='flex-1 h-full flex'>
        <AdminSidebar />
        <main className='flex w-full flex-col h-full relative gap-3'>
          <DashboardHeader />
          <div className='flex-1 flex flex-col h-full w-full overflow-y-auto'>
            {children}
          </div>
        </main>

      </div>
    </SidebarProvider>
  )
}
