import { Button } from '@/components/ui/button';
import React from 'react'
import { FaGraduationCap } from "react-icons/fa6";
import { FaTasks } from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa";


function DashboardPage() {
  return (
    <div className='w-full h-full flex-1 container px-8 sm:mx-auto py-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        <div className='rounded-md bg-indigo-500 flex items-center justify-center flex-col gap-2 p-3'>
          <div className='bg-indigo-300 p-2 rounded-full'>
            <FaGraduationCap className='size-7 text-white' />
          </div>
          <h1 className='font-bold text-xl text-white'>MES ELEVES</h1>
          <Button variant={"outline"}>Consulter</Button>
        </div>
        <div className='rounded-md bg-indigo-400 flex items-center justify-center flex-col gap-2 p-3'>
          <div className='bg-indigo-200 p-2 rounded-full'>
            <FaTasks className='size-7 text-black' />
          </div>
          <h1 className='font-bold text-xl text-white'>MES OFFRES DE COURS</h1>
          <Button variant={"outline"}>Visualiser</Button>
        </div>
        <div className='rounded-md bg-sky-300 flex items-center justify-center flex-col gap-2 p-3'>
          <div className='bg-sky-100 p-2 rounded-full'>
            <FaCalendarCheck className='size-7 text-black' />
          </div>
          <h1 className='font-bold text-xl text-white'>MES OFFRES DE COURS</h1>
          <Button variant={"outline"}>Actualiser</Button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
