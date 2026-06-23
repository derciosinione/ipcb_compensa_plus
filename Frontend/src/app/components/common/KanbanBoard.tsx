import React from "react";
import { useDrop } from "react-dnd";
import { Check, Clock, Inbox, X } from "lucide-react";
import { Badge } from "../ui/badge";
import type { ClassRequest, RequestStatus } from "../../types/requests";
import { RequestCard } from "./RequestCard";
import { cn } from "../ui/utils";
import { useLanguage } from "../../providers/LanguageContext";

export interface DroppableColumnProps {
  status: RequestStatus;
  title: string;
  icon: React.ReactNode;
  requests: ClassRequest[];
  userRole: "teacher" | "coordinator" | "admin";
  isNearDate: (date: string) => boolean;
  onViewDetails: (req: ClassRequest) => void;
  onStatusChange?: (id: string, newStatus: RequestStatus) => void;
  onEdit?: (req: ClassRequest) => void;
  onCancel?: (req: ClassRequest) => void;
}

const ITEM_TYPE = "REQUEST_CARD";

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
  status,
  title,
  icon,
  requests,
  userRole,
  isNearDate,
  onViewDetails,
  onStatusChange,
  onEdit,
  onCancel,
}) => {
  const { t } = useLanguage();
  const isAdmin = userRole === "admin";
  const isCompact = status !== "pending"; // Approved/Rejected usually compact

  const [{ isOver, canDrop }, dropRef] = useDrop<
    { id: string; currentStatus: RequestStatus },
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: ITEM_TYPE,
      drop: (item) => {
        if (!isAdmin && item.currentStatus !== status && onStatusChange) {
          onStatusChange(item.id, status);
        }
      },
      canDrop: (item) => !isAdmin && item.currentStatus !== status,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [status, onStatusChange, isAdmin],
  );

  return (
    <div
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col h-full min-h-[500px] transition-all",
        isOver &&
          canDrop &&
          "ring-2 ring-blue-400 bg-blue-50/50 dark:bg-blue-900/20",
        canDrop && !isOver && "ring-1 ring-blue-200 dark:ring-blue-800",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            {title}
          </h3>
        </div>
        <Badge
          variant="secondary"
          className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] h-5 px-1.5"
        >
          {requests.length}
        </Badge>
      </div>
      <div className="space-y-4 flex-1">
        {requests.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            userRole={userRole}
            isCompact={isCompact}
            isNearDate={isNearDate}
            onViewDetails={onViewDetails}
            onChangeStatus={onStatusChange}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        ))}
        {requests.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            {isOver && canDrop
              ? t("requests.drop_move").replace("{status}", title)
              : t("requests.no_requests").replace("{status}", t(`requests.${status.toLowerCase()}`))}
          </div>
        )}
      </div>
    </div>
  );
};

export interface KanbanBoardProps {
  requests: ClassRequest[];
  userRole: "teacher" | "coordinator" | "admin";
  isNearDate: (date: string) => boolean;
  onViewDetails: (req: ClassRequest) => void;
  onStatusChange?: (id: string, newStatus: RequestStatus) => void;
  onEdit?: (req: ClassRequest) => void;
  onCancel?: (req: ClassRequest) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  requests,
  userRole,
  isNearDate,
  onViewDetails,
  onStatusChange,
  onEdit,
  onCancel,
}) => {
  const { t } = useLanguage();
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");
  const cancelledRequests = requests.filter((r) => r.status === "cancelled");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 h-full min-h-0 overflow-y-auto">
      <DroppableColumn
        status="pending"
        title={t("requests.pending_review")}
        icon={<Clock className="w-4 h-4 text-amber-500" />}
        requests={pendingRequests}
        userRole={userRole}
        isNearDate={isNearDate}
        onViewDetails={onViewDetails}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onCancel={onCancel}
      />
      <DroppableColumn
        status="approved"
        title={t("requests.approved")}
        icon={<Check className="w-4 h-4 text-emerald-500" />}
        requests={approvedRequests}
        userRole={userRole}
        isNearDate={isNearDate}
        onViewDetails={onViewDetails}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onCancel={onCancel}
      />
      <DroppableColumn
        status="rejected"
        title={t("requests.rejected")}
        icon={<X className="w-4 h-4 text-red-500" />}
        requests={rejectedRequests}
        userRole={userRole}
        isNearDate={isNearDate}
        onViewDetails={onViewDetails}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onCancel={onCancel}
      />
      <DroppableColumn
        status="cancelled"
        title={t("requests.cancelled")}
        icon={<Inbox className="w-4 h-4 text-slate-500" />}
        requests={cancelledRequests}
        userRole={userRole}
        isNearDate={isNearDate}
        onViewDetails={onViewDetails}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onCancel={onCancel}
      />
    </div>
  );
};
