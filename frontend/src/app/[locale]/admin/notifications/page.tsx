"use client";
import { deleteNotification, listNotifications, readNotification } from "@/actions/notifications";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/locales/client";
import { NotificationType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Bell, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils/date";

type GroupedNotifications = {
  [key: string]: NotificationType[];
};

function NotificationsPage() {
  const t = useI18n();
  const { locale } = useParams<{locale: string}>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationType | null>(null);
  const queryClient = useQueryClient();

  // Use React Query to fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    onError: () => {
      toast.error(t("notifications.error"));
    }
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => readNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Update notification in cache
      queryClient.setQueryData(['notifications'], (oldData: NotificationType[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
      });
    },
    onError: () => {
      toast.error(t("notifications.readError"));
    }
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
      toast.success(t("notifications.deleteSuccess"));
      setDeleteModalOpen(false);
      setSelectedNotification(null);
    },
    onError: () => {
      toast.error(t("notifications.deleteError"));
    }
  });

  const handleNotificationClick = async (notification: NotificationType) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    deleteMutation.mutate(selectedNotification.id);
  };

  const groupNotificationsByDate = (notifications: NotificationType[]): GroupedNotifications => {
    return notifications.reduce((groups, notification) => {
      const date = formatDate(notification.created_at, locale);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {} as GroupedNotifications);
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="container w-full mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          {t("notifications.title")}
        </h1>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
        {Object.keys(groupedNotifications).length > 0 ? (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date} className="mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-3">{date}</h2>
              <div className="space-y-3">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative group rounded-xl border p-4 transition-all hover:shadow-md ${
                      notification.read ? "bg-white" : "bg-blue-50"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {formatDate(notification.created_at, locale)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotification(notification);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {t("notifications.empty")}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t("notifications.emptyDescription")}
            </p>
          </div>
        )}
      </ScrollArea>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedNotification(null);
        }}
        onConfirm={handleDelete}
        title={t("notifications.deleteTitle")}
        description={t("notifications.deleteDescription")}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default NotificationsPage;