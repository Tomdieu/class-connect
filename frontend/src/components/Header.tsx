"use client";
import { BookOpen, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { useAuthDialog } from '@/hooks/use-auth-dialog'
import { ModeToggle } from './ModeToggle';
import { useMediaQuery } from 'usehooks-ts'
import ChangeLanguage from './ChangeLanguage';

function Header() {
    const {openLogin,openRegister} = useAuthDialog()
    const isMobile = useMediaQuery('(max-width: 640px)')
  return (
    <div className='flex items-center justify-between py-5 px-5'>
        <Link href={"/"} className='select-none flex items-center gap-1 cursor-pointer text-blue-600'>
            <BookOpen className='size-8'/>
            <h1 className='font-black text-lg hidden sm:flex'>ClassConnect</h1>
        </Link>
        <div className='flex items-center gap-1 2xl:gap-5'>
            <Button size={isMobile ? "icon" :"default"} onClick={openLogin} className='bg-white text-black hover:text-blue-600 hover:bg-blue-100 border border-gray-200'>
                <LogIn/>
                <span className='hidden sm:flex'>Se Connecter</span>
            </Button>
            <Button size={isMobile ? "icon" :"default"} onClick={openRegister} className='bg-default text-sm hover:bg-default/80 text-white'>
                <UserPlus/>
                <span className='hidden sm:flex'>S&apos;inscrire</span>
            </Button>
            <ChangeLanguage/>
            {/* <ModeToggle/> */}
        </div>
    </div>
  )
}

export default Header