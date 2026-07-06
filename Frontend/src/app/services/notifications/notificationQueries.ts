import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationsApi,
  type NotificationDto,
} from "../api/notificationsApi";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationQueryKeys.all, "list"] as const,
  preferences: () => [...notificationQueryKeys.all, "preferences"] as const,
};

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: notificationQueryKeys.list(),
    queryFn: async () => {
      const response = await notificationsApi.getNotifications();
      return response.data ?? [];
    },
    refetchInterval: 60_000,
  });

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: notificationQueryKeys.list(),
      });
      const previousNotifications = queryClient.getQueryData<NotificationDto[]>(
        notificationQueryKeys.list(),
      );

      queryClient.setQueryData<NotificationDto[]>(
        notificationQueryKeys.list(),
        (current = []) =>
          current.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification,
          ),
      );

      return { previousNotifications };
    },
    onError: (_error, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationQueryKeys.list(),
          context.previousNotifications,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.list(),
      });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => notificationsApi.markAsRead(id))),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({
        queryKey: notificationQueryKeys.list(),
      });
      const idSet = new Set(ids);
      const previousNotifications = queryClient.getQueryData<NotificationDto[]>(
        notificationQueryKeys.list(),
      );

      queryClient.setQueryData<NotificationDto[]>(
        notificationQueryKeys.list(),
        (current = []) =>
          current.map((notification) =>
            idSet.has(notification.id)
              ? { ...notification, isRead: true }
              : notification,
          ),
      );

      return { previousNotifications };
    },
    onError: (_error, _ids, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationQueryKeys.list(),
          context.previousNotifications,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.list(),
      });
    },
  });
};
