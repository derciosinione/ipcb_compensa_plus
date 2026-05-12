import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Calendar, Clock, MapPin, Send, MessageSquare, User, Users, BookOpen, ArrowLeft, MoreHorizontal, AlertTriangle, Check, X as XIcon, Info } from 'lucide-react';
import type { ClassRequest } from '../../../types/requests';
import { cn } from '../../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { RejectionDialog } from './RejectionDialog';
import { useLanguage } from '../../../providers/LanguageContext';

interface RequestDetailsPageProps {
  request: ClassRequest;
  onBack: () => void;
  onAddComment: (requestId: string, text: string) => void;
  onStatusChange?: (requestId: string, status: 'approved' | 'rejected', reason?: string) => void;
  userRole?: 'teacher' | 'coordinator' | 'admin';
}

export const RequestDetailsPage = ({ request, onBack, onAddComment, onStatusChange, userRole = 'teacher' }: RequestDetailsPageProps) => {
  const [newComment, setNewComment] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { t } = useLanguage();

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(request.id, newComment);
    setNewComment('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'bg-red-500 text-red-700 bg-red-50 border-red-200';
      default: return 'bg-amber-500 text-amber-700 bg-amber-50 border-amber-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
      switch (status) {
        case 'approved': return t('requests.approved');
        case 'rejected': return t('requests.rejected');
        default: return t('requests.pending');
      }
  };

  const getComponentBadge = (type: string) => {
      switch(type) {
          case 'theoretical': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">Theoretical</Badge>;
          case 'practical': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Practical</Badge>;
          default: return <Badge variant="outline" className="text-slate-500">Standard</Badge>;
      }
  };

  const isNearDate = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 0 && diffDays <= 3;
  };
  
  const isNear = request.status === 'pending' && isNearDate(request.newDate);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Top Navigation Bar */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                <ArrowLeft className="w-4 h-4" />
                {t('details.back_to_requests')}
            </Button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 font-mono">ID: {request.id.toUpperCase()}</span>
                <Badge variant="outline" className={cn("capitalize border", getStatusColor(request.status))}>
                   <div className={cn("w-1.5 h-1.5 rounded-full mr-2", request.status === 'approved' ? 'bg-green-500' : request.status === 'pending' ? 'bg-amber-500' : 'bg-red-500')} />
                   {getStatusLabel(request.status)}
                </Badge>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
                 {userRole === 'coordinator' && request.status === 'pending' && (
                     <>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => setIsRejectDialogOpen(true)}>
                            <XIcon className="w-4 h-4 mr-2" /> {t('details.reject')}
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onStatusChange?.(request.id, 'approved')}>
                            <Check className="w-4 h-4 mr-2" /> {t('details.approve')}
                        </Button>
                     </>
                 )}
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>{t('details.download_pdf')}</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">{t('details.report_issue')}</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 pb-10">
                
                {isNear && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                             <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">{t('details.date_approaching')}</h4>
                             <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                                 {t('details.date_approaching_desc').replace('{date}', request.newDate)}
                             </p>
                        </div>
                    </div>
                )}

                {request.status === 'rejected' && request.rejectionReason && (
                     <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <Info className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                             <h4 className="text-sm font-bold text-red-700 dark:text-red-400">{t('details.rejection_reason')}</h4>
                             <p className="text-sm text-red-600 dark:text-red-300 mt-1 italic">
                                 "{request.rejectionReason}"
                             </p>
                        </div>
                    </div>
                )}
                
                {/* Main Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                     <div className="flex items-start justify-between mb-6">
                        <div>
                             <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{request.unit}</h1>
                             <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {request.course}
                                </Badge>
                                {getComponentBadge(request.componentType)}
                             </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">{t('details.submitted_by')}</span>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{request.teacherName}</span>
                                <Avatar className="h-8 w-8 border border-slate-100">
                                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">AS</AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">on {request.submittedAt}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                         {/* Original */}
                         <div className="space-y-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                {t('details.original_schedule')}
                            </span>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{request.originalDate}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span>{request.originalTime}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-400">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span>{request.originalRoom}</span>
                                </div>
                            </div>
                         </div>

                         {/* New */}
                         <div className="space-y-4 relative">
                            {/* Arrow for desktop */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </div>

                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                                {t('details.proposed_schedule')}
                            </span>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-900 dark:text-slate-200">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold">{request.newDate}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-900 dark:text-slate-200">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold">{request.newTime}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-900 dark:text-slate-200">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-400">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold">{request.newRoom}</span>
                                </div>
                            </div>
                         </div>
                     </div>

                     {request.hasConflict && (
                         <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
                             <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                             <div>
                                 <h4 className="text-sm font-bold text-red-700 dark:text-red-400">{t('details.room_conflict')}</h4>
                                 <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                     {t('details.room_conflict_desc').replace('{room}', request.newRoom)}
                                 </p>
                             </div>
                         </div>
                     )}
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4" /> {t('details.targeted_groups')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-wrap gap-2">
                                {request.yearGroups.map((group, idx) => (
                                    <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm font-normal">
                                        {group}
                                    </Badge>
                                ))}
                             </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> {t('details.justification')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                 "{request.reason}"
                             </p>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Right Column: Chat */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[600px] lg:h-auto overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> {t('details.discussion')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('details.chat_desc').replace('{role}', userRole === 'teacher' ? t('role.coordinator') : t('role.teacher'))}
                    </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
                    {request.comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                            <p>{t('details.no_comments')}</p>
                        </div>
                    ) : (
                        request.comments.map((comment) => {
                             const isMe = (userRole === 'teacher' && comment.role === 'teacher') || (userRole === 'coordinator' && comment.role === 'coordinator');
                             return (
                                <div key={comment.id} className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                                    <Avatar className="w-8 h-8 border border-white shadow-sm mt-1">
                                        <AvatarFallback className={cn("text-xs", comment.role === 'teacher' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>
                                            {comment.authorName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm shadow-sm",
                                            isMe 
                                                ? "bg-blue-600 text-white rounded-tr-none" 
                                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none"
                                        )}>
                                            <p>{comment.text}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 block px-1">
                                            {comment.createdAt}
                                        </span>
                                    </div>
                                </div>
                             );
                        })
                    )}
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex gap-2">
                        <Input 
                            placeholder={t('details.type_message')}
                            className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                        />
                        <Button size="icon" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmitComment}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

        </div>

        <RejectionDialog 
            open={isRejectDialogOpen} 
            onOpenChange={setIsRejectDialogOpen}
            onConfirm={(reason) => onStatusChange?.(request.id, 'rejected', reason)}
        />
    </div>
  );
};
