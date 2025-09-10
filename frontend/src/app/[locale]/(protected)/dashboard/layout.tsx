"use client"
import DashboardHeader from '@/components/dashboard/global/DashboardHeader'
import DashboardSidebar from '@/components/dashboard/user/DashboardSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getUserRole } from '@/lib/utils'
import { UserType } from '@/types'
import { BookOpen, Loader2 } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  const { data: session, status } = useSession();
   // Show loading state only while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse">
        <BookOpen className="h-16 w-16 text-primary animate-bounce" strokeWidth={1.5} />
      </div>
    </div>
    );
  }

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
