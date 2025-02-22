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
import { useI18n } from "@/locales/client";
import toast from "react-hot-toast";
import { deleteUser } from "@/actions/accounts";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";

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
    header: ({ column }) => {
      const t = useI18n();
      return t("users.table.columns.firstName");
    },
    size: 500,
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.first_name}</span>;
    },
  },
  {
    accessorKey: "last_name",
    id: "last_name",
    header: ({ column }) => {
      const t = useI18n();
      return t("users.table.columns.lastName");
    },
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.last_name}</span>;
    },
  },
  {
    accessorKey: "email",
    id: "email",
    header: ({ column }) => {
      const t = useI18n();
      return t("users.table.columns.email");
    },
    cell: ({ row }) => {
      const user = row.original;
      return <a href={`mailto:${user.email}`}>{user.email}</a>;
    },
  },
  {
    accessorKey: "phone_number",
    id: "phone_number",
    header: ({ column }) => {
      const t = useI18n();
      return t("users.table.columns.phone");
    },
    cell: ({ row }) => {
      const user = row.original;
      return <a href={`tel:${user.phone_number}`}>{user.phone_number}</a>;
    },
  },
  {
    accessorKey: "education_level",
    id: "education_level",
    header: ({ column }) => {
      const t = useI18n();
      return t("users.table.columns.educationLevel");
    },
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.education_level}</span>;
    },
  },
  {
    id: "class",
    header: ({ column }) => {
      const t = useI18n();
      return t("users.table.columns.class");
    },
    cell: ({ row }) => {
      const user = row.original;
      return <span>{user.lycee_class}</span>;
    },
  },
  {
    accessorKey: "date_joined",
    id: "date_joined",
    header: ({ column }) => {
      const t = useI18n();
      return t("users.table.columns.dateJoined");
    },
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
      const t = useI18n();
      const user = row.original;
      const { setUser, onOpen } = useUserStore();
      const queryClient = useQueryClient();
      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);

      const handleDelete = async () => {
        try {
          setIsLoading(true);
          await deleteUser(user.id);
          await queryClient.invalidateQueries({ queryKey: ["users"] });
          toast.success(t("users.delete.success"));
          setIsDeleteModalOpen(false);
        } catch {
          toast.error(t("users.delete.error"));
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
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
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>{t("users.table.actions.update")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash className="w-4 h-4 mr-2" />
                {t("users.table.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title={t("users.delete.title")}
            description={t("users.delete.description")}
            isLoading={isLoading}
          />
        </>
      );
    },
  },
];
