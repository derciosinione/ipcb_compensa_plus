import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Input } from '../../../components/ui/input';
import { Separator } from '../../../components/ui/separator';
import { Switch } from '../../../components/ui/switch';
import { ScrollArea } from '../../../components/ui/scroll-area';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreHorizontal,
  Search,
  Settings,
  User,
  Bell,
  Mail,
  LogOut,
  FileText,
  Printer
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { cn } from '../../../components/ui/utils';
import { RequestDetailsPage } from '../../../components/domain/requests/RequestDetailsPage';
import { mockRequests } from '../../../mocks/data';

// --- 1. Mock Calendar Screen ---

export const MockCalendarScreen = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = 14; 
  
  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
       <div className="flex items-center justify-between">
           <div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Academic Calendar</h2>
               <p className="text-slate-500 text-sm">October 2024</p>
           </div>
           <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
               <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
               <span className="text-sm font-medium w-32 text-center">October 2024</span>
               <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
           </div>
       </div>

       <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
           {/* Header */}
           <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
               {days.map(day => (
                   <div key={day} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                       {day}
                   </div>
               ))}
           </div>
           
           {/* Grid */}
           <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-100 dark:divide-slate-800">
               {Array.from({length: 35}).map((_, i) => {
                   const dayNum = i - 2;
                   const isToday = dayNum === today;
                   const isPrevMonth = dayNum <= 0;
                   const isNextMonth = dayNum > 31;
                   
                   // Mock Events
                   const events = [];
                   if (dayNum === 5) events.push({ title: 'Faculty Meeting', type: 'meeting' });
                   if (dayNum === 12) events.push({ title: 'Holiday', type: 'holiday' });
                   if (dayNum === 14) events.push({ title: 'Substitute Class', type: 'class' });
                   if (dayNum === 22) events.push({ title: 'Exam Week Start', type: 'academic' });
                   
                   if (isPrevMonth || isNextMonth) return <div key={i} className="bg-slate-50/50 dark:bg-slate-950/50" />;

                   return (
                       <div key={i} className={cn("p-2 relative group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", isToday && "bg-blue-50/30 dark:bg-blue-900/10")}>
                           <span className={cn(
                               "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                               isToday ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-300"
                           )}>
                               {dayNum}
                           </span>
                           <div className="space-y-1">
                               {events.map((evt, idx) => (
                                   <div key={idx} className={cn(
                                       "text-[10px] px-1.5 py-0.5 rounded truncate font-medium border",
                                       evt.type === 'meeting' && "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
                                       evt.type === 'holiday' && "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
                                       evt.type === 'class' && "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
                                       evt.type === 'academic' && "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
                                   )}>
                                       {evt.title}
                                   </div>
                               ))}
                           </div>
                       </div>
                   );
               })}
           </div>
       </div>
    </div>
  );
};

// --- 2. Mock Report Screen ---

export const MockReportScreen = () => {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hours Bank Report</h2>
                    <p className="text-slate-500 text-sm">Consolidated view of faculty working hours and compensations.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 flex-wrap">
                         <div className="flex items-center gap-2">
                             <CalendarIcon className="w-4 h-4 text-slate-400" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Period:</span>
                             <div className="flex items-center gap-2">
                                 <Badge variant="outline" className="font-normal">Oct 1, 2024</Badge>
                                 <span className="text-slate-400 text-xs">to</span>
                                 <Badge variant="outline" className="font-normal">Oct 31, 2024</Badge>
                             </div>
                         </div>
                         <Separator orientation="vertical" className="h-4 hidden sm:block" />
                         <div className="flex items-center gap-2">
                             <Filter className="w-4 h-4 text-slate-400" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dept:</span>
                             <Badge variant="secondary" className="font-normal cursor-pointer hover:bg-slate-200">All Departments</Badge>
                         </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50">
                                <TableHead className="w-[300px]">Professor</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead className="text-right">Contract</TableHead>
                                <TableHead className="text-right">Completed</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { name: "Dr. Ana Silva", id: "2021.55.901", contract: "160h", completed: "172h", balance: "+12h", status: "good" },
                                { name: "Prof. Carlos Santos", id: "2019.33.120", contract: "120h", completed: "116h", balance: "-4h", status: "warning" },
                                { name: "Dr. Maria Clara", id: "2020.11.450", contract: "200h", completed: "200h", balance: "0h", status: "neutral" },
                                { name: "Prof. João Pedro", id: "2022.88.230", contract: "160h", completed: "165h", balance: "+5h", status: "good" },
                                { name: "Prof. Fernada Lima", id: "2018.22.110", contract: "120h", completed: "110h", balance: "-10h", status: "danger" },
                            ].map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                                    {row.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            {row.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-500">{row.id}</TableCell>
                                    <TableCell className="text-right text-slate-500">{row.contract}</TableCell>
                                    <TableCell className="text-right font-medium">{row.completed}</TableCell>
                                    <TableCell className={cn("text-right font-bold", 
                                        row.balance.startsWith('+') ? "text-green-600" : 
                                        row.balance.startsWith('-') ? "text-red-600" : "text-slate-600"
                                    )}>
                                        {row.balance}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={cn(
                                            "border-0 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold",
                                            row.status === 'good' && "bg-green-100 text-green-700",
                                            row.status === 'warning' && "bg-amber-100 text-amber-700",
                                            row.status === 'danger' && "bg-red-100 text-red-700",
                                            row.status === 'neutral' && "bg-slate-100 text-slate-700"
                                        )}>
                                            {row.status === 'good' ? 'On Track' : row.status === 'danger' ? 'Critical' : row.status === 'warning' ? 'Attention' : 'Regular'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

// --- 3. Mock Profile Screen ---

export const MockProfileScreen = () => {
    return (
        <div className="h-full bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto">
             <div className="max-w-3xl mx-auto space-y-8">
                 <div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Account Settings</h2>
                     <p className="text-slate-500 text-sm">Manage your personal information and preferences.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* Sidebar Nav */}
                     <div className="space-y-1">
                         {['Profile', 'Notifications', 'Security', 'Display'].map(item => (
                             <Button key={item} variant={item === 'Profile' ? 'secondary' : 'ghost'} className="w-full justify-start">
                                 {item}
                             </Button>
                         ))}
                         <Separator className="my-4" />
                         <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                             <LogOut className="mr-2 h-4 w-4" /> Sign Out
                         </Button>
                     </div>

                     {/* Content */}
                     <div className="md:col-span-2 space-y-6">
                         <Card>
                             <CardHeader>
                                 <CardTitle>Personal Information</CardTitle>
                                 <CardDescription>Public details visible to other faculty.</CardDescription>
                             </CardHeader>
                             <CardContent className="space-y-6">
                                 <div className="flex items-center gap-6">
                                     <Avatar className="h-20 w-20 border-4 border-slate-100">
                                         <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=AS" />
                                         <AvatarFallback>AS</AvatarFallback>
                                     </Avatar>
                                     <div className="space-y-2">
                                         <Button variant="outline" size="sm">Change Avatar</Button>
                                         <p className="text-xs text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                                     </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                         <span className="text-sm font-medium">First Name</span>
                                         <Input defaultValue="Ana" />
                                     </div>
                                     <div className="space-y-2">
                                         <span className="text-sm font-medium">Last Name</span>
                                         <Input defaultValue="Silva" />
                                     </div>
                                 </div>

                                 <div className="space-y-2">
                                     <span className="text-sm font-medium">Email Address</span>
                                     <div className="flex gap-2">
                                         <Input defaultValue="ana.silva@compensa.edu" readOnly className="bg-slate-50" />
                                         <Button variant="outline" disabled>Verified</Button>
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>

                         <Card>
                             <CardHeader>
                                 <CardTitle>Notification Preferences</CardTitle>
                                 <CardDescription>Choose how you want to be notified.</CardDescription>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 <div className="flex items-center justify-between">
                                     <div className="space-y-0.5">
                                         <div className="font-medium text-sm flex items-center gap-2">
                                             <Mail className="w-4 h-4 text-slate-500" /> Email Notifications
                                         </div>
                                         <p className="text-xs text-slate-500">Receive emails about request status changes.</p>
                                     </div>
                                     <Switch defaultChecked />
                                 </div>
                                 <Separator />
                                 <div className="flex items-center justify-between">
                                     <div className="space-y-0.5">
                                         <div className="font-medium text-sm flex items-center gap-2">
                                             <Bell className="w-4 h-4 text-slate-500" /> In-App Alerts
                                         </div>
                                         <p className="text-xs text-slate-500">Show badges and banners in the dashboard.</p>
                                     </div>
                                     <Switch defaultChecked />
                                 </div>
                             </CardContent>
                         </Card>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// --- 4. Mock Request Detail Wrapper ---

export const MockRequestDetailsScreen = () => {
    // Pick a mock request
    const req = mockRequests[0];
    
    return (
        <div className="h-full bg-slate-50 dark:bg-slate-950 p-6 overflow-hidden">
            <RequestDetailsPage 
                request={req}
                onBack={() => {}} 
                onAddComment={() => {}}
                userRole="teacher"
            />
        </div>
    );
};
