"use client";

import { markAllNotificationsAsRead, markNotificationAsRead } from "@/actions/forum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForumNotification, PostNotificationType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, MessageSquare, ThumbsUp, User } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ForumNotificationsProps {
  notifications: ForumNotification[];
  onNotificationRead?: () => void;
}

export default function ForumNotifications({ notifications, onNotificationRead }: ForumNotificationsProps) {
  const t = useI18n();
  const queryClient = useQueryClient();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Use TanStack Query for mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await markNotificationAsRead(id);
    },
    onSuccess: () => {
      // Invalidate and refetch notifications query
      queryClient.invalidateQueries({ queryKey: ['forumNotifications'] });
      if (onNotificationRead) {
        onNotificationRead();
      }
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await markAllNotificationsAsRead();
    },
    onSuccess: () => {
      // Invalidate and refetch notifications query
      queryClient.invalidateQueries({ queryKey: ['forumNotifications'] });
      if (onNotificationRead) {
        onNotificationRead();
      }
    }
  });

  const handleMarkAsRead = async (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: PostNotificationType) => {
    switch(type) {
      case 'REACTION':
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'REPLY':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'MENTION':
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get notification message based on type
  const getNotificationMessage = (notification: ForumNotification) => {
    const senderName = `${notification.sender.first_name} ${notification.sender.last_name}`;
    
    switch(notification.notification_type) {
      case 'REACTION':
        return t("forum.notifications.reaction", { name: senderName });
      case 'COMMENT':
        return t("forum.notifications.comment", { name: senderName });
      case 'REPLY':
        return t("forum.notifications.reply", { name: senderName });
      case 'MENTION':
        return t("forum.notifications.mention", { name: senderName });
      default:
        return t("forum.notifications.default", { name: senderName });
    }
  };

  return (
    <Card className="shadow-md sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("forum.notifications.title")}
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </CardTitle>
        
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
            ) : null}
            {t("forum.notifications.markAllRead")}
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">{t("forum.notifications.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  notification.read ? 'bg-white' : 'bg-blue-50'
                }`}
              >
                <div className="mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm">
                    {getNotificationMessage(notification)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                  
                  {notification.post && (
                    <Link 
                      href={`/dashboard/forum/post/${notification.post.id}`}
                      className="mt-2 block text-xs text-blue-600 hover:underline"
                    >
                      {t("forum.notifications.viewPost")}
                    </Link>
                  )}
                </div>
                
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="h-6 w-6 rounded-full hover:bg-blue-100"
                    disabled={markAsReadMutation.isPending}
                  >
                    {markAsReadMutation.isPending ? (
                      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
