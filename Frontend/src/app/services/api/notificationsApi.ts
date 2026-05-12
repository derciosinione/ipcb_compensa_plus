import { authenticatedApiRequest } from './httpClient';

const defaultNotificationsApiUrl = 'http://localhost:8001';
export const notificationsApiBaseUrl = import.meta.env.VITE_NOTIFICATIONS_API_URL?.replace(/\/$/, '') ?? defaultNotificationsApiUrl;

export interface NotificationDto {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationPreferencesDto {
    emailEnabled: boolean;
    email?: string;
}

export const notificationsApi = {
    getNotifications: () =>
        authenticatedApiRequest<NotificationDto[]>(notificationsApiBaseUrl, '/api/notifications'),

    markAsRead: (id: string) =>
        authenticatedApiRequest<void>(notificationsApiBaseUrl, `/api/notifications/${id}/read`, {
            method: 'PATCH',
        }),

    getPreferences: () =>
        authenticatedApiRequest<NotificationPreferencesDto>(notificationsApiBaseUrl, '/api/preferences'),

    updatePreferences: (emailEnabled: boolean) =>
        authenticatedApiRequest<void>(notificationsApiBaseUrl, '/api/preferences', {
            method: 'PUT',
            body: JSON.stringify({ emailEnabled }),
        }),
};
