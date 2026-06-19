import React from "react";
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  Filter,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "../ui/utils";

export type ViewMode = "board" | "table";
export type SortOrder = "asc" | "desc";
export type StatusFilter = "all" | "pending" | "approved" | "rejected";
export type CourseFilter =
  | "all"
  | "Computer Science"
  | "Information Systems"
  | "Design";

export interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  courseFilter: CourseFilter;
  onCourseFilterChange: (course: CourseFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  showHistory: boolean;
  onShowHistoryChange: (show: boolean) => void;
  searchPlaceholder?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  courseFilter,
  onCourseFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
  showHistory,
  onShowHistoryChange,
  searchPlaceholder = "Search requests...",
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div className="relative flex-1 w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-800 transition-all rounded-xl dark:text-slate-200 dark:placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
          <Button
            variant={viewMode === "board" ? "outline" : "ghost"}
            size="sm"
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-md border-none",
              viewMode === "board" &&
                "shadow-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700",
            )}
            onClick={() => onViewModeChange("board")}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-2" />
            Board
          </Button>
          <Button
            variant={viewMode === "table" ? "outline" : "ghost"}
            size="sm"
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-md border-none",
              viewMode === "table" &&
                "shadow-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700",
            )}
            onClick={() => onViewModeChange("table")}
          >
            <TableIcon className="w-3.5 h-3.5 mr-2" />
            List
          </Button>
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Course Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800",
                  courseFilter !== "all" &&
                    "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 dark:bg-slate-900 dark:border-slate-800"
            >
              <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">
                Filter Course
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              {(
                [
                  "all",
                  "Computer Science",
                  "Information Systems",
                  "Design",
                ] as CourseFilter[]
              ).map((cf) => (
                <DropdownMenuItem
                  key={cf}
                  className="cursor-pointer"
                  onClick={() => onCourseFilterChange(cf)}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-1">
                      {cf === "all" ? "All Courses" : cf}
                    </span>
                    {courseFilter === cf && (
                      <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800",
                  statusFilter !== "all" &&
                    "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 dark:bg-slate-900 dark:border-slate-800"
            >
              <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">
                Filter Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              {(
                ["all", "pending", "approved", "rejected"] as StatusFilter[]
              ).map((sf) => (
                <DropdownMenuItem
                  key={sf}
                  className="cursor-pointer capitalize"
                  onClick={() => onStatusFilterChange(sf)}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-1">
                      {sf === "all" ? "All Requests" : sf}
                    </span>
                    {statusFilter === sf && (
                      <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Order */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 dark:bg-slate-900 dark:border-slate-800"
            >
              <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">
                Sort by Date
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onSortOrderChange("asc")}
              >
                <div className="flex items-center w-full">
                  <span className="flex-1">Oldest First</span>
                  {sortOrder === "asc" && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onSortOrderChange("desc")}
              >
                <div className="flex items-center w-full">
                  <span className="flex-1">Newest First</span>
                  {sortOrder === "desc" && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* History Toggle */}
          <Tabs
            value={showHistory ? "history" : "current"}
            onValueChange={(v) => onShowHistoryChange(v === "history")}
            className="w-auto shrink-0"
          >
            <TabsList className="h-9 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <TabsTrigger
                value="current"
                className="text-xs px-3 h-7 rounded-md"
              >
                Current
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs px-3 h-7 rounded-md"
              >
                History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
