"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, Layers, Box } from 'lucide-react'

function PaymentSidebar() {
  const pathname = usePathname()

  const isActiveLink = (path: string) => {
    return pathname.includes(path)
  }
  
  return (
    <div className="flex flex-row md:flex-col gap-2 md:gap-3 w-full p-2 md:p-0">
      <Link 
        href="/admin/payments/plans" 
        className={`flex items-center justify-center md:justify-start gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-100 transition-all flex-1 md:flex-none text-sm md:text-base ${
          isActiveLink('/plans') ? 'bg-gray-100 text-blue-600' : 'text-gray-700'
        }`}
      >
        <Box size={18} className="md:w-5 md:h-5" />
        <span className="hidden md:inline">Plans</span>
        <span className="md:hidden">Plans</span>
      </Link>

      <Link 
        href="/admin/payments/subscriptions" 
        className={`flex items-center justify-center md:justify-start gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-100 transition-all flex-1 md:flex-none text-sm md:text-base ${
          isActiveLink('/subscriptions') ? 'bg-gray-100 text-blue-600' : 'text-gray-700'
        }`}
      >
        <Layers size={18} className="md:w-5 md:h-5" />
        <span className="hidden md:inline">Subscriptions</span>
        <span className="md:hidden">Subs</span>
      </Link>

      <Link 
        href="/admin/payments/transactions" 
        className={`flex items-center justify-center md:justify-start gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-100 transition-all flex-1 md:flex-none text-sm md:text-base ${
          isActiveLink('/transactions') ? 'bg-gray-100 text-blue-600' : 'text-gray-700'
        }`}
      >
        <CreditCard size={18} className="md:w-5 md:h-5" />
        <span className="hidden md:inline">Transactions</span>
        <span className="md:hidden">Trans</span>
      </Link>
    </div>
  )
}

export default PaymentSidebar