import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
import { LucideIcon, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconColor?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
  iconColor,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group relative ring-1 ring-slate-100 dark:ring-slate-800 dark:bg-slate-900",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn(
              "p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10",
              iconColor,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-auto font-medium",
                trendUp
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                  : "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
              )}
            >
              {trend}
            </Badge>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
