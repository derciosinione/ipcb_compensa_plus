import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Check, X, AlertTriangle, FileText, Calendar, Clock, MapPin, User, ChevronRight, Inbox, LayoutGrid, Table as TableIcon, Search, Filter, History, ArrowUpDown, MoreHorizontal, Download, SlidersHorizontal } from 'lucide-react';
import { Badge } from '../ui/badge';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { mockRequests, ClassRequest, RequestStatus } from './data';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Input } from "../ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';
import { RequestDetailsPage } from './RequestDetailsPage';
import { RejectionDialog } from './RejectionDialog';
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
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

type ViewMode = 'board' | 'table';
const ITEM_TYPE = 'REQUEST_CARD';

interface CoordinatorViewProps {
  userRole?: 'coordinator' | 'admin' | 'teacher';
}

export const CoordinatorView = ({ userRole = 'coordinator' }: CoordinatorViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<ClassRequest[]>(mockRequests);
  
  // Navigation State
  const [viewState, setViewState] = useState<'list' | 'details'>('list');
  const [selectedRequest, setSelectedRequest] = useState<ClassRequest | null>(null);

  // Rejection Dialog State
  const [requestToReject, setRequestToReject] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';
  const itemsPerPage = viewMode === 'board' ? 6 : 10;

  // Helper to check if date is near (within 3 days)
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

  const handleStatusChange = (requestId: string, newStatus: 'approved' | 'rejected', reason?: string) => {
      if (isAdmin) {
          toast.error("Administrators cannot change request status.");
          return;
      }

      if (newStatus === 'rejected' && !reason) {
          setRequestToReject(requestId);
          return;
      }

      setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: newStatus, rejectionReason: reason } : req
      ));

      if (selectedRequest?.id === requestId) {
          setSelectedRequest(prev => prev ? { ...prev, status: newStatus, rejectionReason: reason } : null);
      }
      
      toast.success(`Request ${newStatus} successfully.`);
  };

  const confirmRejection = (reason: string) => {
      if (requestToReject) {
          handleStatusChange(requestToReject, 'rejected', reason);
          setRequestToReject(null);
      }
  };

  const handleAddComment = (requestId: string, text: string) => {
      const newComment = {
          id: Math.random().toString(36).substr(2, 9),
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

  const openDetails = (req: ClassRequest) => {
      setSelectedRequest(req);
      setViewState('details');
  };

  const backToList = () => {
      setViewState('list');
      setSelectedRequest(null);
  };

  // Filter requests based on search, course, and history mode
  const filteredRequests = requests.filter(req => {
    // Search Filter
    const matchesSearch = 
      req.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Course Filter
    const matchesCourse = filterCourse === 'all' || req.course === filterCourse;
    
    // Status Filter
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
  
  const RequestCard = ({ request, isCompact = false }: { request: ClassRequest, isCompact?: boolean }) => {
    const isNear = request.status === 'pending' && isNearDate(request.newDate);

    const [{ isDragging }, dragRef] = useDrag({
      type: ITEM_TYPE,
      item: request,
      canDrag: !isAdmin, // Admins cannot drag
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div 
        ref={dragRef} 
        className={cn("transition-all duration-300 touch-none", isDragging ? "opacity-50 cursor-grabbing" : !isAdmin ? "cursor-grab" : "")}
      >
      <Card 
        className={cn(
         "overflow-hidden transition-all duration-300 border-0 shadow-sm hover:shadow-md group bg-white dark:bg-slate-900 ring-1 dark:ring-slate-800 mb-4", 
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
                        <span key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 px-1 rounded truncate max-w-[150px]">
                            {group}
                        </span>
                    ))}
                </div>
             </div>
             
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Avatar className="h-6 w-6 border border-white dark:border-slate-800 shadow-sm cursor-help">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.teacherName}`} />
                      <AvatarFallback className="text-[10px]">{request.teacherName.substring(0,2)}</AvatarFallback>
                   </Avatar>
                 </TooltipTrigger>
                 <TooltipContent>
                   <p>{request.teacherName}</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>

             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="h-6 w-6 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                   <MoreHorizontal className="h-3.5 w-3.5" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900">
                 <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 font-normal">Actions</DropdownMenuLabel>
                 <DropdownMenuItem onClick={() => openDetails(request)} className="cursor-pointer">
                    View Details
                 </DropdownMenuItem>
                 {!isAdmin && request.status === 'pending' && (
                   <>
                     <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                     <DropdownMenuItem 
                        className="text-green-600 dark:text-green-400 focus:text-green-700 dark:focus:text-green-300 cursor-pointer"
                        onClick={() => handleStatusChange(request.id, 'approved')}
                     >
                        Approve Request
                     </DropdownMenuItem>
                     <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 cursor-pointer"
                        onClick={() => handleStatusChange(request.id, 'rejected')}
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
           
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-xs border border-slate-100 dark:border-slate-800 mb-3">
              <span className="text-slate-400 font-bold uppercase mr-1.5 text-[10px]">Reason:</span>
              <span className="text-slate-700 dark:text-slate-300 italic line-clamp-1">"{request.reason}"</span>
           </div>
  
           {!isAdmin && request.status === 'pending' && (
             <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs flex-1 border-slate-200 dark:border-slate-700 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(request.id, 'rejected');
                    }}
                >
                  Reject
                </Button>
                <Button 
                    size="sm" 
                    className="h-7 text-xs flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(request.id, 'approved');
                    }}
                >
                  Approve
                </Button>
             </div>
           )}
        </CardContent>
      </Card>
      </div>
    );
  };

  const DroppableColumn = ({ 
      title, 
      status,
      requests, 
      icon,
      isCompact = false
  }: { 
      title: string; 
      status: 'pending' | 'approved' | 'rejected';
      requests: ClassRequest[]; 
      icon: React.ReactNode;
      isCompact?: boolean;
  }) => {
      const [{ isOver }, dropRef] = useDrop({
        accept: ITEM_TYPE,
        canDrop: () => !isAdmin, // Disable drop for admins
        drop: (item: ClassRequest) => {
            if (!isAdmin && item.status !== status) {
                handleStatusChange(item.id, status);
            }
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      });

      return (
          <div 
             ref={dropRef}
             className={cn(
                 "bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col h-full min-h-[500px] transition-colors",
                 isOver && "bg-blue-50/50 ring-2 ring-blue-400/20"
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
             <div className="space-y-4">
                {requests.map(req => <RequestCard key={req.id} request={req} isCompact={isCompact} />)}
                {requests.length === 0 && (
                   <div className="text-center py-10 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      No {status} requests
                   </div>
                )}
             </div>
          </div>
      );
  };

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

  // Group for Kanban using paginated data
  const kanbanColumns = {
    pending: paginatedRequests.filter(r => r.status === 'pending'),
    approved: paginatedRequests.filter(r => r.status === 'approved'),
    rejected: paginatedRequests.filter(r => r.status === 'rejected'),
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Requests Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             {isAdmin ? 'Monitor' : 'Manage'} and track compensation requests.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                 placeholder="Search requests..." 
                 className="pl-9 w-full sm:w-[250px] bg-white dark:bg-slate-900" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Button 
                variant={viewMode === 'board' ? 'white' : 'ghost'} 
                size="sm" 
                className={cn("h-8 px-3 text-xs font-medium rounded-md", viewMode === 'board' && "shadow-sm text-blue-600 dark:text-blue-400 dark:bg-slate-700")}
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                Board
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'white' : 'ghost'} 
                size="sm" 
                className={cn("h-8 px-3 text-xs font-medium rounded-md", viewMode === 'table' && "shadow-sm text-blue-600 dark:text-blue-400 dark:bg-slate-700")}
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="w-3.5 h-3.5 mr-2" />
                List
              </Button>
           </div>
        </div>
      </div>

      <Separator className="dark:bg-slate-800" />

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full flex-1 flex flex-col">
         <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <TabsList className="bg-slate-100 dark:bg-slate-800">
               <TabsTrigger value="active" onClick={() => setShowHistory(false)}>Active Requests</TabsTrigger>
               <TabsTrigger value="history" onClick={() => setShowHistory(true)}>
                  <History className="w-3.5 h-3.5 mr-2" />
                  History
               </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800", filterCourse !== 'all' && "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800")}>
                       <SlidersHorizontal className="h-4 w-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 dark:bg-slate-900 dark:border-slate-800">
                   <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">Filter Course</DropdownMenuLabel>
                   <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setFilterCourse('all')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">All Courses</span>
                        {filterCourse === 'all' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setFilterCourse('Computer Science')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">Computer Science</span>
                        {filterCourse === 'Computer Science' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setFilterCourse('Information Systems')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">Information Systems</span>
                        {filterCourse === 'Information Systems' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setFilterCourse('Design')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">Design</span>
                        {filterCourse === 'Design' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
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
                   <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">Filter Status</DropdownMenuLabel>
                   <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('all')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">All Requests</span>
                        {statusFilter === 'all' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('pending')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">Pending</span>
                        {statusFilter === 'pending' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('approved')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">Approved</span>
                        {statusFilter === 'approved' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => setStatusFilter('rejected')}>
                      <div className="flex items-center w-full">
                        <span className="flex-1">Rejected</span>
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
                     <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">Sort by Date</DropdownMenuLabel>
                     <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                     <DropdownMenuItem className="cursor-pointer" onClick={() => setSortOrder('asc')}>
                        <div className="flex items-center w-full">
                          <span className="flex-1">Oldest First</span>
                          {sortOrder === 'asc' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                     </DropdownMenuItem>
                     <DropdownMenuItem className="cursor-pointer" onClick={() => setSortOrder('desc')}>
                        <div className="flex items-center w-full">
                          <span className="flex-1">Newest First</span>
                          {sortOrder === 'desc' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>

         <TabsContent value="active" className="flex-1 flex flex-col min-h-0">
             {viewMode === 'board' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
                   <DroppableColumn 
                      title="Pending Review" 
                      status="pending"
                      requests={kanbanColumns.pending}
                      icon={<Inbox className="w-4 h-4 text-amber-500" />}
                   />
                   <DroppableColumn 
                      title="Approved" 
                      status="approved"
                      requests={kanbanColumns.approved}
                      icon={<Check className="w-4 h-4 text-green-500" />}
                      isCompact
                   />
                   <DroppableColumn 
                      title="Rejected" 
                      status="rejected"
                      requests={kanbanColumns.rejected}
                      icon={<X className="w-4 h-4 text-red-500" />}
                      isCompact
                   />
                </div>
             ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    <Table>
                       <TableHeader className="bg-slate-50 dark:bg-slate-800">
                         <TableRow>
                           <TableHead className="w-[300px]">Class Unit</TableHead>
                           <TableHead>Teacher</TableHead>
                           <TableHead>Proposed Date</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead className="text-right">Actions</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {paginatedRequests.map((req) => (
                           <TableRow key={req.id}>
                             <TableCell>
                                <div className="font-medium">{req.unit}</div>
                                <div className="text-xs text-slate-500">{req.course}</div>
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-2">
                                   <Avatar className="h-6 w-6">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.teacherName}`} />
                                      <AvatarFallback>{req.teacherName.substring(0,2)}</AvatarFallback>
                                   </Avatar>
                                   <span>{req.teacherName}</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="flex flex-col">
                                   <span className="text-sm">{req.newDate}</span>
                                   <span className="text-xs text-slate-500">{req.newTime}</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge variant="secondary" className={cn(
                                   "capitalize",
                                   req.status === 'approved' ? "bg-green-100 text-green-700" :
                                   req.status === 'rejected' ? "bg-red-100 text-red-700" :
                                   "bg-amber-100 text-amber-700"
                                )}>
                                   {req.status}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right">
                                <Button size="sm" variant="ghost" onClick={() => openDetails(req)}>Details</Button>
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                    </Table>
                </div>
             )}
         </TabsContent>

         <TabsContent value="history">
             <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <Table>
                   <TableHeader className="bg-slate-50 dark:bg-slate-800">
                     <TableRow>
                       <TableHead className="w-[300px]">Class Unit</TableHead>
                       <TableHead>Teacher</TableHead>
                       <TableHead>Original Date</TableHead>
                       <TableHead>New Date</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {paginatedRequests.map((req) => (
                       <TableRow key={req.id}>
                         <TableCell>
                            <div className="font-medium">{req.unit}</div>
                            <div className="text-xs text-slate-500">{req.course}</div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-2">
                               <Avatar className="h-6 w-6">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.teacherName}`} />
                                  <AvatarFallback>{req.teacherName.substring(0,2)}</AvatarFallback>
                               </Avatar>
                               <span>{req.teacherName}</span>
                            </div>
                         </TableCell>
                         <TableCell>{req.originalDate}</TableCell>
                         <TableCell>{req.newDate}</TableCell>
                         <TableCell>
                            <Badge variant="secondary" className={cn(
                               "capitalize",
                               req.status === 'approved' ? "bg-green-100 text-green-700" :
                               req.status === 'rejected' ? "bg-red-100 text-red-700" :
                               "bg-amber-100 text-amber-700"
                            )}>
                               {req.status}
                            </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openDetails(req)}>Details</Button>
                         </TableCell>
                       </TableRow>
                     ))}
                     {paginatedRequests.length === 0 && (
                        <TableRow>
                           <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                              No history records found.
                           </TableCell>
                        </TableRow>
                     )}
                   </TableBody>
                </Table>
             </div>
         </TabsContent>
      </Tabs>
      
      {totalPages > 1 && (
        <Pagination className="justify-end">
           <PaginationContent>
              <PaginationItem>
                 <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={cn("cursor-pointer", currentPage === 1 && "opacity-50 pointer-events-none")}
                 />
              </PaginationItem>
              <PaginationItem>
                 <span className="px-4 text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                 </span>
              </PaginationItem>
              <PaginationItem>
                 <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={cn("cursor-pointer", currentPage === totalPages && "opacity-50 pointer-events-none")}
                 />
              </PaginationItem>
           </PaginationContent>
        </Pagination>
      )}

      <RejectionDialog 
          open={!!requestToReject} 
          onOpenChange={(open) => !open && setRequestToReject(null)}
          onConfirm={confirmRejection}
      />
    </div>
    </DndProvider>
  );
};
