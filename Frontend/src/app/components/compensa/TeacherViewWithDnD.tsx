import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Plus, MoreHorizontal, Search, Filter, SlidersHorizontal, ArrowUpDown, LayoutGrid, Table as TableIcon, Calendar, Clock, AlertTriangle, Check, X, History } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Card, CardContent, CardHeader } from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { RequestForm } from './RequestForm';
import { RequestDetailsPage } from './RequestDetailsPage';
import { mockRequests, ClassRequest, RequestStatus } from './data';
import { cn } from '../ui/utils';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useLanguage } from './LanguageContext';

type ViewMode = 'board' | 'table';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type CourseFilter = 'all' | 'Computer Science' | 'Information Systems' | 'Design';

const ITEM_TYPE = 'REQUEST_CARD';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();
  const styles = {
    approved: "bg-green-50 text-green-700 ring-1 ring-green-600/20 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-900",
    rejected: "bg-red-50 text-red-700 ring-1 ring-red-600/20 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-900",
  };
  
  const label = status === 'approved' ? t('requests.approved') :
                status === 'pending' ? t('requests.pending') :
                t('requests.rejected');

  return (
    <Badge variant="secondary" className={cn("font-medium px-2.5 py-0.5 rounded-full transition-colors", styles[status as keyof typeof styles])}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", 
         status === 'approved' ? 'bg-green-500' : 
         status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
      )} />
      {label}
    </Badge>
  );
};

// Draggable Request Card
const DraggableRequestCard = ({ 
  request, 
  isCompact = false,
  isNearDate,
  onViewDetails,
  onEdit,
  onCancel
}: { 
  request: ClassRequest;
  isCompact?: boolean;
  isNearDate: (date: string) => boolean;
  onViewDetails: (req: ClassRequest) => void;
  onEdit: (req: ClassRequest) => void;
  onCancel: (req: ClassRequest) => void;
}) => {
  const { t } = useLanguage();
  const isNear = request.status === 'pending' && isNearDate(request.newDate);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: request.id, currentStatus: request.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [request.id, request.status]);

  const getComponentBadge = (type: string) => {
     switch(type) {
         case 'theoretical': return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">T</span>;
         case 'practical': return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">P</span>;
         default: return null;
     }
  };

  return (
    <div
      ref={drag}
      className={cn(
        "transition-all duration-300",
        isDragging && "opacity-50 cursor-grabbing"
      )}
    >
      <Card className={cn(
         "overflow-hidden transition-all duration-300 border-0 shadow-sm hover:shadow-md group bg-white dark:bg-slate-900 ring-1 dark:ring-slate-800 mb-4 cursor-grab active:cursor-grabbing", 
         request.hasConflict ? "ring-red-100 bg-red-50/5 dark:bg-red-900/10 dark:ring-red-900/30" : 
         isNear ? "ring-amber-100 bg-amber-50/10 dark:bg-amber-900/10 dark:ring-amber-900/30" : "ring-slate-100"
      )}>
        <div className={cn("h-1 w-full", 
          request.status === 'approved' ? "bg-emerald-500" : 
          request.status === 'rejected' ? "bg-red-500" : 
          request.hasConflict ? "bg-red-500" : 
          isNear ? "bg-amber-500" : "bg-amber-500"
        )} />
        
        <CardHeader className={cn("px-4 py-3", isCompact ? "pb-2" : "pb-4")}>
          <div className="flex justify-between items-start gap-2">
             <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium text-[10px] uppercase tracking-wider border-slate-200 dark:border-slate-700">
                     {request.course}
                  </Badge>
                  {getComponentBadge(request.componentType)}
                  {request.hasConflict && (
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded text-[10px] font-bold cursor-help">
                             <AlertTriangle className="h-3 w-3" />
                           </div>
                         </TooltipTrigger>
                         <TooltipContent className="bg-red-600 text-white border-red-700">
                           <p>{t('requests.conflict_alert').replace('{room}', request.newRoom)}</p>
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
                           <p>{t('requests.soon_alert')}</p>
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
                        <span key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 px-1 rounded">
                            {group}
                        </span>
                    ))}
                </div>
             </div>
             
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onViewDetails(request)}>{t('requests.view_details')}</DropdownMenuItem>
                {request.status === 'pending' && <DropdownMenuItem onClick={() => onEdit(request)}>{t('requests.edit_request')}</DropdownMenuItem>}
                {request.status === 'pending' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400"
                        onClick={() => onCancel(request)}
                    >
                        {t('requests.cancel_request')}
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
                   <span className={cn(
                     request.status === 'pending' ? "text-slate-700 dark:text-slate-300 font-medium" : "",
                     isNear ? "text-amber-600 dark:text-amber-400 font-bold" : ""
                   )}>
                      {request.newDate}
                   </span>
               </div>
               <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                   <Clock className="w-3 h-3" />
                   <span>{request.newTime}</span>
               </div>
           </div>
           
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-xs border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-bold uppercase mr-1.5 text-[10px]">{t('requests.reason')}:</span>
              <span className="text-slate-700 dark:text-slate-300 italic line-clamp-1">"{request.reason}"</span>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Droppable Column
const DroppableColumn = ({
  status,
  title,
  icon,
  requests,
  isNearDate,
  onDrop,
  onViewDetails,
  onEdit,
  onCancel
}: {
  status: RequestStatus;
  title: string;
  icon: React.ReactNode;
  requests: ClassRequest[];
  isNearDate: (date: string) => boolean;
  onDrop: (itemId: string, newStatus: RequestStatus) => void;
  onViewDetails: (req: ClassRequest) => void;
  onEdit: (req: ClassRequest) => void;
  onCancel: (req: ClassRequest) => void;
}) => {
  const { t } = useLanguage();
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: string; currentStatus: RequestStatus }) => {
      if (item.currentStatus !== status) {
        onDrop(item.id, status);
      }
    },
    canDrop: (item: { currentStatus: RequestStatus }) => item.currentStatus !== status,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [status, onDrop]);

  return (
    <div
      ref={drop}
      className={cn(
        "bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col h-full min-h-[500px] transition-all",
        isOver && canDrop && "ring-2 ring-blue-400 bg-blue-50/50 dark:bg-blue-900/20",
        canDrop && !isOver && "ring-1 ring-blue-200 dark:ring-blue-800"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{title}</h3>
        </div>
        <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] h-5 px-1.5">
          {requests.length}
        </Badge>
      </div>
      <div className="space-y-4 flex-1">
        {requests.map(req => (
          <DraggableRequestCard 
            key={req.id} 
            request={req} 
            isCompact={status !== 'pending'}
            isNearDate={isNearDate}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        ))}
        {requests.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            {isOver && canDrop ? t('requests.drop_here').replace('{status}', title) : t('requests.no_requests').replace('{status}', title)}
          </div>
        )}
      </div>
    </div>
  );
};

export const TeacherView = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ClassRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ClassRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<ClassRequest | null>(null);
  const { t } = useLanguage();
  
  // Navigation State (List vs Details)
  const [viewState, setViewState] = useState<'list' | 'details'>('list');

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [requests, setRequests] = useState<ClassRequest[]>(mockRequests);
  
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

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
    
    // Also update selected request if needed
    if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
    }
    
    const statusLabels = {
      pending: t('requests.pending'),
      approved: t('requests.approved'),
      rejected: t('requests.rejected')
    };
    
    toast.success(t('requests.status_update').replace('{status}', statusLabels[newStatus]), {
      description: 'Status updated successfully',
    });
  };

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
      setViewState('details'); // Switch to details page
  };

  const backToList = () => {
      setViewState('list');
      setSelectedRequest(null);
  };

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

  const kanbanColumns = {
    pending: paginatedRequests.filter(r => r.status === 'pending'),
    approved: paginatedRequests.filter(r => r.status === 'approved'),
    rejected: paginatedRequests.filter(r => r.status === 'rejected'),
  };

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

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder={t('requests.search_placeholder')}
                  className="pl-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-800 transition-all rounded-xl dark:text-slate-200 dark:placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                   <Button 
                     variant={viewMode === 'board' ? 'white' : 'ghost'} 
                     size="sm" 
                     className={cn("h-8 px-3 text-xs font-medium rounded-md", viewMode === 'board' && "shadow-sm text-blue-600 dark:text-blue-400 dark:bg-slate-700")}
                     onClick={() => setViewMode('board')}
                   >
                     <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                     {t('requests.board_view')}
                   </Button>
                   <Button 
                     variant={viewMode === 'table' ? 'white' : 'ghost'} 
                     size="sm" 
                     className={cn("h-8 px-3 text-xs font-medium rounded-md", viewMode === 'table' && "shadow-sm text-blue-600 dark:text-blue-400 dark:bg-slate-700")}
                     onClick={() => setViewMode('table')}
                   >
                     <TableIcon className="w-3.5 h-3.5 mr-2" />
                     {t('requests.list_view')}
                   </Button>
                </div>
                
                <div className="flex items-center gap-2">
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800", courseFilter !== 'all' && "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800")}>
                           <SlidersHorizontal className="h-4 w-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-48 dark:bg-slate-900 dark:border-slate-800">
                       <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">{t('requests.filter_course')}</DropdownMenuLabel>
                       <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setCourseFilter('all')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">{t('requests.all_courses')}</span>
                            {courseFilter === 'all' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setCourseFilter('Computer Science')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">Computer Science</span>
                            {courseFilter === 'Computer Science' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setCourseFilter('Information Systems')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">Information Systems</span>
                            {courseFilter === 'Information Systems' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setCourseFilter('Design')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">Design</span>
                            {courseFilter === 'Design' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>

                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800", statusFilter !== 'all' && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800")}>
                           <Filter className="h-4 w-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-48 dark:bg-slate-900 dark:border-slate-800">
                       <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">{t('requests.filter_status')}</DropdownMenuLabel>
                       <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('all')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">{t('requests.all_requests')}</span>
                            {statusFilter === 'all' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('pending')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">{t('requests.pending')}</span>
                            {statusFilter === 'pending' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('approved')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">{t('requests.approved')}</span>
                            {statusFilter === 'approved' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                       <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('rejected')}>
                          <div className="flex items-center w-full">
                            <span className="flex-1">{t('requests.rejected')}</span>
                            {statusFilter === 'rejected' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>

                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                       <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800">
                           <ArrowUpDown className="h-4 w-4" />
                       </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 dark:bg-slate-900 dark:border-slate-800">
                         <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">{t('requests.sort_date')}</DropdownMenuLabel>
                         <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                         <DropdownMenuItem className="cursor-pointer" onClick={() => setSortOrder('asc')}>
                            <div className="flex items-center w-full">
                               <span className="flex-1">{t('requests.oldest_first')}</span>
                               {sortOrder === 'asc' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                            </div>
                         </DropdownMenuItem>
                         <DropdownMenuItem className="cursor-pointer" onClick={() => setSortOrder('desc')}>
                            <div className="flex items-center w-full">
                               <span className="flex-1">{t('requests.newest_first')}</span>
                               {sortOrder === 'desc' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                            </div>
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>

                   <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                   <Tabs value={showHistory ? 'history' : 'current'} onValueChange={(v) => setShowHistory(v === 'history')} className="w-auto">
                     <TabsList className="h-9 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <TabsTrigger value="current" className="text-xs px-3 h-7 rounded-md">{t('requests.current')}</TabsTrigger>
                        <TabsTrigger value="history" className="text-xs px-3 h-7 rounded-md">{t('requests.history')}</TabsTrigger>
                     </TabsList>
                   </Tabs>
                </div>
            </div>
        </div>
        
        {viewMode === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 h-full min-h-0 overflow-hidden">
            <DroppableColumn 
              status="pending" 
              title={t('requests.pending')}
              icon={<Clock className="w-4 h-4 text-amber-500" />} 
              requests={kanbanColumns.pending} 
              isNearDate={isNearDate}
              onDrop={handleStatusChange}
              onViewDetails={openDetails}
              onEdit={openEdit}
              onCancel={(req) => { setRequestToCancel(req); }}
            />
            <DroppableColumn 
              status="approved" 
              title={t('requests.approved')}
              icon={<Check className="w-4 h-4 text-emerald-500" />} 
              requests={kanbanColumns.approved} 
              isNearDate={isNearDate}
              onDrop={handleStatusChange}
              onViewDetails={openDetails}
              onEdit={openEdit}
              onCancel={(req) => { setRequestToCancel(req); }}
            />
            <DroppableColumn 
              status="rejected" 
              title={t('requests.rejected')}
              icon={<X className="w-4 h-4 text-red-500" />} 
              requests={kanbanColumns.rejected} 
              isNearDate={isNearDate}
              onDrop={handleStatusChange}
              onViewDetails={openDetails}
              onEdit={openEdit}
              onCancel={(req) => { setRequestToCancel(req); }}
            />
          </div>
        ) : (
          <Card className="border-none shadow-sm flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-2xl">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[300px] pl-6 text-slate-500 dark:text-slate-400">Class Unit & Course</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Date & Time</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Reason</TableHead>
                    <TableHead className="text-right pr-6 text-slate-500 dark:text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800 transition-colors cursor-pointer" onClick={() => openDetails(request)}>
                      <TableCell className="font-medium pl-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={cn("w-1 h-12 rounded-full", 
                              request.status === 'approved' ? "bg-emerald-500" : 
                              request.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                           )} />
                           <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{request.unit}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{request.course}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                               <Calendar className="w-3.5 h-3.5 text-slate-400" />
                               {request.newDate}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                               <Clock className="w-3.5 h-3.5 text-slate-400" />
                               {request.newTime}
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm text-slate-600 dark:text-slate-400" title={request.reason}>
                          {request.reason}
                        </p>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" onClick={(e) => { e.stopPropagation(); openEdit(request); }}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className={cn("cursor-pointer select-none", currentPage === 1 && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <PaginationItem key={page}>
                                <PaginationLink 
                                    isActive={currentPage === page}
                                    onClick={() => setCurrentPage(page)}
                                    className="cursor-pointer select-none"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className={cn("cursor-pointer select-none", currentPage === totalPages && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
          </Card>
        )}

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