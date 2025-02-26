import { deleteNotification, listNotifications, readNotification } from "@/actions/notifications";
import { NotificationType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  detail: (id: number) => [...notificationKeys.all, 'detail', id] as const,
};

export const useNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: listNotifications,
  });
};

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => readNotification(id),
    onSuccess: (updatedNotification) => {
      queryClient.setQueryData<NotificationType[]>(
        notificationKeys.list(),
        (oldData) =>
          oldData?.map((notification) =>
            notification.id === updatedNotification.id
              ? { ...notification, read: true }
              : notification
          )
      );
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<NotificationType[]>(
        notificationKeys.list(),
        (oldData) => oldData?.filter((notification) => notification.id !== deletedId)
      );
    },
  });
};
