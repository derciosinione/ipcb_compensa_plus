import React, { useState, useRef, useEffect } from 'react';
import { FileText, Loader2, Send, Paperclip, X, CalendarCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';
import { ScrollArea } from '../components/ui/scroll-area';
import { IAService } from '../services/api/ia.service';
import { useMutation } from '@tanstack/react-query';
import { createCompensationRequest } from '../services/compensationRequests/compensationRequestsApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getStoredAuthSession, mapSessionToUser } from '../services/auth/authSession';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  file?: File;
  action?: string;
  actionData?: any;
  isProcessing?: boolean;
}

interface AIChatInterfaceProps {
  compact?: boolean;
  maxHeight?: string;
}

export function AIChatInterface({ compact = false, maxHeight = 'calc(100vh - 8rem)' }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou o Assistente IA do Compensa+. Como posso ajudar? Você pode fazer perguntas sobre o sistema ou anexar documentos para que eu analise e preencha formulários automaticamente.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createRequestMutation = useMutation({
    mutationFn: createCompensationRequest,
    onSuccess: () => {
      toast.success('Pedido de compensação criado com sucesso!');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: '✅ Pedido de compensação inserido no sistema com sucesso.',
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      toast.error('Erro ao criar pedido de compensação.');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !file) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
      file: file || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentFile = file;
    setFile(null);

    setIsProcessing(true);
    const processingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'A processar a sua solicitação...',
      timestamp: new Date(),
      isProcessing: true,
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      let fileIds: string[] = [];
      
      if (currentFile) {
        const uploadRes = await IAService.uploadDocument(currentFile);
        fileIds.push(uploadRes.file_id);
      }

      const session = getStoredAuthSession();
      const user = session ? mapSessionToUser(session) : null;

      const response = await IAService.sendMessage({
        thread_id: threadId,
        message: input || "Processa este documento anexo e extrai as informações relevantes.",
        file_ids: fileIds.length > 0 ? fileIds : undefined,
        user_context: user ? {
          id: user.id,
          name: user.name,
          role: user.role,
          token: session?.accessToken
        } : undefined
      });

      if (response.thread_id) {
        setThreadId(response.thread_id);
      }

      setMessages(prev => prev.filter(m => m.id !== processingMessage.id));

      const resultMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: response.content || (response.action ? 'Encontrei as seguintes informações. Deseja prosseguir com a ação sugerida?' : ''),
        timestamp: new Date(),
        action: response.action,
        actionData: response.data
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Error with AI:', error);
      setMessages(prev => prev.filter(m => m.id !== processingMessage.id));
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro de comunicação. Por favor tente novamente.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = (action: string, data: any) => {
    if (action === 'CreateCompensationRequest') {
      const payload = {
         unitId: data.unitId,
         courseId: data.courseId,
         originalDate: data.originalDate,
         proposedDate: data.proposedDate,
         reason: data.reason || 'Sugerido pela Compensa IA',
         classroom: 'Sala Gerada (AI)',
         status: 'Pending',
         type: 'Anticipation'
      };
      
      createRequestMutation.mutate(payload as any);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: maxHeight }}>
      {/* Chat Messages */}
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="space-y-6 px-4 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type !== 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    IA
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col gap-2 max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'system'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {message.isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{message.content}</span>
                    </div>
                  ) : (
                    <div className="text-sm markdown-content prose dark:prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:p-0 prose-compact">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {message.file && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{message.file.name}</span>
                        <span className="text-white/70">
                          ({(message.file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {message.action === 'CreateCompensationRequest' && message.actionData && (
                  <Card className="w-full mt-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardHeader className="py-3 px-4 border-b border-blue-100 dark:border-blue-900">
                       <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4"/> Rascunho de Pedido
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                       <div className="text-sm grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                          <span className="font-medium">Unidade Curricular:</span>
                          <span>{message.actionData.unitId}</span>
                          <span className="font-medium">Data Original:</span>
                          <span>{message.actionData.originalDate}</span>
                          <span className="font-medium">Data Proposta:</span>
                          <span>{message.actionData.proposedDate}</span>
                          <span className="font-medium">Motivo:</span>
                          <span>{message.actionData.reason}</span>
                       </div>
                       <div className="pt-3">
                         <Button 
                            className="w-full" 
                            size="sm" 
                            disabled={createRequestMutation.isPending}
                            onClick={() => handleAction(message.action as string, message.actionData)}
                         >
                            {createRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                            Submeter Pedido
                         </Button>
                       </div>
                    </CardContent>
                  </Card>
                )}

                <span className="text-xs text-slate-400 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {message.type === 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    EU
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 pt-4 border-t border-slate-200 dark:border-slate-800">
        {file && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300 flex-1">
              {file.name}
            </span>
            <button
              onClick={() => setFile(null)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
            onChange={handleFileSelect}
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite a sua mensagem ou faça o upload de um documento..."
              className="min-h-[60px] max-h-[120px] resize-none pr-12"
              disabled={isProcessing}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={(!input.trim() && !file) || isProcessing}
            size="icon"
            className="flex-shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!compact && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setInput('Agendar compensação para a próxima terça')}
              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Agendar compensação
            </button>
            <button
              onClick={() => setInput('Quais são as regras para submeter pedidos?')}
              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Regras do sistema
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
