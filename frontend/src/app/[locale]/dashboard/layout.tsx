import DashboardHeader from '@/components/dashboard/global/DashboardHeader'
import DashboardSidebar from '@/components/dashboard/user/DashboardSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function DashboardLayout({children}:React.PropsWithChildren) {
  return (
    <SidebarProvider aria-describedby="dashboard-layout">

      <div className='w-full h-full flex'>
        <DashboardSidebar />
        <main className='flex flex-col h-full w-full relative'>
          <DashboardHeader />
          {children}
        </main>

      </div>
    </SidebarProvider>
  )
}
