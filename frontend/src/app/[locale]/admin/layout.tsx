import { AdminSidebar } from '@/components/dashboard/admin/AdminSidebar'
import DashboardHeader from '@/components/dashboard/global/DashboardHeader'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function AdminLayout({children}:React.PropsWithChildren) {
  return (
    <SidebarProvider aria-describedby="dashboard-layout">

      <div className='w-full h-full flex'>
        <AdminSidebar />
        <main className='flex flex-col h-full w-full relative'>
          <DashboardHeader />
          {children}
        </main>

      </div>
    </SidebarProvider>
  )
}
