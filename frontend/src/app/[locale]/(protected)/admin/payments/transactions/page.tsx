"use client"

import { listTransactions } from "@/actions/payments"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { BookOpen, Loader2, Receipt } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, addDays } from "date-fns"
import { motion } from "framer-motion"
import { useI18n } from "@/locales/client"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function TransactionsPage() {
  const t = useI18n()
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [urlParams, setUrlParams] = useState<URLSearchParams>()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", pageIndex, pageSize, urlParams?.toString(), dateRange],
    queryFn: () =>
      listTransactions({
        params: {
          page: pageIndex + 1,
          page_size: pageSize,
          ...Object.fromEntries(urlParams?.entries() ?? []),
          created_at: dateRange ? {
            after: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
            before: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
          } : undefined,
        },
      }),
  })

  const handlePaginationChange = useCallback((newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }, [pageSize])

  const handleDateRangeChange = useCallback((newDateRange: DateRange | undefined) => {
    if (newDateRange?.from && newDateRange?.to) {
      setDateRange(newDateRange)
    } else if (!newDateRange) {
      setDateRange({
        from: addDays(new Date(), -30),
        to: new Date(),
      })
    }
  }, [])

  if (isLoading) {
    return (
      <motion.div 
        className="w-full flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 sm:px-8 py-10 bg-gradient-to-b from-primary/5 via-background to-background min-h-screen"
    >
      <motion.div 
        className="relative flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-primary/10 max-w-[2400px] mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
        
        <div className="flex items-center mb-4 sm:mb-0 relative z-10">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <Receipt className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-sm text-gray-600">Manage and monitor all payment transactions</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10 max-w-[2400px] mx-auto"
      >
        <motion.div
          variants={sectionVariants}
          className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-bl-full z-0"></div>
          <DataTable
            columns={columns}
            data={data?.results ?? []}
            total={data?.count ?? 0}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onPaginationChange={handlePaginationChange}
            onDateRangeChange={handleDateRangeChange}
            dateRange={dateRange}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}