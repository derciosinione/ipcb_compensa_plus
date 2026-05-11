
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Bell, 
  Check, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
} from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { toast } from 'sonner@2.0.3';
import { getErrorMessage } from '../../utils/errors';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../../services/notifications/notificationQueries';

export const NotificationsPage = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = useNotificationsQuery();
  const markNotificationRead = useMarkNotificationReadMutation();
  const markAllNotificationsRead = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (isError) {
      toast.error(getErrorMessage(error, 'Failed to load notifications.'));
    }
  }, [error, isError]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const markAsRead = async (id: number) => {
    markNotificationRead.mutate(id, {
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Failed to mark notification as read.'));
      },
    });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) {
      return;
    }

    markAllNotificationsRead.mutate(unread.map((notification) => notification.id), {
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Failed to mark notifications as read.'));
      },
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Notifications</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stay updated with system alerts and request statuses.</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead} className="dark:border-slate-800 dark:text-slate-300">
               <Check className="w-4 h-4 mr-2" /> Mark all as read
            </Button>
         </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            <TabsTrigger value="unread" className="rounded-lg gap-2">
              Unread
              {notifications.some(n => !n.isRead) && (
                 <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="rounded-lg">Read</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4">
         {isLoading ? (
            <div className="text-center py-10">Loading notifications...</div>
         ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
               <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No notifications</h3>
               <p className="text-slate-500 dark:text-slate-400">You're all caught up!</p>
            </div>
         ) : (
            filteredNotifications.map((notification) => (
               <Card key={notification.id} className={cn(
                  "border-none shadow-sm transition-all hover:shadow-md ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900",
                  !notification.isRead && "bg-blue-50/30 dark:bg-blue-900/10 ring-blue-100 dark:ring-blue-900/30"
               )}>
                  <CardContent className="p-4 sm:p-6 flex gap-4 items-start">
                     <div className={cn("p-2 rounded-full shrink-0", 
                        !notification.isRead ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-50 dark:bg-slate-800/50"
                     )}>
                        {getIcon(notification.type)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                           <h4 className={cn("text-sm font-semibold truncate pr-4", !notification.isRead ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400")}>
                              {notification.title}
                           </h4>
                           <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                             {new Date(notification.createdAt).toLocaleString()}
                           </span>
                        </div>
                        <p className={cn("text-sm mt-1 leading-relaxed", !notification.isRead ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-500")}>
                           {notification.message}
                        </p>
                        <div className="flex gap-3 mt-4">
                           {!notification.isRead && (
                              <button 
                                 onClick={() => markAsRead(notification.id)}
                                 className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              >
                                 Mark as read
                              </button>
                           )}
                           {/* Remove functionality requires an endpoint which we didn't add yet, so we just omit or disable it */}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))
         )}
      </div>
    </div>
  );
};
