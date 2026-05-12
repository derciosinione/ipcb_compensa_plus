import React, { useCallback, useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner@2.0.3';
import type { ClassRequest } from '../../types/requests';
import { RequestDetailsPage } from '../../components/domain/requests/RequestDetailsPage';
import { RejectionDialog } from '../../components/domain/requests/RejectionDialog';
import { FilterBar, ViewMode, SortOrder, StatusFilter, CourseFilter } from '../../components/common/FilterBar';
import { KanbanBoard } from '../../components/common/KanbanBoard';
import { RequestsTable } from '../../components/common/RequestsTable';
import { listCompensationRequests, updateCompensationRequestStatus } from '../../services/compensationRequests/compensationRequestsApi';
import type { CompensationRequest } from '../../services/compensationRequests/compensationRequestTypes';
import { getErrorMessage } from '../../utils/errors';

interface CoordinatorRequestsPageProps {
  userRole?: 'coordinator' | 'admin' | 'teacher';
}

const toClassRequest = (request: CompensationRequest): ClassRequest => ({
  id: request.id,
  course: request.course,
  unit: request.curricularUnit,
  yearGroups: request.yearGroups,
  componentType: request.componentType.toLowerCase() as ClassRequest['componentType'],
  originalDate: request.originalDate,
  originalTime: `${request.originalStartTime.slice(0, 5)} - ${request.originalEndTime.slice(0, 5)}`,
  originalRoom: request.originalRoom,
  newDate: request.newDate,
  newTime: `${request.newStartTime.slice(0, 5)} - ${request.newEndTime.slice(0, 5)}`,
  newRoom: request.newRoom,
  reason: request.justification,
  status: request.status.toLowerCase() as ClassRequest['status'],
  teacherName: request.teacherName,
  submittedAt: request.submittedAt.split('T')[0],
  hasConflict: request.hasConflict,
  rejectionReason: request.decisionComment ?? undefined,
  comments: [],
});

export const CoordinatorRequestsPage = ({ userRole = 'coordinator' }: CoordinatorRequestsPageProps) => {
  // Filter States
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<CourseFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data State
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [viewState, setViewState] = useState<'list' | 'details'>('list');
  const [selectedRequest, setSelectedRequest] = useState<ClassRequest | null>(null);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';
  const itemsPerPage = viewMode === 'board' ? 6 : 10;

  const loadRequests = useCallback(async () => {
    try {
      const loadedRequests = await listCompensationRequests();
      setRequests(loadedRequests.map(toClassRequest));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load compensation requests.'));
    }
  }, []);

  const isNearDate = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 0 && diffDays <= 3;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCourse, statusFilter, sortOrder, showHistory, viewMode]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleStatusChange = async (requestId: string, newStatus: 'approved' | 'rejected' | 'pending', reason?: string) => {
      if (isAdmin) {
          toast.error("Administrators cannot change request status.");
          return;
      }

      if (newStatus === 'rejected' && !reason) {
          setRequestToReject(requestId);
          return;
      }

      try {
          const updated = await updateCompensationRequestStatus(
              requestId,
              newStatus.charAt(0).toUpperCase() + newStatus.slice(1) as any,
              reason,
          );

          if (!updated) {
              throw new Error('Status response was empty.');
          }

          const mapped = toClassRequest(updated);

          setRequests(prev => prev.map(req => req.id === requestId ? mapped : req));

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
          handleStatusChange(requestToReject, 'rejected', reason);
          setRequestToReject(null);
      }
  };

  const handleAddComment = (requestId: string, text: string) => {
      const newComment = {
          id: createLocalId(),
          authorName: isAdmin ? 'Admin' : 'Coordinator', 
          role: userRole as any,
          text,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setRequests(prev => prev.map(req => {
          if (req.id === requestId) {
              const updated = { ...req, comments: [...req.comments, newComment] };
              if (selectedRequest?.id === requestId) {
                  setSelectedRequest(updated);
              }
              return updated;
          }
          return req;
      }));
  };

  const createLocalId = () => crypto.randomUUID?.() ?? `local-${Date.now()}`;

  const openDetails = (req: ClassRequest) => {
      setSelectedRequest(req);
      setViewState('details');
  };

  const backToList = () => {
      setViewState('list');
      setSelectedRequest(null);
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || req.course === filterCourse;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const displayedRequests = filteredRequests.filter(r => {
    const isPast = new Date(r.newDate) < new Date();
    if (showHistory) return isPast;
    return !isPast;
  }).sort((a, b) => {
    const dateA = new Date(a.newDate).getTime();
    const dateB = new Date(b.newDate).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  const totalPages = Math.ceil(displayedRequests.length / itemsPerPage);
  const paginatedRequests = displayedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (viewState === 'details' && selectedRequest) {
      return (
          <RequestDetailsPage
              request={selectedRequest}
              onBack={backToList}
              onAddComment={handleAddComment}
              onStatusChange={isAdmin ? undefined : handleStatusChange}
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
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Requests Management</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
               {isAdmin ? 'Monitor' : 'Manage'} and track compensation requests.
            </p>
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
          {viewMode === 'board' ? (
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
      </div>
    </DndProvider>
  );
};
