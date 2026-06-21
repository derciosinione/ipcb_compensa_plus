import React, { useCallback, useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { ClassRequest } from "../../types/requests";
import { RequestDetailsPage } from "../../components/domain/requests/RequestDetailsPage";
import { RejectionDialog } from "../../components/domain/requests/RejectionDialog";
import {
  FilterBar,
  ViewMode,
  SortOrder,
  StatusFilter,
  CourseFilter,
} from "../../components/common/FilterBar";
import { KanbanBoard } from "../../components/common/KanbanBoard";
import { RequestsTable } from "../../components/common/RequestsTable";
import {
  getDocumentDownloadUrl,
  listCompensationRequests,
  updateCompensationRequestStatus,
  getCompensationRequest,
  addCompensationRequestComment,
  uploadCompensationRequestDocument,
  deleteCompensationRequestDocument,
} from "../../services/compensationRequests/compensationRequestsApi";
import type { CompensationRequest } from "../../services/compensationRequests/compensationRequestTypes";
import { Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import { ExportRequestsModal } from "../../components/domain/requests/ExportRequestsModal";
import type { AuthenticatedUser } from "../../types/user";
import { getErrorMessage } from "../../utils/errors";
import { useAcademicYear } from "../../providers/AcademicYearContext";

interface CoordinatorRequestsPageProps {
  user: AuthenticatedUser;
  userRole?: "coordinator" | "admin" | "teacher";
  requestId?: string;
}

const toClassRequest = (request: CompensationRequest): ClassRequest => ({
  id: request.id,
  course: request.course,
  unit: request.curricularUnit,
  yearGroups: request.yearGroups,
  componentType:
    request.componentType.toLowerCase() as ClassRequest["componentType"],
  originalDate: request.originalDate,
  originalTime: `${request.originalStartTime.slice(0, 5)} - ${request.originalEndTime.slice(0, 5)}`,
  originalRoom: request.originalRoom,
  newDate: request.newDate,
  newTime: `${request.newStartTime.slice(0, 5)} - ${request.newEndTime.slice(0, 5)}`,
  newRoom: request.newRoom,
  reason: request.justification,
  status: request.status.toLowerCase() as ClassRequest["status"],
  teacherName: request.teacherName,
  submittedAt: request.submittedAt.split("T")[0],
  hasConflict: request.hasConflict,
  rejectionReason: request.decisionComment ?? undefined,
  comments: request.comments
    ? request.comments.map((c) => ({
        id: c.id,
        authorName: c.authorName,
        role: c.role.toLowerCase() as any,
        text: c.text,
        createdAt: c.createdAt.split(".")[0].replace("T", " ").substring(0, 16),
      }))
    : [],
  documents: request.documents.map((doc) => ({
    id: doc.id,
    requestId: doc.compensationRequestId,
    fileName: doc.fileName,
    sizeInBytes: doc.sizeInBytes,
    contentType: doc.contentType,
    createdAt: doc.createdAt,
  })),
});

export const CoordinatorRequestsPage = ({
  user,
  userRole = "coordinator",
  requestId,
}: CoordinatorRequestsPageProps) => {
  const navigate = useNavigate();

  // Filter States
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState<CourseFilter>("all");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Data State
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [viewState, setViewState] = useState<"list" | "details">("list");
  const [selectedRequest, setSelectedRequest] = useState<ClassRequest | null>(
    null,
  );
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const { selectedYear } = useAcademicYear();

  const isAdmin = userRole === "admin";
  const itemsPerPage = viewMode === "board" ? 6 : 10;

  const loadRequests = useCallback(async () => {
    if (!selectedYear) return;
    try {
      const loadedRequests = await listCompensationRequests(undefined, undefined, selectedYear.id);
      setRequests(loadedRequests.map(toClassRequest));
      setRequestsLoaded(true);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to load compensation requests."),
      );
    }
  }, [selectedYear]);

  const isNearDate = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    filterCourse,
    statusFilter,
    sortOrder,
    showHistory,
    viewMode,
  ]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  // Sync selectedRequest with requestId prop
  useEffect(() => {
    if (!requestsLoaded) return;

    if (requestId) {
      const fetchRequest = async () => {
        try {
          const req = await getCompensationRequest(requestId);
          if (req) {
            const mapped = toClassRequest(req);
            setSelectedRequest(mapped);
            setViewState("details");
          } else {
            toast.error("Compensation request not found.");
            navigate("/requests");
          }
        } catch (err) {
          toast.error("Unable to load request details.");
          navigate("/requests");
        }
      };
      void fetchRequest();
    } else {
      setSelectedRequest(null);
      setViewState("list");
    }
  }, [requestId, requestsLoaded, navigate]);

  const handleStatusChange = async (
    requestId: string,
    newStatus: "approved" | "rejected" | "pending",
    reason?: string,
  ) => {
    if (isAdmin) {
      toast.error("Administrators cannot change request status.");
      return;
    }

    if (newStatus === "rejected" && !reason) {
      setRequestToReject(requestId);
      return;
    }

    try {
      const updated = await updateCompensationRequestStatus(
        requestId,
        (newStatus.charAt(0).toUpperCase() + newStatus.slice(1)) as any,
        reason,
      );

      if (!updated) {
        throw new Error("Status response was empty.");
      }

      const mapped = toClassRequest(updated);

      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? mapped : req)),
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(mapped);
      }

      toast.success(`Request ${newStatus} successfully.`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Unable to ${newStatus} request.`));
    }
  };

  const confirmRejection = (reason: string) => {
    if (requestToReject) {
      handleStatusChange(requestToReject, "rejected", reason);
      setRequestToReject(null);
    }
  };

  const handleAddComment = async (requestId: string, text: string) => {
    try {
      const savedComment = await addCompensationRequestComment(requestId, text);
      if (savedComment) {
        const mappedComment = {
          id: savedComment.id,
          authorName: savedComment.authorName,
          role: savedComment.role.toLowerCase() as any,
          text: savedComment.text,
          createdAt: savedComment.createdAt.split(".")[0].replace("T", " ").substring(0, 16),
        };

        setRequests((prev) =>
          prev.map((req) => {
            if (req.id === requestId) {
              const updated = {
                ...req,
                comments: [...req.comments, mappedComment],
              };
              if (selectedRequest?.id === requestId) {
                setSelectedRequest(updated);
              }
              return updated;
            }
            return req;
          }),
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save comment."));
    }
  };

  const handleUploadDocument = async (requestId: string, file: File) => {
    try {
      const uploaded = await uploadCompensationRequestDocument(requestId, file);
      if (uploaded) {
        setRequests((prev) =>
          prev.map((req) => {
            if (req.id === requestId) {
              const newDoc = {
                id: uploaded.id,
                requestId: uploaded.compensationRequestId,
                fileName: uploaded.fileName,
                sizeInBytes: uploaded.sizeInBytes,
                contentType: uploaded.contentType,
                createdAt: uploaded.createdAt,
              };
              const updated = {
                ...req,
                documents: [...req.documents, newDoc],
              };
              if (selectedRequest?.id === requestId) {
                setSelectedRequest(updated);
              }
              return updated;
            }
            return req;
          }),
        );
        toast.success("Document uploaded successfully.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload document."));
    }
  };

  const handleDeleteDocument = async (requestId: string, documentId: string) => {
    try {
      await deleteCompensationRequestDocument(requestId, documentId);
      setRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            const updated = {
              ...req,
              documents: req.documents.filter((d) => d.id !== documentId),
            };
            if (selectedRequest?.id === requestId) {
              setSelectedRequest(updated);
            }
            return updated;
          }
          return req;
        }),
      );
      toast.success("Document deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete document."));
    }
  };

  const openDetails = (req: ClassRequest) => {
    navigate(`/requests/${req.id}`);
  };

  const backToList = () => {
    navigate("/requests");
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = filterCourse === "all" || req.course === filterCourse;
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const displayedRequests = filteredRequests
    .filter((r) => {
      const isPast = new Date(r.newDate) < new Date();
      if (showHistory) return isPast;
      return !isPast;
    })
    .sort((a, b) => {
      const dateA = new Date(a.newDate).getTime();
      const dateB = new Date(b.newDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const totalPages = Math.ceil(displayedRequests.length / itemsPerPage);
  const paginatedRequests = displayedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDownloadDocument = (requestId: string, documentId: string) => {
    const url = getDocumentDownloadUrl(requestId, documentId);
    window.open(url, "_blank");
  };

  if (viewState === "details" && selectedRequest) {
    return (
      <RequestDetailsPage
        request={selectedRequest}
        onBack={backToList}
        onAddComment={handleAddComment}
        onStatusChange={isAdmin ? undefined : handleStatusChange}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onDownloadDocument={handleDownloadDocument}
        userRole={userRole}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Requests Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isAdmin ? "Monitor" : "Manage"} and track compensation requests.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportOpen(true)}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 px-5 h-9"
            >
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        <FilterBar
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          courseFilter={filterCourse}
          onCourseFilterChange={setFilterCourse}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          showHistory={showHistory}
          onShowHistoryChange={setShowHistory}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {viewMode === "board" ? (
            <KanbanBoard
              requests={paginatedRequests}
              userRole={userRole}
              isNearDate={isNearDate}
              onViewDetails={openDetails}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <RequestsTable
              requests={paginatedRequests}
              userRole={userRole}
              showHistory={showHistory}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onViewDetails={openDetails}
            />
          )}
        </div>

        <RejectionDialog
          open={!!requestToReject}
          onOpenChange={(open) => !open && setRequestToReject(null)}
          onConfirm={confirmRejection}
        />

        <ExportRequestsModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          user={user}
        />
      </div>
    </DndProvider>
  );
};
