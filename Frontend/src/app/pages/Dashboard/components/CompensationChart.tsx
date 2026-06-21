import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { BarChart as BarChartIcon } from "lucide-react";
import { useLanguage } from "../../../providers/LanguageContext";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import type { DashboardTrendPoint } from "../../../services/dashboard/dashboardTypes";

type ChartPoint = DashboardTrendPoint & { id: string; name: string };

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();

  if (active && payload && payload.length) {
    const total = payload.find((p: any) => p.dataKey === "total")?.value ?? 0;
    const pending = payload.find((p: any) => p.dataKey === "pending")?.value ?? 0;
    const approved = payload.find((p: any) => p.dataKey === "approved")?.value ?? 0;
    const rejected = payload.find((p: any) => p.dataKey === "rejected")?.value ?? 0;

    return (
      <div className="bg-white dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl text-sm">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">
          {label}
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-500 dark:text-slate-400">
              {t("chart.total_label")}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-500 dark:text-slate-400">
              {t("chart.pending_label")}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {pending}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400">
              {t("chart.approved_label")}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {approved}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-500 dark:text-slate-400">
              {t("chart.rejected_label")}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {rejected}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface CompensationChartProps {
  data: DashboardTrendPoint[];
  isLoading?: boolean;
}

export const CompensationChart = ({
  data,
  isLoading = false,
}: CompensationChartProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const chartData = data.map((point) => {
    const pending = Math.max(0, point.total - point.approved - point.rejected);
    return {
      ...point,
      id: point.period,
      name: point.period,
      pending,
    };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;

      // We set dimensions directly. If 0, we just don't render the chart component.
      // Using requestAnimationFrame to avoid'ResizeObserver loop limit exceeded"
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
            {t("chart.title")}
          </CardTitle>
          <CardDescription className="mt-1">
            {t("chart.description")}
          </CardDescription>
        </div>
        <Select value="rolling-6" disabled>
          <SelectTrigger className="w-[120px] bg-slate-50 dark:bg-slate-800 border-none shadow-none h-9 text-xs font-medium">
            <SelectValue placeholder={t("chart.select_year")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rolling-6">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6">
        <div
          ref={containerRef}
          style={{ width: "100%", height: 350 }}
          className="min-w-0"
        >
          {isLoading || !hasValidDimensions ? (
            <div className="flex h-full w-full items-center justify-center">
              <LoadingSpinner size="sm" text={t("chart.loading")} />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              No request data yet.
            </div>
          ) : (
            <BarChart
              width={dimensions.width}
              height={dimensions.height}
              data={chartData}
              barGap={4}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">
                    {value}
                  </span>
                )}
              />
              <Bar
                key="total-bar"
                name={t("chart.total")}
                dataKey="total"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={12}
                animationDuration={1500}
              />
              <Bar
                key="pending-bar"
                name={t("chart.pending")}
                dataKey="pending"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                barSize={12}
                animationDuration={1500}
              />
              <Bar
                key="approved-bar"
                name={t("chart.approved")}
                dataKey="approved"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={12}
                animationDuration={1500}
              />
              <Bar
                key="rejected-bar"
                name={t("chart.rejected")}
                dataKey="rejected"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                barSize={12}
                animationDuration={1500}
              />
            </BarChart>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
