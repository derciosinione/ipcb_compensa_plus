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

interface ExtractedData {
  headers: string[];
  rows: any[][];
  content?: string;
}

export function AIDocumentConverter() {
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
      toast.error("Please upload a file and provide instructions");
      return;
    }

    setUploadProcessing(true);

    try {
      const uploadedFile = await IAService.uploadDocument(uploadFile);
      const aiResponse = await IAService.sendMessage({
        message: `${uploadPrompt}\n\nReturn the extracted result as concise structured data. If a table is appropriate, include it as JSON with"headers" and'rows'.`,
        file_ids: [uploadedFile.file_id],
      });

      setUploadExtractedData(
        normalizeAiExtraction(
          aiResponse.content ?? JSON.stringify(aiResponse.data ?? {}),
        ),
      );
      toast.success("Document processed successfully!");
    } catch (error) {
      console.error("Error processing document:", error);
      toast.error("Failed to process document. Please try again.");
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
          title="AI Document Converter"
          description="Upload documents and extract structured data"
          action={
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "upload" | "chat")}
            >
              <TabsList>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Mode
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat Mode
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
                  Upload & Configure
                </CardTitle>
                <CardDescription>
                  Upload your document and describe what data to extract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Document File
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
                            Click to upload document
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            PDF, DOC, TXT, CSV, XLSX up to 10MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* AI Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    AI Instructions
                  </label>
                  <Textarea
                    value={uploadPrompt}
                    onChange={(e) => setUploadPrompt(e.target.value)}
                    placeholder="Example: Extract all student names, grades, and attendance from this report and format as a table with columns: Name, Grade, Attendance %"
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
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Process Document
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
                  Extracted Data Preview
                </CardTitle>
                <CardDescription>
                  Review the extracted data returned by CompensaAI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!uploadExtractedData && !uploadProcessing && (
                  <EmptyState
                    icon={FileText}
                    title="No data extracted yet"
                    description="Upload a document and process it to see results"
                    size="sm"
                    className="border-0"
                  />
                )}

                {uploadProcessing && (
                  <div className="py-12">
                    <LoadingSpinner
                      size="lg"
                      text="AI is analyzing your document..."
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
                            ? `${uploadExtractedData.rows.length} rows extracted`
                            : "Document processed"}
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
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    1
                  </span>
                  <span>
                    Upload a document containing the data you want to extract
                    (PDF, Word, Excel, etc.)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    2
                  </span>
                  <span>
                    Provide clear instructions describing what data to extract
                    and how to structure it
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                  <span>
                    AI will analyze the document and extract structured data
                    into a table format
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                    4
                  </span>
                  <span>
                    Review the extracted result returned by CompensaAI
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
