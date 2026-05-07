import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { RequestForm } from '../../components/domain/requests/RequestForm';
import { RequestDetailsPage } from '../../components/domain/requests/RequestDetailsPage';
import { mockRequests, ClassRequest } from '../../mocks/data';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../../providers/LanguageContext';
import { FilterBar, ViewMode, SortOrder, StatusFilter, CourseFilter } from '../../components/common/FilterBar';
import { KanbanBoard } from '../../components/common/KanbanBoard';
import { RequestsTable } from '../../components/common/RequestsTable';

export const TeacherRequestsPage = () => {
  const { t } = useLanguage();
  
  // Dialog/Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ClassRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<ClassRequest | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  
  // Data State
  const [requests, setRequests] = useState<ClassRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<ClassRequest | null>(null);
  const [viewState, setViewState] = useState<'list' | 'details'>('list');
  
  const itemsPerPage = viewMode === 'board' ? 6 : 10;

  const isNearDate = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 0 && diffDays <= 3;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showHistory, viewMode, statusFilter, courseFilter]);

  const handleCreateRequest = (dataArray: any[]) => {
      const newRequests = dataArray.map((data: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'pending',
        teacherName: 'Dr. Ana Silva',
        submittedAt: new Date().toISOString().split('T')[0],
        comments: []
      }));
      setRequests(prev => [...prev, ...newRequests]);
  };

  const handleUpdateRequest = (data: any) => {
      setRequests(prev => prev.map(req => req.id === data.id ? { ...req, ...data } : req));
      setEditingRequest(null);
  };

  const handleCancelRequest = () => {
      if (!requestToCancel) return;
      setRequests(prev => prev.filter(req => req.id !== requestToCancel.id));
      toast.success(t('requests.cancel_success'));
      setRequestToCancel(null);
  };

  const handleAddComment = (requestId: string, text: string) => {
      const newComment = {
          id: Math.random().toString(36).substr(2, 9),
          authorName: 'Dr. Ana Silva',
          role: 'teacher' as const,
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

  const openEdit = (req: ClassRequest) => {
      setEditingRequest(req);
      setIsFormOpen(true);
  };

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
      req.unit.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || req.course === courseFilter;

    if (showHistory) {
      return matchesSearch && matchesStatus && matchesCourse && new Date(req.newDate) < new Date();
    } else {
      return matchesSearch && matchesStatus && matchesCourse && new Date(req.newDate) >= new Date();
    }
  }).sort((a, b) => {
    const dateA = new Date(a.newDate).getTime();
    const dateB = new Date(b.newDate).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (viewState === 'details' && selectedRequest) {
      return (
          <RequestDetailsPage 
              request={selectedRequest}
              onBack={backToList}
              onAddComment={handleAddComment}
          />
      );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('requests.title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('requests.subtitle')}</p>
           </div>
           <Button onClick={() => { setEditingRequest(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-5 transition-all hover:scale-105 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500">
              <Plus className="mr-2 h-4 w-4" /> {t('requests.new_request')}
           </Button>
        </div>

        <FilterBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          courseFilter={courseFilter}
          onCourseFilterChange={setCourseFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          showHistory={showHistory}
          onShowHistoryChange={setShowHistory}
          searchPlaceholder={t('requests.search_placeholder')}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {viewMode === 'board' ? (
            <KanbanBoard 
              requests={paginatedRequests}
              userRole="teacher"
              isNearDate={isNearDate}
              onViewDetails={openDetails}
              onEdit={openEdit}
              onCancel={(req) => setRequestToCancel(req)}
            />
          ) : (
            <RequestsTable 
              requests={paginatedRequests}
              userRole="teacher"
              showHistory={showHistory}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onViewDetails={openDetails}
              onEdit={openEdit}
            />
          )}
        </div>

        <RequestForm 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          onSubmit={editingRequest ? handleUpdateRequest : handleCreateRequest}
          initialData={editingRequest}
        />

        <AlertDialog open={!!requestToCancel} onOpenChange={(open) => !open && setRequestToCancel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel your request for 
                <span className="font-semibold text-slate-900 dark:text-slate-100"> {requestToCancel?.unit}</span> on 
                <span className="font-semibold text-slate-900 dark:text-slate-100"> {requestToCancel?.newDate}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelRequest} className="bg-red-600 hover:bg-red-700 text-white">
                Yes, cancel request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DndProvider>
  );
};
