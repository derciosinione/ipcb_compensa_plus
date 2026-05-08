import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { BarChart as BarChartIcon } from 'lucide-react';
import { useLanguage } from '../../../providers/LanguageContext';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

const generateData = (year: string, t: (key: string) => string) => {
  const base = year === '2024' ? 10 : 5;
  const multiplier = year === '2024' ? 1.5 : 1;

  return [
    { id: 'jan', name: t('month.Jan'), total: Math.floor(4 * multiplier + base), approved: Math.floor(3 * multiplier + base), rejected: Math.floor(1 * multiplier) },
    { id: 'feb', name: t('month.Feb'), total: Math.floor(8 * multiplier + base), approved: Math.floor(6 * multiplier + base), rejected: Math.floor(2 * multiplier) },
    { id: 'mar', name: t('month.Mar'), total: Math.floor(12 * multiplier + base), approved: Math.floor(10 * multiplier + base), rejected: Math.floor(2 * multiplier) },
    { id: 'apr', name: t('month.Apr'), total: Math.floor(9 * multiplier + base), approved: Math.floor(8 * multiplier + base), rejected: Math.floor(1 * multiplier) },
    { id: 'may', name: t('month.May'), total: Math.floor(15 * multiplier + base), approved: Math.floor(12 * multiplier + base), rejected: Math.floor(3 * multiplier) },
    { id: 'jun', name: t('month.Jun'), total: Math.floor(18 * multiplier + base), approved: Math.floor(16 * multiplier + base), rejected: Math.floor(2 * multiplier) },
    { id: 'jul', name: t('month.Jul'), total: Math.floor(5 * multiplier + base), approved: Math.floor(4 * multiplier + base), rejected: Math.floor(1 * multiplier) },
    { id: 'aug', name: t('month.Aug'), total: Math.floor(2 * multiplier + base), approved: Math.floor(2 * multiplier + base), rejected: 0 },
    { id: 'sep', name: t('month.Sep'), total: Math.floor(14 * multiplier + base), approved: Math.floor(11 * multiplier + base), rejected: Math.floor(3 * multiplier) },
    { id: 'oct', name: t('month.Oct'), total: Math.floor(20 * multiplier + base), approved: Math.floor(18 * multiplier + base), rejected: Math.floor(2 * multiplier) },
    { id: 'nov', name: t('month.Nov'), total: Math.floor(24 * multiplier + base), approved: Math.floor(22 * multiplier + base), rejected: Math.floor(2 * multiplier) },
    { id: 'dec', name: t('month.Dec'), total: Math.floor(10 * multiplier + base), approved: Math.floor(9 * multiplier + base), rejected: Math.floor(1 * multiplier) },
  ];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl text-sm">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-500 dark:text-slate-400">{t('chart.total_label')}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{payload[0].value}</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 dark:text-slate-400">{t('chart.approved_label')}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{payload[1].value}</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-500 dark:text-slate-400">{t('chart.rejected_label')}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{payload[2].value}</span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CompensationChart = () => {
  const { t } = useLanguage();
  const [year, setYear] = useState('2023');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const data = generateData(year, t);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      // We set dimensions directly. If 0, we just don't render the chart component.
      // Using requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
      requestAnimationFrame(() => {
        setDimensions({ width, height });
      });
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const hasValidDimensions = dimensions.width > 0 && dimensions.height > 0;

  return (
    <Card className="col-span-1 lg:col-span-3 border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
      <style>{`
        .recharts-wrapper,
        .recharts-surface,
        .recharts-layer,
        .recharts-bar-rectangle {
           outline: none !important;
           box-shadow: none !important;
        }
        *:focus {
           outline: none !important;
        }
      `}</style>
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-100/50 dark:border-slate-800">
        <div>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-indigo-500" />
            {t('chart.title')}
          </CardTitle>
          <CardDescription className="mt-1">
            {t('chart.description')}
          </CardDescription>
        </div>
        <Select value={year} onValueChange={setYear}>
           <SelectTrigger className="w-[120px] bg-slate-50 dark:bg-slate-800 border-none shadow-none h-9 text-xs font-medium">
             <SelectValue placeholder={t('chart.select_year')} />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="2024">2024</SelectItem>
             <SelectItem value="2023">2023</SelectItem>
             <SelectItem value="2022">2022</SelectItem>
           </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6">
        <div 
           ref={containerRef}
           style={{ width: '100%', height: 350 }}
           className="min-w-0"
        >
          {hasValidDimensions ? (
             <BarChart 
                width={dimensions.width} 
                height={dimensions.height} 
                data={data} 
                barGap={4} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
             >
               <XAxis 
                 dataKey="name" 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fill: '#94a3b8', fontSize: 12 }} 
                 dy={10}
               />
               <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fill: '#94a3b8', fontSize: 12 }} 
               />
               <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
               <Legend 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">{value}</span>}
               />
               <Bar
                  key="total-bar"
                  name={t('chart.total')}
                  dataKey="total"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                  animationDuration={1500}
               />
               <Bar
                  key="approved-bar"
                  name={t('chart.approved')}
                  dataKey="approved"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                  animationDuration={1500}
               />
               <Bar
                  key="rejected-bar"
                  name={t('chart.rejected')}
                  dataKey="rejected"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                  animationDuration={1500}
               />
             </BarChart>
          ) : (
             <div className="flex h-full w-full items-center justify-center">
                <LoadingSpinner size="sm" text={t('chart.loading')} />
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
