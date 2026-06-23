import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Loader2,
  Send,
  Paperclip,
  X,
  CalendarCheck,
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
  Mic,
  MicOff,
  BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import { ScrollArea } from "../components/ui/scroll-area";
import { IAService } from "../services/api/ia.service";
import { useMutation } from "@tanstack/react-query";
import { createCompensationRequest } from "../services/compensationRequests/compensationRequestsApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStoredAuthSession, getStoredActiveRole } from "../services/auth/authSession";
import { cn } from "../components/ui/utils";
import { useLanguage } from "../providers/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  file?: File;
  action?: string;
  actionData?: any;
  isProcessing?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: string;
}

interface AIChatInterfaceProps {
  compact?: boolean;
  maxHeight?: string;
  userRole?: string;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "1",
  type: "assistant",
  content:
    "Olá! Sou o Assistente IA do Compensa+. Como posso ajudar? Você pode fazer perguntas sobre o sistema ou anexar documentos para que eu analise e preencha formulários automaticamente.",
  timestamp: new Date(),
};

export function AIChatInterface({
  compact = false,
  maxHeight = "calc(100vh - 8rem)",
  userRole,
}: AIChatInterfaceProps) {
  const { t } = useLanguage();
  const welcomeMessage = React.useMemo<ChatMessage>(() => ({
    id: "1",
    type: "assistant",
    content: t("ai_chat.welcome"),
    timestamp: new Date(),
  }), [t]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem("compensa.ai.selected_model") || "auto";
  });

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    localStorage.setItem("compensa.ai.selected_model", val);
  };

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(t("ai_chat.voice_not_supported"));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = localStorage.getItem("compensa.language") === "en" ? "en-US" : "pt-PT";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        toast.error(t("ai_chat.voice_error"));
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const session = getStoredAuthSession();
  const userId = session?.user?.id ?? "global";
  const activeRole = userRole || getStoredActiveRole() || "teacher";
  const storageKey = `compensa.ai.conversations.${userId}.${activeRole}`;

  // Load conversations on mount or userId change
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Conversation[];
        const loaded = parsed.map(c => ({
          ...c,
          messages: c.messages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setConversations(loaded);
        
        if (loaded.length > 0) {
          setActiveId(loaded[0].id);
          setMessages(loaded[0].messages);
          if (loaded[0].id && !loaded[0].id.startsWith("local-")) {
            setThreadId(loaded[0].id);
          } else {
            setThreadId(undefined);
          }
        } else {
          const defaultId = "local-" + Date.now();
          setActiveId(defaultId);
          setMessages([welcomeMessage]);
          setThreadId(undefined);
        }
      } catch (e) {
        console.error("Failed to load conversations from local storage", e);
      }
    } else {
      const defaultId = "local-" + Date.now();
      setActiveId(defaultId);
      setMessages([welcomeMessage]);
      setThreadId(undefined);
    }
  }, [storageKey, welcomeMessage]);

  const updateActiveConversationMessages = (
    updater: (prevMessages: ChatMessage[]) => ChatMessage[],
    newThreadId?: string
  ) => {
    setMessages((prevMsgs) => {
      const nextMsgs = updater(prevMsgs);
      
      setConversations((prevConvs) => {
        let updatedConvs = [...prevConvs];
        const finalThreadId = newThreadId || threadId;
        const currentActiveId = activeId;
        
        const existingIdx = updatedConvs.findIndex((c) => c.id === currentActiveId);
        
        const firstUserMsg = nextMsgs.find(m => m.type === "user");
        let title = t("ai_chat.new_chat");
        if (firstUserMsg) {
          title = firstUserMsg.content.trim();
          if (title.length > 28) title = title.slice(0, 25) + "...";
        }

        const updatedConv: Conversation = {
          id: finalThreadId || currentActiveId,
          title,
          messages: nextMsgs,
          timestamp: new Date().toISOString(),
        };

        if (existingIdx > -1) {
          updatedConvs[existingIdx] = updatedConv;
        } else {
          updatedConvs.unshift(updatedConv);
        }

        updatedConvs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (finalThreadId && currentActiveId !== finalThreadId) {
          setActiveId(finalThreadId);
        }

        localStorage.setItem(storageKey, JSON.stringify(updatedConvs));
        return updatedConvs;
      });

      return nextMsgs;
    });
  };

  const handleNewChat = () => {
    const newId = "local-" + Date.now();
    setActiveId(newId);
    setThreadId(undefined);
    setMessages([welcomeMessage]);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveId(conv.id);
    setMessages(conv.messages);
    if (conv.id && !conv.id.startsWith("local-")) {
      setThreadId(conv.id);
    } else {
      setThreadId(undefined);
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Call backend to delete the thread (non-blocking)
    if (id && !id.startsWith("local-")) {
      IAService.deleteThread(id).catch((err) => {
        console.error("Error deleting backend thread:", err);
      });
    }
    
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(next));
      
      if (activeId === id) {
        if (next.length > 0) {
          setActiveId(next[0].id);
          setMessages(next[0].messages);
          if (next[0].id && !next[0].id.startsWith("local-")) {
            setThreadId(next[0].id);
          } else {
            setThreadId(undefined);
          }
        } else {
          const defaultId = "local-" + Date.now();
          setActiveId(defaultId);
          setMessages([welcomeMessage]);
          setThreadId(undefined);
        }
      }
      
      return next;
    });
    toast.success(t("ai_chat.delete_conv_toast"));
  };

  const createRequestMutation = useMutation({
    mutationFn: createCompensationRequest,
    onSuccess: () => {
      toast.success(t("ai_chat.toast_request_success"));
      updateActiveConversationMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "system",
          content: t("ai_chat.msg_request_success"),
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error) => {
      toast.error(t("ai_chat.toast_request_error"));
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      type: "user",
      content: input,
      timestamp: new Date(),
      file: file || undefined,
    };

    updateActiveConversationMessages((prev) => [...prev, userMessage]);
    setInput("");
    const currentFile = file;
    setFile(null);

    setIsProcessing(true);
    const processingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: t("ai_chat.processing"),
      timestamp: new Date(),
      isProcessing: true,
    };
    updateActiveConversationMessages((prev) => [...prev, processingMessage]);

    try {
      let fileIds: string[] = [];

      if (currentFile) {
        const uploadRes = await IAService.uploadDocument(currentFile);
        fileIds.push(uploadRes.file_id);
      }

      const response = await IAService.sendMessage({
        thread_id: threadId,
        message:
          input ||
          t("ai_chat.default_file_msg"),
        file_ids: fileIds.length > 0 ? fileIds : undefined,
        model: selectedModel,
      });

      const nextThreadId = response.thread_id;
      if (nextThreadId) {
        setThreadId(nextThreadId);
      }

      const resultMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content:
          response.content ||
          (response.action
            ? t("ai_chat.action_suggested")
            : ""),
        timestamp: new Date(),
        action: response.action,
        actionData: response.data,
      };

      updateActiveConversationMessages((prev) => 
        prev.filter((m) => m.id !== processingMessage.id).concat(resultMessage),
        nextThreadId
      );
    } catch (error) {
      console.error("Error with AI:", error);
      updateActiveConversationMessages((prev) => 
        prev.filter((m) => m.id !== processingMessage.id).concat({
          id: (Date.now() + 2).toString(),
          type: "assistant",
          content: t("ai_chat.comms_error"),
          timestamp: new Date(),
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = (action: string, data: any) => {
    if (action === "CreateCompensationRequest") {
      const payload = {
        unitId: data.unitId,
        courseId: data.courseId,
        originalDate: data.originalDate,
        proposedDate: data.proposedDate,
        reason: data.reason || t("ai_chat.suggested_by_ai"),
        classroom: "Sala Gerada (AI)",
        status: "Pending",
        type: "Anticipation",
      };

      createRequestMutation.mutate(payload as any);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="flex overflow-hidden w-full h-full gap-4"
      style={{ height: maxHeight }}
    >
      {/* Recent Conversations Sidebar */}
      {!compact && (
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 pr-4 flex flex-col h-full flex-shrink-0">
          <Button
            onClick={handleNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 mb-4 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t("ai_chat.new_chat")}
          </Button>

          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
            {t("ai_chat.recent_convs")}
          </div>

          <ScrollArea className="flex-1 pr-1">
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-xs text-slate-400 italic px-2 py-4 text-center">
                  {t("ai_chat.no_recent")}
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm",
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                        <span className="truncate pr-1">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                        title={t("ai_chat.delete_conv_title")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat Header with Model Selector */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              Compensa+ AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-850 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 px-1.5">
              {t("ai_chat.model_selector_label")}
            </span>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="h-7 w-[140px] text-xs border-none bg-transparent hover:bg-slate-200 dark:hover:bg-slate-850 shadow-none font-medium px-2 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 text-xs">
                <SelectItem value="auto" className="text-xs">{t("ai_chat.model_auto")}</SelectItem>
                <SelectItem value="gemini" className="text-xs">Gemini</SelectItem>
                <SelectItem value="openai" className="text-xs">OpenAI (GPT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 min-h-0 w-full">
          <div className="space-y-6 px-4 py-6">
            {messages.map((message) => {
              const displayContent = message.id === "1" ? t("ai_chat.welcome") : message.content;
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type !== "user" && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        {t("ai_chat.ai_fallback")}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`flex flex-col gap-2 max-w-[80%] ${message.type === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : message.type === "system"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {message.isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{displayContent}</span>
                        </div>
                      ) : (
                        <div className="text-sm markdown-content prose dark:prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:p-0 prose-compact">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayContent}
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

                    {message.action === "CreateCompensationRequest" &&
                      message.actionData && (
                        <Card className="w-full mt-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                          <CardHeader className="py-3 px-4 border-b border-blue-100 dark:border-blue-900">
                            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <CalendarCheck className="w-4 h-4" /> {t("ai_chat.draft_title")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 space-y-2">
                            <div className="text-sm grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                              <span className="font-medium">
                                {t("ai_chat.draft_uc")}
                              </span>
                              <span>{message.actionData.unitId}</span>
                              <span className="font-medium">{t("ai_chat.draft_orig_date")}</span>
                              <span>{message.actionData.originalDate}</span>
                              <span className="font-medium">{t("ai_chat.draft_prop_date")}</span>
                              <span>{message.actionData.proposedDate}</span>
                              <span className="font-medium">{t("ai_chat.draft_reason")}</span>
                              <span>{message.actionData.reason}</span>
                            </div>
                            <div className="pt-3">
                              <Button
                                className="w-full"
                                size="sm"
                                disabled={createRequestMutation.isPending}
                                onClick={() =>
                                  handleAction(
                                    message.action as string,
                                    message.actionData,
                                  )
                                }
                              >
                                {createRequestMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                {t("ai_chat.draft_submit")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                    {message.action === "RenderChart" &&
                      message.actionData && (
                        <Card className="w-full mt-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md max-w-lg overflow-hidden">
                          <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <BarChart2 className="w-4 h-4 text-blue-500" /> {message.actionData.title || "Estatísticas"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-5">
                            <div className="h-60 w-full flex items-center justify-center text-xs">
                              {message.actionData.chartType === "bar" && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={message.actionData.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }} />
                                    <RechartsLegend iconType="circle" />
                                    {Object.keys(message.actionData.data[0] || {})
                                      .filter((k) => k !== "name" && k !== "value")
                                      .map((key, idx) => {
                                        const colors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308"];
                                        return <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />;
                                      })}
                                    {(!Object.keys(message.actionData.data[0] || {}).some((k) => k !== "name" && k !== "value")) && (
                                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    )}
                                  </BarChart>
                                </ResponsiveContainer>
                              )}

                              {message.actionData.chartType === "line" && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={message.actionData.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }} />
                                    <RechartsLegend iconType="circle" />
                                    {Object.keys(message.actionData.data[0] || {})
                                      .filter((k) => k !== "name" && k !== "value")
                                      .map((key, idx) => {
                                        const colors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308"];
                                        return <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
                                      })}
                                    {(!Object.keys(message.actionData.data[0] || {}).some((k) => k !== "name" && k !== "value")) && (
                                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    )}
                                  </LineChart>
                                </ResponsiveContainer>
                              )}

                              {message.actionData.chartType === "pie" && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={message.actionData.data}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={85}
                                      paddingAngle={3}
                                      dataKey={message.actionData.data[0]?.value !== undefined ? "value" : Object.keys(message.actionData.data[0] || {}).find(k => k !== "name") || "value"}
                                    >
                                      {message.actionData.data.map((entry: any, index: number) => {
                                        const colors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6", "#ec4899"];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                      })}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }} />
                                    <RechartsLegend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" />
                                  </PieChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                    <span className="text-xs text-slate-400 px-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {message.type === "user" && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {t("ai_chat.user_fallback")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
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

            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={cn(
                "flex-shrink-0 transition-all duration-300",
                isRecording && "bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              )}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("ai_chat.input_placeholder")}
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
                onClick={() =>
                  setInput(t("ai_chat.suggest_schedule_input"))
                }
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t("ai_chat.suggest_schedule")}
              </button>
              <button
                onClick={() =>
                  setInput(t("ai_chat.suggest_rules_input"))
                }
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t("ai_chat.suggest_rules")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
