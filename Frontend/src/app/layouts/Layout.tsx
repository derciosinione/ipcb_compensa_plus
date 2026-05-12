import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Settings,
  Bell,
  LogOut,
  User as UserIcon,
  Sliders,
  LifeBuoy,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import type { User, UserRole } from '../types/user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuBadge
} from '../components/ui/sidebar';
import { cn } from '../components/ui/utils';
import { ModeToggle } from '../components/ui/theme-provider';
import { GlobalSearch } from './GlobalSearch';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { useLanguage } from '../providers/LanguageContext';
import { Check } from 'lucide-react';
import { getAdminNavigationItems, getMainNavigationItems } from '../config/navigation';
import { appPaths, resolveAppPath } from '../routes/paths';
import { type NotificationDto } from '../services/api/notificationsApi';
import { useMarkNotificationReadMutation, useNotificationsQuery } from '../services/notifications/notificationQueries';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout?: () => void;
  onRoleChange?: (role: UserRole) => void;
}

export const Layout = ({ children, user, onLogout, onRoleChange }: LayoutProps) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [showHelp, setShowHelp] = useState(false);
  const { data: notifications = [] } = useNotificationsQuery();
  const markNotificationRead = useMarkNotificationReadMutation();

  const sidebarItems = getMainNavigationItems({ t, user });
  const adminItems = getAdminNavigationItems({ t, user });

  const filteredNotifications = notifications.filter(n => 
    notifFilter === 'all' ? true : !n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: NotificationDto) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markNotificationRead.mutate(notification.id);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar className="border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800" variant="sidebar" collapsible="icon">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-800 group-data-[collapsible=icon]:px-0">
            <Link to={appPaths.dashboard} className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center hover:opacity-90 transition-opacity">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm transition-all group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                <span className="text-sm font-bold text-white">C+</span>
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-slate-900 dark:text-slate-50 tracking-tight">{t('app.name')}</span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">{t('app.subtitle')}</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 gap-4 group-data-[collapsible=icon]:px-0">
            <SidebarGroup className="group-data-[collapsible=icon]:p-2">
              <SidebarGroupLabel className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                {t('menu.main')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.path} className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item.path || (currentPath === appPaths.root && item.path === appPaths.dashboard)}
                        tooltip={{
                          children: item.label,
                          className: "bg-slate-900 text-slate-50 border-slate-800 dark:bg-slate-100 dark:text-slate-900 font-medium"
                        }}
                        className={cn(
                          "transition-all duration-200",
                          "w-full justify-start",
                          "group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl",
                          currentPath === item.path 
                            ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400 shadow-sm" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        )}
                      >
                        <Link to={item.path}>
                          <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", currentPath === item.path ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />
                          <span className="group-data-[collapsible=icon]:hidden font-medium">{item.label}</span>
                          {item.badge && (
                            <SidebarMenuBadge className={cn(
                              "ml-auto group-data-[collapsible=icon]:hidden", 
                              currentPath === item.path 
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" 
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user.role === 'admin' && (
              <SidebarGroup className="group-data-[collapsible=icon]:p-2">
                <SidebarGroupLabel className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                  {t('menu.system')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.path} className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton
                          asChild
                          isActive={currentPath === item.path}
                          tooltip={{
                             children: item.label,
                             className: "bg-slate-900 text-slate-50 border-slate-800 dark:bg-slate-100 dark:text-slate-900 font-medium"
                          }}
                          className={cn(
                             "transition-all duration-200",
                             "w-full justify-start",
                             "group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl",
                            currentPath === item.path 
                              ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400 shadow-sm" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          )}
                        >
                          <Link to={item.path}>
                            <item.icon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                            <span className="group-data-[collapsible=icon]:hidden font-medium">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 dark:border-slate-800 p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            {/* Mobile Academic Year Info */}
            <div className="md:hidden mb-4 group-data-[collapsible=icon]:hidden">
               <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                 <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-bold tracking-wider">{t('header.academic_year')}</p>
                 <div className="flex items-center justify-between">
                   <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">2023/24</span>
                   <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{t('header.active')}</span>
                 </div>
               </div>
            </div>

            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton 
                  onClick={() => setShowHelp(true)}
                  tooltip={{
                    children: t('menu.help'),
                    className: "bg-slate-900 text-slate-50 border-slate-800 dark:bg-slate-100 dark:text-slate-900 font-medium"
                  }}
                  className={cn(
                    "transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                    "w-full justify-start",
                    "group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl"
                  )}
                >
                  <LifeBuoy className="h-5 w-5 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden font-medium">{t('menu.help')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col transition-colors">
          <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" />
              <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-slate-100 mr-2">{t('header.academic_year')} 2023/24</span>
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{t('header.active')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <GlobalSearch onNavigate={(path) => navigate(resolveAppPath(path))} />

              <ModeToggle />

              <Popover>
                 <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                         <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                      )}
                    </Button>
                 </PopoverTrigger>
                 <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-xl dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                       <h4 className="font-semibold text-sm">{t('header.notifications')}</h4>
                       <Tabs defaultValue="all" className="w-auto" onValueChange={(v) => setNotifFilter(v as any)}>
                          <TabsList className="h-7 bg-slate-100 dark:bg-slate-800 p-0.5">
                             <TabsTrigger value="all" className="text-[10px] h-6 px-2 rounded-sm">{t('header.all')}</TabsTrigger>
                             <TabsTrigger value="unread" className="text-[10px] h-6 px-2 rounded-sm">{t('header.unread')}</TabsTrigger>
                          </TabsList>
                       </Tabs>
                    </div>
                    <ScrollArea className="h-[300px]">
                       {filteredNotifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-xs">
                             {t('header.no_notifications')}
                          </div>
                       ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                             {filteredNotifications.map(n => (
                                <button
                                   key={n.id}
                                   onClick={() => handleNotificationClick(n)}
                                   className={cn(
                                      "w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative",
                                      !n.isRead && "bg-blue-50/30 dark:bg-blue-900/10"
                                   )}
                                >
                                   {!n.isRead && <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                                   <p className={cn("text-xs font-semibold mb-1", !n.isRead ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400")}>
                                      {n.title}
                                   </p>
                                   <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                      {n.message}
                                   </p>
                                   <span className="text-[10px] text-slate-400 mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
                                </button>
                             ))}
                          </div>
                       )}
                    </ScrollArea>
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="w-full text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                       >
                          <Link to={appPaths.notifications}>{t('header.view_all')}</Link>
                       </Button>
                    </div>
                 </PopoverContent>
              </Popover>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                 <div className="text-right hidden sm:block">
                   <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                 </div>
                 <DropdownUser user={user} onLogout={onLogout} onRoleChange={onRoleChange} />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
         <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-blue-600" />
                  Help & Support
               </DialogTitle>
               <DialogDescription className="pt-2">
                  Need assistance with the Compensa+ platform?
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm">
                  <h4 className="font-medium mb-1 dark:text-slate-200">Documentation</h4>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Read our guides on how to manage class compensations.</p>
                  <Button variant="outline" size="sm" className="w-full h-8">View Documentation</Button>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm">
                  <h4 className="font-medium mb-1 dark:text-slate-200">Contact Support</h4>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Report a technical issue or request assistance.</p>
                  <Button variant="outline" size="sm" className="w-full h-8">Contact IT Department</Button>
               </div>
            </div>
            <DialogFooter>
               <Button onClick={() => setShowHelp(false)}>Close</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
         <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  {selectedNotification?.type === 'RequestStatusUpdated' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                  {selectedNotification?.type === 'RequestCreated' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                  {selectedNotification?.title}
               </DialogTitle>
               <DialogDescription className="pt-2">
                  <span className="block text-xs text-slate-400 mb-4">
                     {selectedNotification ? new Date(selectedNotification.createdAt).toLocaleString() : ''}
                  </span>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                     {selectedNotification?.message}
                  </div>
               </DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button onClick={() => setSelectedNotification(null)}>Close</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

const DropdownUser = ({
  user,
  onLogout,
  onRoleChange,
}: {
  user: User;
  onLogout?: () => void;
  onRoleChange?: (role: UserRole) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const availableRoles = user.roles ?? [user.role];
  
  return (
    <div className="relative">
      <SidebarMenuButton 
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-slate-800 dark:data-[state=open]:bg-slate-800 w-auto p-0 hover:bg-transparent group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-blue-100 dark:hover:ring-blue-900 transition-all">
           <AvatarImage src={user.avatarUrl} />
           <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs font-bold">
             {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
           </AvatarFallback>
        </Avatar>
      </SidebarMenuButton>
      
      {isOpen && (
        <div className="absolute top-full right-0 w-64 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 animate-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
             <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user.name}</p>
             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email || 'user@compensa.edu'}</p>
          </div>
          
          <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('user.account')}
          </div>
          <Link 
             to={appPaths.profile}
             onClick={() => setIsOpen(false)}
             className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
             <UserIcon className="h-4 w-4" /> {t('user.profile')}
          </Link>
          <Link 
             to={appPaths.preferences}
             onClick={() => setIsOpen(false)}
             className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
             <Sliders className="h-4 w-4" /> {t('user.preferences')}
          </Link>
          <Link 
             to={appPaths.settings}
             onClick={() => setIsOpen(false)}
             className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
             <Settings className="h-4 w-4" /> {t('user.system_settings')}
          </Link>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          
          <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('user.language')}
          </div>
          <div className="flex gap-1 px-2 pb-2">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors border",
                language === 'en'
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800"
              )}
            >
              English {language === 'en' && <Check className="h-3 w-3" />}
            </button>
            <button
              onClick={() => setLanguage('pt')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors border",
                language === 'pt'
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800"
              )}
            >
              Português {language === 'pt' && <Check className="h-3 w-3" />}
            </button>
          </div>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          {availableRoles.length > 1 && (
            <>
              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t('user.switch_role')}
              </div>
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange?.(role);
                    setIsOpen(false);
                    navigate(appPaths.dashboard);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    user.role === role
                      ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full", user.role === role ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-300 dark:bg-slate-600")} />
                  {t(`role.${role}`)}
                </button>
              ))}
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            </>
          )}
          <button 
            onClick={() => {
              setIsOpen(false);
              onLogout?.();
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4" />
            {t('user.sign_out')}
          </button>
        </div>
      )}
    </div>
  );
}
