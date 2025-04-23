"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listNotifications } from "@/actions/notifications";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // import Skeleton component

function NotificationsContent() {
  const { isPending, error, data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });

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
      <h1 className="text-3xl font-bold text-primary mb-4">Notifications</h1>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification: any) => (
            <Card key={notification.id} className="border border-primary shadow-sm">
              <div className="p-4">
                <h2 className="text-xl font-semibold">{notification.title}</h2>
                <p className="mt-2 text-gray-700">{notification.message}</p>
                <span className="block mt-2 text-sm text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No notifications available.</p>
        )}
      </div>
    </div>
  );
}

export default NotificationsContent;