import React, { useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  AlertCircle,
  Check,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { toast } from "sonner";
import type { ImportedUser, UserRole } from "../../../types/user";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useLanguage } from "../../../providers/LanguageContext";

interface BulkImportUsersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (users: ImportedUser[]) => void;
}

export const BulkImportUsersSheet = ({
  open,
  onOpenChange,
  onImport,
}: BulkImportUsersSheetProps) => {
  const { t } = useLanguage();
  const [previewData, setPreviewData] = useState<ImportedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPreviewData(null);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parseExcelOrCSV = (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      return mapToUsers(jsonData);
    } catch (e) {
      console.error("Excel parse error:", e);
      throw new Error(t("bulk_import.parse_error_sheet"));
    }
  };

  const parseJSON = (text: string) => {
    try {
      const jsonData = JSON.parse(text);
      if (!Array.isArray(jsonData))
        throw new Error(t("bulk_import.parse_error_json"));
      return mapToUsers(jsonData);
    } catch (e) {
      console.error("JSON parse error:", e);
      throw new Error(t("bulk_import.parse_error_json"));
    }
  };

  const mapToUsers = (data: any[]): ImportedUser[] => {
    return data.map((item, index) => {
      // Flexible mapping for CSV/Excel headers
      const nameRaw = item.name || item.Name || item.Nome || "Unknown Name";
      const emailRaw = item.email || item.Email || "no-email@domain.com";
      const roleRaw = item.role || item.Role || item.Funcao || "teacher";
      const avatarRaw = item.avatarUrl || item.Avatar || item.Image;

      // Normalize Role
      let role: UserRole = "teacher";
      const roleStr = String(roleRaw).toLowerCase();
      if (roleStr.includes("coord")) role = "coordinator";
      else if (roleStr.includes("admin")) role = "admin";
      else role = "teacher";

      return {
        name: String(nameRaw),
        email: String(emailRaw),
        role: role,
        avatarUrl: avatarRaw ? String(avatarRaw) : undefined,
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setPreviewData(null);

    const reader = new FileReader();

    if (
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")
    ) {
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const users = parseExcelOrCSV(buffer);
          setPreviewData(users);
          toast.success(
            t("bulk_import.toast_parsed_rows")
              .replace("{count}", String(users.length))
              .replace("{name}", file.name),
          );
        } catch (err: any) {
          setError(err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith(".json") || file.name.endsWith(".txt")) {
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          if (text.trim().startsWith("[")) {
            const users = parseJSON(text);
            setPreviewData(users);
            toast.success(t("bulk_import.toast_parsed_json"));
          } else {
            try {
              const workbook = XLSX.read(text, { type: "string" });
              const sheet = workbook.Sheets[workbook.SheetNames[0]];
              const jsonData = XLSX.utils.sheet_to_json(sheet);
              const users = mapToUsers(jsonData);
              setPreviewData(users);
              toast.success(t("bulk_import.toast_parsed_text"));
            } catch {
              throw new Error(t("bulk_import.parse_error_fallback"));
            }
          }
        } catch (err: any) {
          setError(err.message);
        }
      };
      reader.readAsText(file);
    } else {
      setError(t("bulk_import.parse_error_unsupported"));
    }
  };

  const handleImport = () => {
    if (previewData) {
      onImport(previewData);
      onOpenChange(false);
      resetState();
    }
  };

  const downloadTemplate = () => {
    const template = [
      { Name: "John Doe", Email: "john@uni.edu", Role: "teacher" },
      { Name: "Jane Smith", Email: "jane@uni.edu", Role: "coordinator" },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "users_template.xlsx");
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <SheetContent className="sm:max-w-[800px] w-full flex flex-col h-full">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            {t("bulk_import.title_users")}
          </SheetTitle>
          <SheetDescription>
            {t("bulk_import.desc_users")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Upload Area */}
          {!previewData ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-6 p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {fileName ? fileName : t("bulk_import.drag_drop")}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  {t("bulk_import.supports_schedules")}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.json,.txt,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Button className="w-full relative z-0">{t("bulk_import.select_file")}</Button>
                </div>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" /> {t("bulk_import.download_template")}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="max-w-md text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("bulk_import.error_title")}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {fileName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("bulk_import.records_found").replace("{count}", String(previewData.length))}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {t("bulk_import.discard")}
                </Button>
              </div>

              <div className="flex-1 border rounded-md overflow-hidden bg-white dark:bg-slate-950 shadow-sm relative">
                <ScrollArea className="h-full w-full">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                      <TableRow>
                        <TableHead>{t("users.name")}</TableHead>
                        <TableHead>{t("users.email")}</TableHead>
                        <TableHead>{t("users.role")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((user, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "flex w-fit items-center gap-1 border capitalize",
                                user.role === "teacher"
                                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30"
                                  : user.role === "coordinator"
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30"
                                    : "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-900/30",
                              )}
                            >
                              {user.role === "teacher" && (
                                <GraduationCap className="w-3 h-3" />
                              )}
                              {user.role === "coordinator" && (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              {user.role === "admin" && (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              {t(`role.${user.role.toLowerCase()}`)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-col sm:space-x-0">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              {t("common.cancel")}
            </Button>
          </SheetClose>
          <Button
            onClick={handleImport}
            disabled={!previewData}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            <Check className="w-4 h-4 mr-2" /> {t("bulk_import.confirm_import")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
