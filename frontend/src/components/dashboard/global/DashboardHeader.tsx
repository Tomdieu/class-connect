"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { BookOpen, ChevronDown, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function DashboardHeader() {
    const { toggleSidebar } = useSidebar()
    return (
        <div className='sticky top-0 z-50 shadow-lg w-full flex items-center justify-between p-3'>
            <Link href={"/dashboard"} className='select-none flex items-center gap-1 cursor-pointer text-blue-600'>
                <BookOpen className='size-8' />
                <h1 className='font-black text-lg sm:text-lg'>ClassConnect</h1>
            </Link>
            <div className='flex items-center gap-2'>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='flex flex-col gap-0.5'>
                    <span className='text-muted-foreground text-xs'>Bonjour</span>
                    <div className='flex items-center gap-1'>
                        <span className='text-sm'>Ivantom</span>
                        <ChevronDown className='size-4' />
                    </div>
                </div>
                <div aria-labelledby='dashboard-sidebar' onClick={toggleSidebar} className='cursor-pointer'>

                    <MenuIcon className='size-8 text-muted-foreground' />
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader