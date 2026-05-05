import React, { useState, useRef, useEffect } from 'react';
import { FileText, Loader2, Send, Paperclip, Database, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner';
import { ScrollArea } from '../ui/scroll-area';

interface ExtractedData {
  headers: string[];
  rows: any[][];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  file?: File;
  extractedData?: ExtractedData;
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
      content: 'Hello! I\'m your AI assistant. Upload a document and tell me what data you\'d like to extract. I can help you convert documents into structured tables and save them to your database.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (currentFile) {
      setIsProcessing(true);

      const processingMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Processing your document...',
        timestamp: new Date(),
        isProcessing: true,
      };

      setMessages(prev => [...prev, processingMessage]);

      try {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('prompt', input || 'Extract all data from this document into a structured table');

        const response = await fetch('YOUR_BACKEND_URL/api/ai/process-document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process document');
        }

        const extractedData = await response.json();

        setMessages(prev => prev.filter(m => m.id !== processingMessage.id));

        const resultMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `I've extracted ${extractedData.rows.length} rows of data from your document. Here's what I found:`,
          timestamp: new Date(),
          extractedData,
        };

        setMessages(prev => [...prev, resultMessage]);
        toast.success('Document processed successfully!');
      } catch (error) {
        console.error('Error processing document:', error);
        setMessages(prev => prev.filter(m => m.id !== processingMessage.id));

        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: 'Sorry, I encountered an error processing your document. Please make sure your backend is configured and try again.',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
        toast.error('Failed to process document');
      } finally {
        setIsProcessing(false);
      }
    } else {
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Please upload a document so I can help you extract data from it. Use the attachment button to select a file.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, responseMessage]);
    }
  };

  const handleSaveToDatabase = async (extractedData: ExtractedData) => {
    try {
      const response = await fetch('YOUR_BACKEND_URL/api/database/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headers: extractedData.headers,
          rows: extractedData.rows,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to database');
      }

      toast.success('Data saved to database successfully!');

      const confirmMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `✓ Successfully saved ${extractedData.rows.length} rows to the database.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, confirmMessage]);
    } catch (error) {
      console.error('Error saving to database:', error);
      toast.error('Failed to save to database. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col" style={{ height: maxHeight }}>
      {/* Chat Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6 px-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type !== 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    AI
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

                {message.extractedData && (
                  <Card className="w-full mt-2">
                    <CardContent className="p-4">
                      <div className="overflow-auto max-h-[300px] border border-slate-200 dark:border-slate-700 rounded-lg mb-3">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                            <tr>
                              {message.extractedData.headers.map((header, idx) => (
                                <th
                                  key={idx}
                                  className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {message.extractedData.rows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                {row.map((cell, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className="px-3 py-2 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {message.extractedData.rows.length} rows × {message.extractedData.headers.length} columns
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleSaveToDatabase(message.extractedData!)}
                        >
                          <Database className="w-3 h-3 mr-1" />
                          Save to Database
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
                    U
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
              placeholder="Describe what data you want to extract..."
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
              onClick={() => setInput('Extract all names and email addresses into a table')}
              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Extract contacts
            </button>
            <button
              onClick={() => setInput('Create a table with all dates, amounts, and descriptions')}
              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Extract financial data
            </button>
            <button
              onClick={() => setInput('Extract student names, grades, and attendance percentage')}
              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Extract student data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
