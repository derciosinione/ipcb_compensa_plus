import React from "react";
import { useDrag } from "react-dnd";
import { AlertTriangle, Calendar, Clock, MoreHorizontal, X } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import type { ClassRequest, RequestStatus } from "../../types/requests";
import { cn } from "../ui/utils";

export interface RequestCardProps {
  request: ClassRequest;
  userRole: "teacher" | "coordinator" | "admin";
  isCompact?: boolean;
  isNearDate: (date: string) => boolean;
  onViewDetails: (req: ClassRequest) => void;
  // Role-specific actions
  onEdit?: (req: ClassRequest) => void;
  onCancel?: (req: ClassRequest) => void;
  onChangeStatus?: (id: string, status: RequestStatus) => void;
}

const ITEM_TYPE = "REQUEST_CARD";

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  userRole,
  isCompact = false,
  isNearDate,
  onViewDetails,
  onEdit,
  onCancel,
  onChangeStatus,
}) => {
  const isAdmin = userRole === "admin";
  const isTeacher = userRole === "teacher";
  const isCoordinator = userRole === "coordinator";
  const isNear = request.status === "pending" && isNearDate(request.newDate);

  const [{ isDragging }, dragRef] = useDrag<
    { id: string; currentStatus: RequestStatus },
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      type: ITEM_TYPE,
      item: { id: request.id, currentStatus: request.status },
      canDrag: !isAdmin, // Admins cannot drag
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [request.id, request.status, isAdmin],
  );

  const getComponentBadge = (type: string) => {
    switch (type) {
      case "theoretical":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
            T
          </span>
        );
      case "practical":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
            P
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={dragRef}
      className={cn(
        "transition-all duration-300",
        isDragging && "opacity-50 cursor-grabbing",
        !isAdmin && "touch-none cursor-grab active:cursor-grabbing",
      )}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 border-0 shadow-sm hover:shadow-md group bg-white dark:bg-slate-900 ring-1 dark:ring-slate-800 mb-4",
          request.hasConflict
            ? "ring-red-100 bg-red-50/5 dark:bg-red-900/10 dark:ring-red-900/30"
            : isNear
              ? "ring-amber-100 bg-amber-50/10 dark:bg-amber-900/10 dark:ring-amber-900/30"
              : "ring-slate-100",
        )}
      >
        <div
          className={cn(
            "h-1 w-full",
            request.status === "approved"
              ? "bg-emerald-500"
              : request.status === "rejected"
                ? "bg-red-500"
                : request.hasConflict
                  ? "bg-red-500"
                  : isNear
                    ? "bg-amber-500"
                    : "bg-amber-500",
          )}
        />

        <CardHeader className={cn("px-4 py-3", isCompact ? "pb-2" : "pb-4")}>
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider border-slate-200 dark:border-slate-700"
                >
                  {request.course}
                </Badge>
                {request.componentType &&
                  getComponentBadge(request.componentType)}

                {request.hasConflict && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded text-[10px] font-bold cursor-help">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-red-600 text-white border-red-700">
                        <p>Room {request.newRoom} is occupied.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {isNear && !request.hasConflict && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 rounded text-[10px] font-bold cursor-help">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="hidden sm:inline">Soon</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-amber-500 text-white border-amber-600">
                        <p>Scheduled date is approaching.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                {request.unit}
              </h4>
              <div className="flex flex-wrap gap-1">
                {request.yearGroups.map((group, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 px-1 rounded truncate max-w-[150px]"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            {/* In Coordinator View we show the Teacher Avatar, in Teacher View we just show Actions */}
            {!isTeacher && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border border-white dark:border-slate-800 shadow-sm cursor-help shrink-0">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.teacherName}`}
                      />
                      <AvatarFallback className="text-[10px]">
                        {request.teacherName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{request.teacherName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-6 w-6 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900"
              >
                <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(request);
                  }}
                  className="cursor-pointer"
                >
                  View Details
                </DropdownMenuItem>

                {/* Teacher Actions */}
                {isTeacher &&
                  (request.status === "pending" ||
                    request.status === "rejected") &&
                  onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(request);
                      }}
                      className="cursor-pointer"
                    >
                      Edit Request
                    </DropdownMenuItem>
                  )}
                {isTeacher &&
                  (request.status === "pending" ||
                    request.status === "rejected") &&
                  onCancel && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancel(request);
                        }}
                      >
                        Cancel Request
                      </DropdownMenuItem>
                    </>
                  )}

                {/* Coordinator Actions */}
                {isCoordinator &&
                  request.status === "pending" &&
                  onChangeStatus && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                      <DropdownMenuItem
                        className="text-green-600 dark:text-green-400 focus:text-green-700 dark:focus:text-green-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeStatus(request.id, "approved");
                        }}
                      >
                        Approve Request
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeStatus(request.id, "rejected");
                        }}
                      >
                        Reject Request
                      </DropdownMenuItem>
                    </>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {!isCompact && <Separator className="bg-slate-100 dark:bg-slate-800" />}

        <CardContent className={cn("p-4", isCompact ? "pt-2" : "pt-4")}>
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              <span
                className={cn(
                  request.status === "pending"
                    ? "text-slate-700 dark:text-slate-300 font-medium"
                    : "",
                  isNear ? "text-amber-600 dark:text-amber-400 font-bold" : "",
                )}
              >
                {request.newDate}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{request.newTime}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-xs border border-slate-100 dark:border-slate-800 mb-3">
            <span className="text-slate-400 font-bold uppercase mr-1.5 text-[10px]">
              Reason:
            </span>
            <span className="text-slate-700 dark:text-slate-300 italic line-clamp-1">
              "{request.reason}"
            </span>
          </div>

          {/* Quick Action Buttons for Coordinator */}
          {isCoordinator && request.status === "pending" && onChangeStatus && (
            <div
              className="flex gap-2 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs flex-1 border-slate-200 dark:border-slate-700 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeStatus(request.id, "rejected");
                }}
              >
                Reject
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeStatus(request.id, "approved");
                }}
              >
                Approve
              </Button>
            </div>
          )}

          {request.status === "rejected" && request.rejectionReason && (
            <div className="mt-3 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase mb-1">
                <X className="w-3 h-3" /> Rejection Reason
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-300 italic line-clamp-2">
                "{request.rejectionReason}"
              </p>
            </div>
          )}
        </CardContent>

      </Card>
    </div>
  );
};
