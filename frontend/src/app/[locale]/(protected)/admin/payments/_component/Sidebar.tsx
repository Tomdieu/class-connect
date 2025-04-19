"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, Layers, Box, Receipt, ArrowUpDown, PieChart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/locales/client'

const navItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 }
};

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function PaymentSidebar() {
  const pathname = usePathname()
  const t = useI18n()
  
  const isActiveLink = (path: string) => {
    return pathname.includes(path)
  }
  
  const navItems = [
    {
      href: "/admin/payments/plans",
      icon: <Box className="h-5 w-5" />,
      label: "Plans",
      shortLabel: "Plans",
      description: t("plans.description")
    },
    {
      href: "/admin/payments/subscriptions",
      icon: <Layers className="h-5 w-5" />,
      label: "Subscriptions",
      shortLabel: "Subs",
      description: t("subscriptionsPage.description")
    },
    {
      href: "/admin/payments/transactions",
      icon: <CreditCard className="h-5 w-5" />,
      label: "Transactions",
      shortLabel: "Trans",
      description: "Manage and monitor all payment transactions"
    },
    {
      href: "/admin/payments/analytics",
      icon: <PieChart className="h-5 w-5" />,
      label: "Analytics",
      shortLabel: "Stats",
      description: "Payment statistics and insights"
    },
  ]
  
  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className="flex flex-row md:flex-col gap-3 w-full p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-primary/10 shadow-sm"
    >
      <div className="hidden md:flex items-center mb-3 pl-3">
        <div className="bg-primary/10 p-2 rounded-full mr-2">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-bold text-gray-800">Payment Hub</h3>
      </div>

      <div className="hidden md:block h-px bg-gray-200 mb-3"></div>
      
      {navItems.map((item, index) => (
        <motion.div 
          key={item.href} 
          variants={navItemVariants}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link 
            href={item.href}
            className={`flex items-center justify-center md:justify-start gap-2 p-3 rounded-lg transition-all duration-200 flex-1 md:flex-none text-sm md:text-base relative group ${
              isActiveLink(item.href) 
                ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-medium shadow-sm' 
                : 'text-gray-700 hover:bg-primary/5'
            }`}
          >
            <div className={`${isActiveLink(item.href) ? 'text-primary' : 'text-gray-500 group-hover:text-primary transition-colors'}`}>
              {item.icon}
            </div>
            
            <div className="hidden md:block flex-1">
              <span className={`transition-colors ${isActiveLink(item.href) ? 'text-primary' : 'group-hover:text-primary/90'}`}>
                {item.label}
              </span>
              {isActiveLink(item.href) && (
                <p className="text-xs text-primary/80 mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>
            
            <span className="md:hidden">{item.shortLabel}</span>
            
            {isActiveLink(item.href) && (
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                layoutId="activeIndicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        </motion.div>
      ))}

      <div className="hidden md:block h-px bg-gray-200 my-3"></div>

      {/* <div className="hidden md:block p-4 bg-primary/5 rounded-lg border border-primary/10 mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpDown className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm text-gray-800">Payment Stats</h4>
        </div>
        <p className="text-xs text-gray-600 mb-2">Manage subscriptions and track your revenue</p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white p-2 rounded-lg">
            <div className="text-lg font-bold text-primary">86%</div>
            <div className="text-xs text-gray-500">Completion</div>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <div className="text-lg font-bold text-primary">324</div>
            <div className="text-xs text-gray-500">Transactions</div>
          </div>
        </div>
      </div> */}
    </motion.div>
  )
}

export default PaymentSidebar