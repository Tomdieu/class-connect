"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onChange?: (value: string) => void;
  onRowSelect?: (rows: object) => void;
  showInput?: boolean;
  query?: string;
  inputProps?: React.ComponentProps<"input">;
  onRowClick?: (row: TData) => void;
  rowClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onChange,
  onRowSelect,
  showInput = true,
  query = "",
  inputProps,
  onRowClick,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    if (onRowSelect) {
      onRowSelect(rowSelection);
    }
  }, [rowSelection, onRowSelect]);

  const [value, setValue] = useState(query);

  // Improved function to handle row clicks
  const handleRowClick = (event: React.MouseEvent, row: TData) => {
    if (!onRowClick) return;

    // Only block clicks on specific interactive elements
    const target = event.target as HTMLElement;
    const clickedElement = target.tagName.toLowerCase();
    const closestButton = target.closest("button");
    const closestA = target.closest("a");
    const closestInput = target.closest("input, select, textarea");

    // If clicked directly on or inside an interactive element, don't trigger row click
    if (
      clickedElement === "button" ||
      clickedElement === "a" ||
      clickedElement === "input" ||
      closestButton ||
      closestA ||
      closestInput ||
      // Special case for dropdown triggers and checkboxes
      target.closest('[data-state="open"]') ||
      target.closest('[role="checkbox"]')
    ) {
      return;
    }

    // Safe to proceed with row click
    console.log("Row click detected, navigating...");
    onRowClick(row);
  };

  return (
    <div className="rounded-md border p-3 w-full">
      <div className="flex flex-col sm:flex-row space-y-2 items-center py-4">
        {showInput && (
          <Input
            placeholder="Search all"
            value={value}
            type="search"
            onChange={(event) => {
              setValue(event.target.value.toLocaleLowerCase());
              if (onChange) {
                onChange(event.target.value.toLocaleLowerCase());
              }
            }}
            className="max-w-sm"
            {...inputProps}
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => handleRowClick(e, row.original)}
                  className={
                    onRowClick
                      ? `${rowClassName || "cursor-pointer hover:bg-muted/50"} relative`
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  {onRowClick && (
                    <div className="absolute inset-0 z-0" aria-hidden="true" />
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
