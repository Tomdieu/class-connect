import { AdminSidebar } from '@/components/dashboard/admin/AdminSidebar'
import DashboardHeader from '@/components/dashboard/global/DashboardHeader'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function AdminLayout({ children }: React.PropsWithChildren) {
  return (
      <SidebarProvider aria-describedby="dashboard-layout" className="min-h-screen flex">
        <div className='flex flex-1 h-screen '>
          <AdminSidebar />
          <main className='flex flex-col flex-1 h-full '>
            <DashboardHeader />
            <div className='flex-1 overflow-y-auto '>
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
  )
}