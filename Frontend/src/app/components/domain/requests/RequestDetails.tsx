import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Calendar, Clock, MapPin, Send, MessageSquare, User, Users, BookOpen } from 'lucide-react';
import { ClassRequest, Comment, mockUser } from '../../../mocks/data';
import { cn } from '../../ui/utils';

interface RequestDetailsProps {
  request: ClassRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComment: (requestId: string, text: string) => void;
}

export const RequestDetails = ({ request, open, onOpenChange, onAddComment }: RequestDetailsProps) => {
  const [newComment, setNewComment] = useState('');

  if (!request) return null;

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(request.id, newComment);
    setNewComment('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };

  const getComponentBadge = (type: string) => {
      switch(type) {
          case 'theoretical': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">Theoretical</Badge>;
          case 'practical': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Practical</Badge>;
          default: return <Badge variant="outline" className="text-slate-500">Standard</Badge>;
      }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col bg-slate-50/50">
        
        {/* Header */}
        <SheetHeader className="px-6 py-6 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-2 mb-2">
             <div className={cn("w-2 h-2 rounded-full", getStatusColor(request.status))} />
             <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{request.status}</span>
             <span className="text-slate-300">•</span>
             <span className="text-xs text-slate-400">ID: {request.id.toUpperCase()}</span>
          </div>
          <SheetTitle className="text-xl font-bold text-slate-900 leading-tight">
             {request.unit}
          </SheetTitle>
          <div className="flex flex-wrap gap-2 mt-2">
             <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                {request.course}
             </Badge>
             {getComponentBadge(request.componentType)}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
           <div className="p-6 space-y-8">
              
              {/* Info Grid */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
                 
                 {/* Groups */}
                 <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3 h-3" /> Targeted Groups
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {request.yearGroups.map((group, idx) => (
                            <Badge key={idx} variant="outline" className="font-normal text-slate-600 bg-slate-50">
                                {group}
                            </Badge>
                        ))}
                    </div>
                 </div>

                 <Separator />

                 {/* Schedule Comparison */}
                 <div className="grid grid-cols-2 gap-8 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2" />
                    
                    {/* Original */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original</span>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {request.originalDate}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-slate-400" /> {request.originalTime}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {request.originalRoom}
                            </div>
                        </div>
                    </div>

                    {/* New */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Proposed</span>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-900 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" /> {request.newDate}
                            </div>
                            <div className="flex items-center gap-2 text-slate-900 font-medium">
                                <Clock className="w-3.5 h-3.5 text-blue-500" /> {request.newTime}
                            </div>
                            <div className="flex items-center gap-2 text-slate-900 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-blue-500" /> {request.newRoom}
                            </div>
                        </div>
                    </div>
                 </div>

                 <Separator />

                 {/* Reason */}
                 <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> Justification
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{request.reason}"
                    </p>
                 </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Activity & Comments
                  </h3>
                  
                  <div className="space-y-4">
                      {request.comments.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-sm bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                              No comments yet. Start a conversation.
                          </div>
                      ) : (
                          request.comments.map((comment) => (
                              <div key={comment.id} className={cn(
                                  "flex gap-3 max-w-[90%]",
                                  comment.role === 'teacher' ? "ml-auto flex-row-reverse" : "mr-auto"
                              )}>
                                  <Avatar className="w-8 h-8 border border-slate-200">
                                      <AvatarFallback className={cn("text-xs", comment.role === 'teacher' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>
                                          {comment.authorName.charAt(0)}
                                      </AvatarFallback>
                                  </Avatar>
                                  <div className={cn(
                                      "p-3 rounded-2xl text-sm shadow-sm",
                                      comment.role === 'teacher' 
                                        ? "bg-blue-600 text-white rounded-tr-none" 
                                        : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                                  )}>
                                      <div className="flex items-center gap-2 mb-1 opacity-80 text-xs">
                                          <span className="font-bold">{comment.authorName}</span>
                                          <span>•</span>
                                          <span>{comment.createdAt}</span>
                                      </div>
                                      <p>{comment.text}</p>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

           </div>
        </div>

        {/* Footer Input */}
        <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-10">
            <div className="flex gap-2">
                <Input 
                    placeholder="Type a comment..." 
                    className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20" onClick={handleSubmitComment}>
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>

      </SheetContent>
    </Sheet>
  );
};
