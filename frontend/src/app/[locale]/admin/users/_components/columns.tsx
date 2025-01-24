/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Button } from "@/components/ui/button";
import { UserType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { formatTimeSince } from "@/lib/timeSince";

import { MoreHorizontal, RefreshCw, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/hooks/user-store";
// import toast from "react-hot-toast";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const userColumns: ColumnDef<UserType>[] = [
  {
    id: "select",
    header({ table }) {
      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => (
      <div>
        {" "}
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="w-4 h-4"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    id: "first_name",

    header: "First Name",
    size:500,
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.first_name}</span>;
    },
  },
  {
    accessorKey: "last_name",
    id: "last_name",

    header: "Last name",
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.last_name}</span>;
    },
  },
  {
    accessorKey: "email",
    id: "email",

    header: "Email",
    cell: ({ row }) => {
      const user = row.original;
      return <a href={`mailto:${user.email}`}>{user.email}</a>;
    },
  },
  {
    accessorKey: "phone_number",
    id: "phone_number",

    header: "Phone Number",
    cell: ({ row }) => {
      const user = row.original;
      return <a href={`tel:${user.phone_number}`}>{user.phone_number}</a>;
    },
  },
  {
    accessorKey: "education_level",
    id: "education_level",

    header: "Education Level",
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.education_level}</span>;
    },
  },
  {
    id: "class",
    header: "Class",
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.lycee_class}</span>;
    },
  },
  {
    accessorKey: "date_joined",
    id: "date_joined",

    header: "Date Joined",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <p className="line-clamp-1 text-ellipsis">
          {formatTimeSince(user.date_joined)}
        </p>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const { setUser, onOpen } = useUserStore();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setUser(user);
                onOpen();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> <span>Update</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              <Trash className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
