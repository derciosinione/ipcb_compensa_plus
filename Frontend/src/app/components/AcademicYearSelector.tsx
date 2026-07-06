import React from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { useAcademicYear } from "../providers/AcademicYearContext";
import { useLanguage } from "../providers/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

export const AcademicYearSelector: React.FC = () => {
  const { selectedYear, academicYears, setSelectedYearId, isLoading } = useAcademicYear();
  const { t } = useLanguage();

  if (isLoading || !selectedYear) {
    return (
      <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-md" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-9 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
        >
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              {t("header.academic_year")}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {selectedYear.name}
              </span>
              {selectedYear.isActive && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-1 rounded-xl shadow-xl dark:bg-slate-900 dark:border-slate-800">
        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
          {t("header.select_academic_year")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
        {academicYears.map((year) => (
          <DropdownMenuItem
            key={year.id}
            onClick={() => setSelectedYearId(year.id)}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-colors mb-0.5",
              selectedYear.id === year.id
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className="flex flex-col">
              <span className={cn(
                "text-sm font-bold",
                selectedYear.id === year.id ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-slate-200"
              )}>
                {year.name}
              </span>
              <span className="text-[10px] text-slate-500">
                {new Date(year.startsOn).getFullYear()} - {new Date(year.endsOn).getFullYear()}
              </span>
            </div>
            {year.isActive && (
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                {t("header.active")}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
