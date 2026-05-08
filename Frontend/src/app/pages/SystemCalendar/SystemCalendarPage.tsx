import React from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Upload, Trash2 } from 'lucide-react';
import { cn } from '../../components/ui/utils';

export const SystemCalendarPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
         <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Academic Calendar</h2>
         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure institutional holidays and breaks.</p>
      </div>

       <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
          <div>
             <h4 className="text-lg font-bold mb-1">Import Institutional Calendar</h4>
             <p className="text-blue-100 text-sm max-w-lg">Bulk import holidays and blocked dates from your university's academic calendar file (.ICS or .CSV).</p>
          </div>
          <Button className="bg-white text-blue-700 hover:bg-blue-50 border-none shadow-md">
             <Upload className="w-4 h-4 mr-2" /> Import File
          </Button>
       </div>

       <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
             <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Upcoming Holidays</CardTitle>
             <CardDescription className="text-slate-500 dark:text-slate-400">Dates automatically blocked for compensation.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
             <div className="space-y-4">
                {[
                   { date: 'Dec 25, 2023', name: 'Christmas Day', type: 'Public Holiday', color: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30' },
                   { date: 'Jan 01, 2024', name: 'New Year\'s Day', type: 'Public Holiday', color: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30' },
                   { date: 'Feb 12, 2024', name: 'Carnival Break', type: 'Institutional', color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30' },
                ].map((h, i) => (
                   <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-center min-w-[60px]">
                            <span className="block text-xs font-bold text-slate-400 uppercase">{h.date.split(' ')[0]}</span>
                            <span className="block text-lg font-bold text-slate-900 dark:text-slate-100">{h.date.split(' ')[1].replace(',', '')}</span>
                         </div>
                         <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{h.name}</p>
                            <Badge variant="outline" className={cn("mt-1 text-[10px]", h.color)}>{h.type}</Badge>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                ))}
             </div>
          </CardContent>
       </Card>
    </div>
  );
};
