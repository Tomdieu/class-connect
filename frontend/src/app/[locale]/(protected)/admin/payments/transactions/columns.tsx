"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Transaction } from "@/types"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string
      return (
        <Tooltip>
          <TooltipTrigger className="font-medium">
            {reference.slice(0, 8)}...
          </TooltipTrigger>
          <TooltipContent>
            <p>{reference}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "SUCCESSFUL"
              ? "success"
              : status === "PENDING"
              ? "secondary"
              : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "XAF",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "operator",
    header: "Operator",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "phone_number",
    header: "Phone Number",
  },
  {
    accessorKey: "endpoint",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("endpoint") as string
      return (
        <Badge variant="outline">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      return format(new Date(row.getValue("created_at")), "PPp")
    },
  },
]
