"use client"

import { listTransactions } from "@/actions/payments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Loader2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, addDays } from "date-fns"

export default function TransactionsPage() {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Manage and monitor all payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}