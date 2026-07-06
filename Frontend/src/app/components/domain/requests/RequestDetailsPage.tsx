import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Calendar,
  Clock,
  MapPin,
  Send,
  MessageSquare,
  User,
  Users,
  BookOpen,
  ArrowLeft,
  MoreHorizontal,
  AlertTriangle,
  Check,
  X as XIcon,
  Info,
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  Loader2,
  Copy,
} from "lucide-react";
import type { ClassRequest, RequestDocument } from "../../../types/requests";
import type { UserRole } from "../../../types/user";
import { cn } from "../../ui/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { RejectionDialog } from "./RejectionDialog";
import { useLanguage } from "../../../providers/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import { getStoredAccessToken } from "../../../services/auth/authSession";
import { coreApiBaseUrl } from "../../../services/api/httpClient";
import { toast } from "sonner";

interface RequestDetailsPageProps {
  request: ClassRequest;
  onBack: () => void;
  onAddComment: (requestId: string, text: string) => void;
  onStatusChange?: (
    requestId: string,
    status: "approved" | "rejected",
    reason?: string,
  ) => void;
  onUploadDocument?: (requestId: string, file: File) => Promise<void>;
  onDeleteDocument?: (requestId: string, documentId: string) => Promise<void>;
  onDownloadDocument?: (requestId: string, documentId: string) => void;
  onDuplicate?: (req: ClassRequest) => void;
  userRole?: UserRole;
}

export const RequestDetailsPage = ({
  request,
  onBack,
  onAddComment,
  onStatusChange,
  onUploadDocument,
  onDeleteDocument,
  onDownloadDocument,
  onDuplicate,
  userRole = "teacher",
}: RequestDetailsPageProps) => {
  const [newComment, setNewComment] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  // Upload confirmation states
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [isUploadConfirmOpen, setIsUploadConfirmOpen] = useState(false);
  const [pendingUploadPreview, setPendingUploadPreview] = useState<string | null>(null);

  // Preview document states
  const [previewDocument, setPreviewDocument] = useState<RequestDocument | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewTextContent, setPreviewTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingUploadFile) {
      setPendingUploadPreview(null);
      return;
    }

    if (pendingUploadFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(pendingUploadFile);
      setPendingUploadPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPendingUploadPreview(null);
    }
  }, [pendingUploadFile]);

  const fetchDocumentBlob = async (docId: string): Promise<Blob> => {
    const token = getStoredAccessToken();
    const response = await fetch(
      `${coreApiBaseUrl}/api/compensation-requests/${request.id}/documents/${docId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return response.blob();
  };

  const handleOpenPreview = async (doc: RequestDocument) => {
    setPreviewDocument(doc);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewTextContent(null);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    try {
      const blob = await fetchDocumentBlob(doc.id);
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);

      if (doc.fileName.toLowerCase().endsWith(".txt") || blob.type.startsWith("text/")) {
        const text = await blob.text();
        setPreviewTextContent(text);
      }
    } catch (err: any) {
      console.error(err);
      setPreviewError(err.message || "Failed to load document preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewDocument(null);
    setPreviewBlobUrl(null);
    setPreviewTextContent(null);
    setPreviewError(null);
  };

  const handleDownload = async (doc: RequestDocument) => {
    try {
      let url = previewBlobUrl;
      let shouldRevoke = false;
      if (!url || previewDocument?.id !== doc.id) {
        const blob = await fetchDocumentBlob(doc.id);
        url = URL.createObjectURL(blob);
        shouldRevoke = true;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (shouldRevoke && url) {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("requests.toast_download_doc_error"));
    }
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(request.id, newComment);
    setNewComment("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingUploadFile(file);
    setIsUploadConfirmOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!pendingUploadFile || !onUploadDocument) return;
    setIsUploadConfirmOpen(false);
    setIsUploading(true);
    try {
      await onUploadDocument(request.id, pendingUploadFile);
      toast.success(t("requests.toast_upload_doc_success"));
    } catch (error) {
      toast.error(t("requests.toast_upload_doc_error"));
    } finally {
      setIsUploading(false);
      setPendingUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancelUpload = () => {
    setIsUploadConfirmOpen(false);
    setPendingUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-green-700 bg-green-50 border-green-200";
      case "rejected":
        return "bg-red-500 text-red-700 bg-red-50 border-red-200";
      case "cancelled":
        return "bg-slate-500 text-slate-700 bg-slate-50 border-slate-200";
      default:
        return "bg-amber-500 text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return t("requests.approved");
      case "rejected":
        return t("requests.rejected");
      case "cancelled":
        return t("requests.cancelled");
      default:
        return t("requests.pending");
    }
  };

  const getComponentBadge = (type: string) => {
    switch (type) {
      case "theoretical":
        return (
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 border-purple-200"
          >
            Theoretical
          </Badge>
        );
      case "practical":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 border-blue-200"
          >
            Practical
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500">
            Standard
          </Badge>
        );
    }
  };

  const isNearDate = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isNear = request.status === "pending" && isNearDate(request.newDate);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("details.back_to_requests")}
        </Button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 font-mono">
            ID: {request.id.toUpperCase()}
          </span>
          <Badge
            variant="outline"
            className={cn("capitalize border", getStatusColor(request.status))}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full mr-2",
                request.status === "approved"
                  ? "bg-green-500"
                  : request.status === "pending"
                    ? "bg-amber-500"
                    : request.status === "cancelled"
                      ? "bg-slate-400"
                      : "bg-red-500",
              )}
            />
            {getStatusLabel(request.status)}
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {userRole === "coordinator" && request.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                <XIcon className="w-4 h-4 mr-2" /> {t("details.reject")}
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onStatusChange?.(request.id, "approved")}
              >
                <Check className="w-4 h-4 mr-2" /> {t("details.approve")}
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {onDuplicate && (
                <DropdownMenuItem
                  onClick={() => onDuplicate(request)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Copy className="w-4 h-4 text-purple-500" />
                  <span>{t("requests.duplicate_request")}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>{t("details.download_pdf")}</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                {t("details.report_issue")}
              </DropdownMenuItem>
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
                <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {t("details.date_approaching")}
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                  {t("details.date_approaching_desc").replace(
                    "{date}",
                    request.newDate,
                  )}
                </p>
              </div>
            </div>
          )}

          {request.status === "rejected" && request.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <Info className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
                  {t("details.rejection_reason")}
                </h4>
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {request.unit}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {request.course}
                  </Badge>
                  {getComponentBadge(request.componentType)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {t("details.submitted_by")}
                </span>
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {request.teacherName}
                  </span>
                  <Avatar className="h-8 w-8 border border-slate-100">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {request.teacherName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  on {request.submittedAt}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              {/* Original */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  {t("details.original_schedule")}
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
                  {t("details.proposed_schedule")}
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
                  <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
                    {t("details.room_conflict")}
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {t("details.room_conflict_desc").replace(
                      "{room}",
                      request.newRoom,
                    )}
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
                  <Users className="w-4 h-4" /> {t("details.targeted_groups")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {request.yearGroups.map((group, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="px-3 py-1 text-sm font-normal"
                    >
                      {group}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> {t("details.justification")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{request.reason}"
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> {t("details.documents")}
              </CardTitle>
              {(userRole === "teacher" || userRole === "coordinator") && request.status === "pending" && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-2 bg-white dark:bg-slate-900"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? t("documents.uploading") : t("documents.upload")}
                  </Button>
                </>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {request.documents && request.documents.length > 0 ? (
                <div className="space-y-2">
                  {request.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
                      onClick={() => handleOpenPreview(doc)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1">
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatFileSize(doc.sizeInBytes)} • {doc.createdAt.split("T")[0]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600"
                          onClick={() => handleOpenPreview(doc)}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600"
                          onClick={() => handleDownload(doc)}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {(userRole === "teacher" || userRole === "coordinator") && request.status === "pending" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => onDeleteDocument?.(request.id, doc.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                  <FileText className="w-8 h-8 mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                  <p className="text-xs text-slate-400">{t("documents.no_documents")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chat */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[600px] lg:h-[600px] overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> {t("details.discussion")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("details.chat_desc").replace(
                "{role}",
                userRole === "teacher"
                  ? t("role.coordinator")
                  : t("role.teacher"),
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {request.comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                <p>{t("details.no_comments")}</p>
              </div>
            ) : (
              request.comments.map((comment) => {
                const isMe =
                  (userRole === "teacher" && comment.role === "teacher") ||
                  (userRole === "coordinator" &&
                    comment.role === "coordinator");
                return (
                  <div
                    key={comment.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      isMe ? "ml-auto flex-row-reverse" : "mr-auto",
                    )}
                  >
                    <Avatar className="w-8 h-8 border border-white shadow-sm mt-1">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          comment.role === "teacher"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700",
                        )}
                      >
                        {comment.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={cn(
                          "p-3 rounded-2xl text-sm shadow-sm",
                          isMe
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none",
                        )}
                      >
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
                placeholder={t("details.type_message")}
                className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              />
              <Button
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmitComment}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RejectionDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={(reason) => onStatusChange?.(request.id, "rejected", reason)}
      />

      {/* Upload Confirmation Dialog */}
      <Dialog open={isUploadConfirmOpen} onOpenChange={(open) => !open && handleCancelUpload()}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              {t("documents.confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {t("documents.confirm_desc")}
            </DialogDescription>
          </DialogHeader>

          {pendingUploadFile && (
            <div className="my-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 border border-blue-100 dark:border-blue-900/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {pendingUploadFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatFileSize(pendingUploadFile.size)} • {pendingUploadFile.type || "Unknown type"}
                  </p>
                </div>
              </div>

              {/* Show image preview if applicable */}
              {pendingUploadPreview && (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[200px] flex justify-center items-center bg-white dark:bg-slate-900">
                  <img
                    src={pendingUploadPreview}
                    alt="Upload Preview"
                    className="max-h-[200px] max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-row gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 text-sm"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleConfirmUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 px-6 font-medium text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {t("documents.confirm_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && handleClosePreview()}>
        <DialogContent className="max-w-3xl w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  {previewDocument?.fileName}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-1">
                  {previewDocument && `${formatFileSize(previewDocument.sizeInBytes)} • Uploaded on ${previewDocument.createdAt.split("T")[0]}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto my-6 min-h-0 flex flex-col justify-center">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("documents.preview_loading")}</p>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{t("documents.preview_failed")}</p>
                <p className="text-xs text-slate-500 max-w-md">{previewError}</p>
              </div>
            ) : previewDocument && previewBlobUrl ? (
              <div className="w-full h-full flex flex-col justify-center min-h-[300px]">
                {/* Images */}
                {previewDocument.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                  <div className="flex justify-center items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 max-h-[450px] overflow-auto shadow-inner">
                    <img
                      src={previewBlobUrl}
                      alt={previewDocument.fileName}
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md"
                    />
                  </div>
                ) : /* PDFs */
                previewDocument.fileName.toLowerCase().endsWith(".pdf") ? (
                  <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100">
                    <iframe
                      src={`${previewBlobUrl}#toolbar=0`}
                      className="w-full h-full border-0"
                      title={previewDocument.fileName}
                    />
                  </div>
                ) : /* Text Files */
                previewDocument.fileName.toLowerCase().match(/\.(txt|json|csv|log|xml)$/) && previewTextContent !== null ? (
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-5 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[450px] overflow-auto font-mono text-xs text-slate-800 dark:text-slate-350 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {previewTextContent}
                  </div>
                ) : (
                  /* Unknown / Office files (doc, docx, xls, xlsx) */
                  <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center p-6">
                    <FileText className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {t("documents.preview_not_available")}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {t("documents.preview_not_available_desc")}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <DialogFooter className="flex flex-row gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <Button
              variant="outline"
              onClick={handleClosePreview}
              className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 text-sm"
            >
              {t("common.close")}
            </Button>
            {previewDocument && (
              <Button
                onClick={() => handleDownload(previewDocument)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 px-6 font-medium text-sm flex items-center gap-2"
                disabled={previewLoading}
              >
                <Download className="w-4 h-4" />
                {t("documents.download_btn")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
