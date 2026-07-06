import React from "react";
import { Calendar, Clock, MoreHorizontal, Eye, Pencil, Ban, CheckCircle, XCircle, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";
import type { ClassRequest } from "../../types/requests";
import { cn } from "../ui/utils";
import { useLanguage } from "../../providers/LanguageContext";

export interface RequestsTableProps {
  requests: ClassRequest[];
  userRole: "teacher" | "coordinator" | "admin";
  showHistory: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (req: ClassRequest) => void;
  onEdit?: (req: ClassRequest) => void;
  onCancel?: (req: ClassRequest) => void;
  onDuplicate?: (req: ClassRequest) => void;
  onStatusChange?: (requestId: string, newStatus: "approved" | "rejected" | "pending") => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();
  const styles = {
    approved:
      "bg-green-50 text-green-700 ring-1 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900",
    pending:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-900",
    rejected:
      "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-900",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium px-2.5 py-0.5 rounded-full capitalize",
        styles[status as keyof typeof styles],
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
          status === "approved"
            ? "bg-green-500"
            : status === "pending"
              ? "bg-amber-500"
              : "bg-red-500",
        )}
      />
      {t(`requests.${status.toLowerCase()}`)}
    </Badge>
  );
};

export const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  userRole,
  showHistory,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
  onEdit,
  onCancel,
  onStatusChange,
  onDuplicate,
}) => {
  const { t } = useLanguage();
  const isTeacher = userRole === "teacher";

  return (
    <Card className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex-1 flex flex-col min-h-0">
      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="w-[300px] pl-6 text-slate-500 dark:text-slate-400">
                {t("requests.table_unit_course")}
              </TableHead>
              {!isTeacher && (
                <TableHead className="text-slate-500 dark:text-slate-400">
                  {t("requests.table_teacher")}
                </TableHead>
              )}
              {showHistory && (
                <TableHead className="text-slate-500 dark:text-slate-400">
                  {t("requests.table_original_date")}
                </TableHead>
              )}
              <TableHead className="text-slate-500 dark:text-slate-400">
                {showHistory ? t("requests.table_new_date") : t("requests.table_proposed_date_time")}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t("requests.table_status")}
              </TableHead>
              {!showHistory && (
                <TableHead className="text-slate-500 dark:text-slate-400">
                  {t("requests.table_reason")}
                </TableHead>
              )}
              <TableHead className="text-right pr-6 text-slate-500 dark:text-slate-400">
                {t("requests.table_actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.id}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800 transition-colors cursor-pointer"
                onClick={() => onViewDetails(request)}
              >
                <TableCell className="font-medium pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-1 h-12 rounded-full",
                        request.status === "approved"
                          ? "bg-emerald-500"
                          : request.status === "rejected"
                            ? "bg-red-500"
                            : "bg-amber-500",
                      )}
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {request.unit}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {request.course}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {!isTeacher && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.teacherName}`}
                        />
                        <AvatarFallback>
                          {request.teacherName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{request.teacherName}</span>
                    </div>
                  </TableCell>
                )}

                {showHistory && (
                  <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                    {request.originalDate}
                  </TableCell>
                )}

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {request.newDate}
                    </div>
                    {!showHistory && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {request.newTime}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>

                {!showHistory && (
                  <TableCell className="max-w-[200px]">
                    <p
                      className="truncate text-sm text-slate-600 dark:text-slate-400"
                      title={request.reason}
                    >
                      {request.reason}
                    </p>
                  </TableCell>
                )}

                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(request);
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>{t("requests.view_details")}</span>
                      </DropdownMenuItem>

                      {isTeacher && request.status === "pending" && !showHistory && onEdit && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(request);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Pencil className="w-4 h-4 text-blue-500" />
                          <span>{t("requests.edit_request")}</span>
                        </DropdownMenuItem>
                      )}

                      {isTeacher && onDuplicate && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(request);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Copy className="w-4 h-4 text-purple-500" />
                          <span>{t("requests.duplicate_request")}</span>
                        </DropdownMenuItem>
                      )}

                      {isTeacher && request.status === "pending" && !showHistory && onCancel && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel(request);
                          }}
                          className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Ban className="w-4 h-4" />
                          <span>{t("requests.cancel_request")}</span>
                        </DropdownMenuItem>
                      )}

                      {!isTeacher && request.status === "pending" && onStatusChange && (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(request.id, "approved");
                            }}
                            className="flex items-center gap-2 cursor-pointer text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{t("coordinator.approve_request")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(request.id, "rejected");
                            }}
                            className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>{t("coordinator.reject_request")}</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={
                    isTeacher ? (showHistory ? 5 : 6) : showHistory ? 6 : 7
                  }
                  className="h-24 text-center text-slate-500"
                >
                  {showHistory
                    ? t("requests.no_history_records")
                    : t("requests.no_requests_found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <Pagination className="justify-end md:justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={cn(
                    "cursor-pointer select-none",
                    currentPage === 1 && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>

              {/* Responsive page numbers - hidden on small screens */}
              <div className="hidden md:flex flex-row items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => onPageChange(page)}
                        className="cursor-pointer select-none"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
              </div>

              {/* Mobile page indicator */}
              <div className="md:hidden flex items-center px-4">
                <span className="text-sm text-slate-500">
                  {t("common.page_indicator")
                    .replace("{current}", String(currentPage))
                    .replace("{total}", String(totalPages))}
                </span>
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={cn(
                    "cursor-pointer select-none",
                    currentPage === totalPages &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
};
