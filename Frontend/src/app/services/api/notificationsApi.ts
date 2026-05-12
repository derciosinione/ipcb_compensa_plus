import { authenticatedApiRequest, API_BASE_URL } from './httpClient';

export const notificationsApiBaseUrl = API_BASE_URL;

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
