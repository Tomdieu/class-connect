"use client";
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteNotification, listNotifications } from "@/actions/notifications";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import { NotificationType } from "@/types";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";

function NotificationsContent() {
  const t = useI18n();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationType | null>(null);

  const { isPending, error, data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Remove notification from cache
      queryClient.setQueryData(['notifications'], (oldData: NotificationType[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(n => n.id !== notificationId);
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
    deleteMutation.mutate(selectedNotification.id);
  };

  if (isPending)
    return (
      <div className="container mx-auto p-6 space-y-4">
        {/* Skeleton placeholder simulating notification cards */}
        <Skeleton className="h-16 w-full rounded" />
        <Skeleton className="h-16 w-full rounded" />
        <Skeleton className="h-16 w-full rounded" />
      </div>
    );
    
  if (error)
    return (
      <div className="container mx-auto p-6">
        <Card className="border border-red-500 bg-red-50 p-4">
          <h2 className="text-xl font-semibold text-red-700">Error</h2>
          <p className="mt-2 text-red-600">
            {(error as any).message || "An unexpected error occurred."}
          </p>
        </Card>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-primary mb-4">{t("notifications.title") || "Notifications"}</h1>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification: NotificationType) => (
            <Card key={notification.id} className="border border-primary shadow-sm relative group">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{notification.title}</h2>
                    <p className="mt-2 text-gray-700">{notification.message}</p>
                    <span className="block mt-2 text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setSelectedNotification(notification);
                      setDeleteModalOpen(true);
                    }}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">{t("notifications.empty") || "No notifications available."}</p>
        )}
      </div>

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
    </div>
  );
}

export default NotificationsContent;