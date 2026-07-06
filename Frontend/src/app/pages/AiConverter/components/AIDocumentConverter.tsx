import React, { useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { AIChatInterface } from "../../../layouts/AIChatInterface";
import { PageHeader } from "../../../components/common/PageHeader";
import { EmptyState } from "../../../components/common/EmptyState";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { IAService } from "../../../services/api/ia.service";
import { useLanguage } from "../../../providers/LanguageContext";

interface ExtractedData {
  headers: string[];
  rows: any[][];
  content?: string;
}

export function AIDocumentConverter() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"upload" | "chat">("upload");

  // Upload mode states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPrompt, setUploadPrompt] = useState("");
  const [uploadExtractedData, setUploadExtractedData] =
    useState<ExtractedData | null>(null);
  const [uploadProcessing, setUploadProcessing] = useState(false);

  // Upload Mode Handlers
  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadExtractedData(null);
    }
  };

  const handleUploadProcess = async () => {
    if (!uploadFile || !uploadPrompt.trim()) {
      toast.error(t("ai_converter.toast_fill_fields"));
      return;
    }

    setUploadProcessing(true);

    try {
      const uploadedFile = await IAService.uploadDocument(uploadFile);
      const aiResponse = await IAService.sendMessage({
        message: `${uploadPrompt}\n\nReturn the extracted result as concise structured data. If a table is appropriate, include it as JSON with "headers" and 'rows'.`,
        file_ids: [uploadedFile.file_id],
      });

      setUploadExtractedData(
        normalizeAiExtraction(
          aiResponse.content ?? JSON.stringify(aiResponse.data ?? {}),
        ),
      );
      toast.success(t("ai_converter.toast_success"));
    } catch (error) {
      console.error("Error processing document:", error);
      toast.error(t("ai_converter.toast_error"));
    } finally {
      setUploadProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 pb-4 border-b border-slate-200 dark:border-slate-800">
        <PageHeader
          icon={Sparkles}
          title={t("ai_converter.title")}
          description={t("ai_converter.desc")}
          action={
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "upload" | "chat")}
            >
              <TabsList>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {t("ai_converter.upload_mode")}
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t("ai_converter.chat_mode")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
      </div>

      {/* Content based on view mode */}
      {viewMode === "upload" ? renderUploadMode() : renderChatMode()}
    </div>
  );

  function renderUploadMode() {
    return (
      <div className="flex-1 overflow-auto py-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload & Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {t("ai_converter.upload_config")}
                </CardTitle>
                <CardDescription>
                  {t("ai_converter.upload_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("ai_converter.doc_file")}
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleUploadFileChange}
                      accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploadFile ? (
                        <>
                          <FileText className="w-12 h-12 text-green-500 mb-2" />
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {uploadFile.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {(uploadFile.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-slate-400 mb-2" />
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {t("ai_converter.click_upload")}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {t("ai_converter.upload_formats")}
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* AI Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("ai_converter.instructions")}
                  </label>
                  <Textarea
                    value={uploadPrompt}
                    onChange={(e) => setUploadPrompt(e.target.value)}
                    placeholder={t("ai_converter.instructions_placeholder")}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Process Button */}
                <Button
                  onClick={handleUploadProcess}
                  disabled={
                    !uploadFile || !uploadPrompt.trim() || uploadProcessing
                  }
                  className="w-full"
                >
                  {uploadProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("ai_converter.processing")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("ai_converter.process_btn")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview & Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t("ai_converter.preview_title")}
                </CardTitle>
                <CardDescription>
                  {t("ai_converter.preview_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!uploadExtractedData && !uploadProcessing && (
                  <EmptyState
                    icon={FileText}
                    title={t("ai_converter.empty_title")}
                    description={t("ai_converter.empty_desc")}
                    size="sm"
                    className="border-0"
                  />
                )}

                {uploadProcessing && (
                  <div className="py-12">
                    <LoadingSpinner
                      size="lg"
                      text={t("ai_converter.loading_text")}
                    />
                  </div>
                )}

                {uploadExtractedData && (
                  <div className="space-y-4">
                    {uploadExtractedData.rows.length > 0 ? (
                      <div className="overflow-auto max-h-[400px] border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                            <tr>
                              {uploadExtractedData.headers.map(
                                (header, idx) => (
                                  <th
                                    key={idx}
                                    className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
                                  >
                                    {header}
                                  </th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {uploadExtractedData.rows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                {row.map((cell, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {uploadExtractedData.content}
                      </pre>
                    )}

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {uploadExtractedData.rows.length > 0
                            ? t("ai_converter.rows_extracted").replace("{count}", uploadExtractedData.rows.length.toString())
                            : t("ai_converter.doc_processed")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ai_converter.how_it_works")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    1
                  </span>
                  <span>
                    {t("ai_converter.step_1")}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    2
                  </span>
                  <span>
                    {t("ai_converter.step_2")}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                  <span>
                    {t("ai_converter.step_3")}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    4
                  </span>
                  <span>
                    {t("ai_converter.step_4")}
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function renderChatMode() {
    return (
      <div className="flex-1 min-h-0 py-6">
        <AIChatInterface maxHeight="100%" />
      </div>
    );
  }
}

function normalizeAiExtraction(content: string): ExtractedData {
  const parsed = tryParseJson(content);

  if (parsed && Array.isArray(parsed.headers) && Array.isArray(parsed.rows)) {
    return {
      headers: parsed.headers.map(String),
      rows: parsed.rows.map((row: unknown) =>
        Array.isArray(row) ? row : [row],
      ),
      content,
    };
  }

  return {
    headers: [],
    rows: [],
    content,
  };
}

function tryParseJson(content: string): any | null {
  const trimmed = content.trim();
  const fencedJson = trimmed
    .match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
    ?.trim();
  const candidate = fencedJson ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}
