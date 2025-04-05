"use client";

import { getForumNotifications, markAllNotificationsAsRead } from "@/actions/forum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/locales/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, use } from "react";
import { format } from "date-fns";
import { Bell, Check, ChevronLeft, Loader2, MessageCircle, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForumNotification, PostNotificationType } from "@/types";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function ForumNotificationsPage() {
  const t = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch notifications with TanStack Query
  const { 
    data: notifications = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['forumNotifications'],
    queryFn: async () => {
      return await getForumNotifications();
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumNotifications'] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notifications as read");
    }
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: PostNotificationType) => {
    switch(type) {
      case 'REACTION':
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'COMMENT':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'REPLY':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
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
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/admin/forum')}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Forum Management</span>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Forum Notifications
          </h1>
          <p className="text-muted-foreground">
            View and manage forum notifications
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-destructive">Failed to load notifications</p>
            <Button 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['forumNotifications'] })}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">No Notifications</h3>
            <p className="text-muted-foreground mt-2">There are no forum notifications to display</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={notification.read ? 'bg-white' : 'bg-blue-50'}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={notification.sender.avatar} />
                  <AvatarFallback>
                    {notification.sender.first_name?.[0]}
                    {notification.sender.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.notification_type)}
                    <span className="font-medium">
                      {getNotificationMessage(notification)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(notification.created_at), 'PPp')}
                  </p>
                  
                  {notification.post && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/forum/posts/${notification.post?.id}`)}
                      >
                        View Post
                      </Button>
                    </div>
                  )}
                </div>
                
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
