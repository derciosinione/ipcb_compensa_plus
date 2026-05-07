import React from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { kpiData } from './data';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { format, addDays, startOfWeek } from 'date-fns';
import { CompensationChart } from './CompensationChart';
import { StatCard } from '../common/StatCard';
import { useLanguage } from './LanguageContext';

const EventCard = ({ title, time, room, type, isCompact = false }: { title: string, time: string, room?: string, type: 'class' | 'blocked' | 'holiday', isCompact?: boolean }) => {
   const variants = {
     class: "bg-white border-l-4 border-l-blue-500 shadow-sm dark:bg-slate-800",
     blocked: "bg-slate-50 border-l-4 border-l-slate-400 opacity-70 dark:bg-slate-800/50 dark:border-l-slate-600",
     holiday: "bg-red-50 border-l-4 border-l-red-400 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-l-red-500"
   };
   
   return (
     <div className={cn("p-3 rounded-r-md border border-slate-100 dark:border-slate-700 mb-2 transition-transform hover:-translate-x-1 duration-200 cursor-default", variants[type])}>
        <div className="flex justify-between items-start">
           <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{time}</p>
           </div>
           {!isCompact && room && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-white dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700">
                {room}
              </Badge>
           )}
        </div>
     </div>
   );
}

const WeeklyCalendar = () => {
  const { t } = useLanguage();
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(start, i);
    return {
      name: format(date, 'EEE'),
      date: format(date, 'd'),
      active: i === 2, // Mock active state
      events: i === 0 ? [{ title: 'Software Eng.', time: '09:00 - 11:00', type: 'class' }] :
              i === 1 ? [{ title: 'Databases I', time: '14:00 - 16:00', type: 'class' }] :
              i === 2 ? [{ title: 'Dept. Meeting', time: '10:00 - 11:00', type: 'blocked' }] :
              i === 3 ? [] :
              [{ title: 'Web Dev', time: '11:00 - 13:00', type: 'class' }]
    };
  });

  return (
    <Card className="col-span-1 lg:col-span-2 border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden flex flex-col h-full bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-slate-100/50 dark:border-slate-800">
        <div>
           <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
             <CalendarIcon className="w-5 h-5 text-blue-500" />
             {t('dashboard.this_week_schedule')}
           </CardTitle>
           <p className="text-sm text-slate-400 font-medium mt-1">{format(start, 'MMMM d')} - {format(addDays(start, 4), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm">
             <ChevronLeft className="h-4 w-4 dark:text-slate-400" />
           </Button>
           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm">
             <ChevronRight className="h-4 w-4 dark:text-slate-400" />
           </Button>
        </div>
      </CardHeader>
      
      <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
         {days.map((day) => (
           <div key={day.name} className={cn("flex flex-col gap-3 rounded-2xl p-3 transition-colors", day.active ? "bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900" : "hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
              <div className="flex items-center lg:block lg:text-center mb-2 gap-3 lg:gap-0">
                 <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0 lg:mb-1 w-8 lg:w-auto">{day.name}</span>
                 <span className={cn(
                   "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm transition-all",
                   day.active ? "bg-blue-600 text-white shadow-blue-300 dark:shadow-none" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                 )}>
                   {day.date}
                 </span>
              </div>
              
              <div className="space-y-2 flex-1">
                {/* @ts-ignore */}
                {day.events.map((e, i) => (
                  // @ts-ignore
                  <EventCard key={i} title={e.title} time={e.time} type={e.type as any} isCompact />
                ))}
                {day.events.length === 0 && (
                   <div className="h-16 rounded-lg border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center">
                     <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">{t('dashboard.no_classes')}</span>
                   </div>
                )}
              </div>
           </div>
         ))}
      </div>
    </Card>
  );
};

const QuickActions = () => {
   const { t } = useLanguage();
   const navigate = useNavigate();
   
   return (
    <Card className="h-full border-none shadow-md bg-slate-900 dark:bg-black text-white relative overflow-hidden ring-1 ring-slate-900 dark:ring-slate-800">
       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
       <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
 
       <CardHeader>
         <CardTitle className="flex items-center gap-2 text-white">
           <AlertCircle className="w-5 h-5 text-blue-400" />
           {t('dashboard.notifications')}
         </CardTitle>
         <CardDescription className="text-slate-400">
            {t('dashboard.requiring_attention')}
         </CardDescription>
       </CardHeader>
      <CardContent className="space-y-4 relative z-10">
         <div 
           className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
           onClick={() => navigate('/requests')}
         >
            <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{t('dashboard.pending_status')}</span>
               <span className="text-[10px] text-slate-400">2h ago</span>
            </div>
            <h4 className="font-semibold text-sm mb-1 group-hover:text-blue-200 transition-colors">Software Engineering</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
               Request for substitute class on Nov 25th is awaiting approval.
            </p>
         </div>

         <div 
           className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
           onClick={() => navigate('/calendar')}
         >
            <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{t('dashboard.upcoming_status')}</span>
               <span className="text-[10px] text-slate-400">Tomorrow</span>
            </div>
            <h4 className="font-semibold text-sm mb-1 group-hover:text-blue-200 transition-colors">Compensated Class</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
               Scheduled for Room 304 at 14:00.
            </p>
         </div>
         
         <Button 
           className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none mt-4"
           onClick={() => navigate('/notifications')}
         >
            {t('dashboard.view_all')}
         </Button>
      </CardContent>
   </Card>
   );
};

export const Overview = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.total_requests')} 
          value={kpiData.totalRequests} 
          icon={FileText} 
          trend="+12%"
          trendUp={true}
          iconColor="text-blue-600"
          className="bg-white"
        />
        <StatCard 
          title={t('dashboard.pending')} 
          value={kpiData.pending} 
          icon={Clock} 
          iconColor="text-amber-600"
          className="bg-white"
        />
        <StatCard 
          title={t('dashboard.compensated')} 
          value={kpiData.compensated} 
          icon={CheckCircle2} 
          trend={t('dashboard.target_met')}
          trendUp={true}
          iconColor="text-green-600"
          className="bg-white"
        />
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-md ring-1 ring-indigo-500/50">
           <CardContent className="p-6 flex flex-col justify-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                 <MoreVertical className="w-6 h-6 text-white" />
              </div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">{t('dashboard.quick_stat')}</p>
              <div className="text-2xl font-bold mb-1">98%</div>
              <p className="text-xs text-indigo-100/80">{t('dashboard.class_coverage')}</p>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <CompensationChart />
        <div className="lg:col-span-1 h-full">
           <QuickActions />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
         <WeeklyCalendar />
      </div>
    </div>
  );
};