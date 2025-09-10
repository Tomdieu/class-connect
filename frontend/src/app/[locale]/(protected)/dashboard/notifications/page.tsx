"use client";
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteNotification, listNotifications } from "@/actions/notifications";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Bell, 
  Eye,
  Clock,
  ChevronsUpDown, 
  X,
  CalendarClock
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import { NotificationType } from "@/types";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
  CredenzaClose,
} from "@/components/ui/credenza";

function NotificationsContent() {
  const t = useI18n();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationType | null>(null);

  const { isPending, error, data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });

    // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (notificationId: number) => deleteNotification(Number(notificationId.toString())),
    onSuccess: (_, notificationId) => {
      // Remove notification from cache
      queryClient.setQueryData(['notifications'], (oldData: NotificationType[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(n => n.id !== Number(notificationId));
      });
      toast.success(t("notifications.deleteSuccess") || "Notification deleted successfully");
      setDeleteModalOpen(false);
      setSelectedNotification(null);
    },
    onError: () => {
      toast.error(t("notifications.deleteError") || "Failed to delete notification");
    }
  });

  const handleDelete = async () => {
    if (!selectedNotification) return;
    deleteMutation.mutate(Number(selectedNotification.id.toString()));
  };

  if (isPending)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-4">{t("notifications.title") || "Notifications"}</h1>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="w-[450px]"><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
    
  if (error)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-4">{t("notifications.title") || "Notifications"}</h1>
        <Card className="border border-red-500 bg-red-50/30 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <Bell className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-700">{t("notifications.error") || "Error Loading Notifications"}</h2>
              <p className="mt-1 text-red-600 text-sm">
                {(error as any).message || t("notifications.errorMessage") || "An unexpected error occurred while fetching your notifications."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">{t("notifications.title") || "Notifications"}</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5">
          {notifications.length} {notifications.length === 1 
            ? (t("notifications.singleCount") || "notification") 
            : (t("notifications.pluralCount") || "notifications")}
        </Badge>
      </div>

      {notifications.length > 0 ? (
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] font-medium">
                  <div className="flex items-center gap-1">
                    {t("notifications.titleHeader") || "Title"}
                    <ChevronsUpDown className="h-3 w-3 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-medium">
                  <div className="flex items-center gap-1">
                    {t("notifications.messageHeader") || "Message"}
                  </div>
                </TableHead>
                <TableHead className="font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 opacity-70" />
                    {t("notifications.dateHeader") || "Date"}
                  </div>
                </TableHead>
                <TableHead className="w-[80px] text-right">
                  <span className="sr-only">{t("notifications.actions") || "Actions"}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification: NotificationType) => (
                <TableRow 
                  key={notification.id} 
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedNotification(notification);
                    setViewModalOpen(true);
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Bell className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="line-clamp-1">{notification.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-muted-foreground">{notification.message}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          setSelectedNotification(notification);
                          setViewModalOpen(true);
                        }}
                        aria-label={t("notifications.view") || "View notification"}
                      >
                        <Eye className="h-4 w-4 text-gray-500 hover:text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          setSelectedNotification(notification);
                          setDeleteModalOpen(true);
                        }}
                        aria-label={t("notifications.delete") || "Delete notification"}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-lg p-12 text-center bg-muted/30">
          <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-muted-foreground/70 mb-1">
            {t("notifications.emptyTitle") || "No Notifications"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t("notifications.empty") || "You don't have any notifications at the moment."}
          </p>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedNotification(null);
        }}
        onConfirm={handleDelete}
        title={t("notifications.deleteTitle") || "Delete Notification"}
        description={t("notifications.deleteDescription") || "Are you sure you want to delete this notification?"}
        isLoading={deleteMutation.isPending}
      />

      {/* Credenza for viewing full notification */}
      <Credenza open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <CredenzaContent className="sm:max-w-[500px]">
          <CredenzaHeader>
            <CredenzaTitle className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              {selectedNotification?.title || "Notification Details"}
            </CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody className="space-y-4 py-4">
            {selectedNotification && (
              <>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">{t("notifications.messageLabel") || "Message"}</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md border">
                    {selectedNotification.message}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    <span>{new Date(selectedNotification.created_at).toLocaleString()}</span>
                  </div>
                  
                  {selectedNotification.read ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t("notifications.read") || "Read"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {t("notifications.unread") || "Unread"}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CredenzaBody>
          <CredenzaFooter className="flex justify-between">
            <CredenzaClose asChild>
              <Button variant="outline">
                {t("notifications.close") || "Close"}
              </Button>
            </CredenzaClose>
            <Button 
              variant="destructive"
              onClick={() => {
                setViewModalOpen(false);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("notifications.delete") || "Delete"}
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </div>
  );
}

export default NotificationsContent;