import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Upload, Trash2, Plus, Calendar as CalendarIcon, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { toast } from "sonner";
import {
  CalendarHoliday,
  getHolidays,
  saveHolidays,
  parseCSV,
  parseICS,
} from "../../services/holidays/holidayService";
import { useLanguage } from "../../providers/LanguageContext";

export const SystemCalendarPage = () => {
  const { t, language } = useLanguage();
  const [holidays, setHolidays] = useState<CalendarHoliday[]>([]);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Manual Add Form states
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<CalendarHoliday["type"]>("Public Holiday");

  // Import Calendar File states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [parsedHolidays, setParsedHolidays] = useState<Omit<CalendarHoliday, "id">[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Load holidays on mount
  useEffect(() => {
    setHolidays(getHolidays());
  }, []);

  // Sync back to local storage on change
  const handleSaveHolidays = (updatedList: CalendarHoliday[]) => {
    setHolidays(updatedList);
    saveHolidays(updatedList);
  };

  // Date parsing helpers for UI display card
  const parseDateParts = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      if (isNaN(date.getTime())) {
        return { month: "???", day: "??" };
      }
      const locale = language === "pt" ? "pt-PT" : "en-US";
      return {
        month: date.toLocaleDateString(locale, { month: "short" }),
        day: date.toLocaleDateString(locale, { day: "numeric" }),
        year: date.getFullYear()
      };
    } catch {
      return { month: "???", day: "??" };
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Public Holiday":
        return "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30";
      case "Institutional":
        return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30";
      case "Break":
      default:
        return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30";
    }
  };

  const getHolidayTypeLabel = (type: string) => {
    if (type === "Public Holiday") return t("holidays.type_public") || "Public Holiday";
    if (type === "Institutional") return t("holidays.type_institutional") || "Institutional";
    if (type === "Break") return t("holidays.type_break") || "Academic Break";
    return type;
  };

  // Manual addition
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim()) {
      toast.error(t("holidays.toast_name_required") || "Please enter a holiday name.");
      return;
    }
    if (!newHolidayDate) {
      toast.error(t("holidays.toast_date_required") || "Please select a holiday date.");
      return;
    }

    // Check duplicate
    if (holidays.some((h) => h.date === newHolidayDate)) {
      toast.error(t("holidays.toast_duplicate").replace("{date}", newHolidayDate));
      return;
    }

    const newHoliday: CalendarHoliday = {
      id: `holiday-${Date.now()}`,
      name: newHolidayName.trim(),
      date: newHolidayDate,
      type: newHolidayType,
    };

    const updated = [...holidays, newHoliday].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    handleSaveHolidays(updated);
    toast.success(t("holidays.toast_add_success").replace("{name}", newHoliday.name));
    
    // Reset form & close
    setNewHolidayName("");
    setNewHolidayDate("");
    setNewHolidayType("Public Holiday");
    setIsAddOpen(false);
  };

  // Deletion
  const handleDeleteHoliday = (id: string, name: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    handleSaveHolidays(updated);
    toast.success(t("holidays.toast_delete_success").replace("{name}", name));
  };

  // File parsing logic
  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "ics") {
      setImportError(t("holidays.toast_invalid_file") || "Invalid file type. Please upload a .CSV or .ICS calendar file.");
      setImportedFile(null);
      setParsedHolidays([]);
      return;
    }

    setImportedFile(file);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let parsedList: Omit<CalendarHoliday, "id">[] = [];

      try {
        if (ext === "csv") {
          parsedList = parseCSV(text);
        } else if (ext === "ics") {
          parsedList = parseICS(text);
        }

        if (parsedList.length === 0) {
          setImportError(t("holidays.toast_no_valid_dates") || "No valid holiday dates could be parsed from this file. Check file formatting.");
        } else {
          setParsedHolidays(parsedList);
        }
      } catch (err) {
        setImportError(t("holidays.toast_parse_error") || "An error occurred while parsing the file structure.");
      }
    };
    reader.readAsText(file);
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Commit imported items
  const handleConfirmImport = () => {
    if (parsedHolidays.length === 0) return;

    let addedCount = 0;
    const currentHolidays = [...holidays];

    parsedHolidays.forEach((parsed) => {
      // Check if duplicate date
      if (!currentHolidays.some((h) => h.date === parsed.date)) {
        currentHolidays.push({
          id: `holiday-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: parsed.name,
          date: parsed.date,
          type: parsed.type,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      const sorted = currentHolidays.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      handleSaveHolidays(sorted);
      toast.success(t("holidays.toast_import_success").replace("{count}", String(addedCount)));
    } else {
      toast.info(t("holidays.toast_no_new") || "No new holidays were imported (all parsed items already exist).");
    }

    // Reset and Close
    setImportedFile(null);
    setParsedHolidays([]);
    setIsImportOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("holidays.title") || "Academic Calendar"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("holidays.subtitle") || "Configure institutional holidays and breaks."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium gap-1.5 shadow-sm dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-all"
          >
            <Plus className="w-4 h-4" /> {t("holidays.add_holiday") || "Add Holiday"}
          </Button>
        </div>
      </div>

      {/* Bulk Import Section Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white gap-6">
        <div>
          <h4 className="text-lg font-bold mb-1">
            {t("holidays.import_banner_title") || "Import Institutional Calendar"}
          </h4>
          <p className="text-blue-100 text-sm max-w-lg">
            {t("holidays.import_banner_desc") || "Bulk import holidays and blocked dates from your university's academic calendar file (.ICS or .CSV)."}
          </p>
        </div>
        <Button
          onClick={() => setIsImportOpen(true)}
          className="bg-white text-blue-700 hover:bg-blue-50 border-none shadow-md font-semibold shrink-0 transition-all hover:scale-[1.02]"
        >
          <Upload className="w-4 h-4 mr-2" /> {t("holidays.import_btn") || "Import File"}
        </Button>
      </div>

      {/* Main List */}
      <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
            {t("holidays.upcoming") || "Upcoming Holidays"}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {t("holidays.upcoming_desc") || "Dates automatically blocked for compensation."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {holidays.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold">{t("holidays.no_holidays") || "No holidays configured"}</p>
              <p className="text-xs text-slate-400 mt-1">{t("holidays.no_holidays_desc") || "Add holidays manually or upload a university calendar file."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {holidays.map((h) => {
                const { month, day, year } = parseDateParts(h.date);
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-center min-w-[60px] flex flex-col justify-center">
                        <span className="block text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                          {month}
                        </span>
                        <span className="block text-xl font-black text-slate-900 dark:text-slate-100 leading-none mt-0.5">
                          {day}
                        </span>
                        <span className="block text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">
                          {year}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {h.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn("text-[9px] font-semibold px-2 py-0.5", getBadgeColor(h.type))}>
                            {getHolidayTypeLabel(h.type)}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {h.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteHoliday(h.id, h.name)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Manual Add */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              {t("holidays.dialog_add_title") || "Add Custom Holiday"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
              {t("holidays.dialog_add_desc") || "Input institutional or public holidays to automatically block out calendar bookings."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHoliday} className="space-y-4 py-2">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="holiday-name" className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                {t("holidays.form_name") || "Holiday Name"}
              </Label>
              <Input
                id="holiday-name"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder={t("holidays.form_name_placeholder") || "e.g. Christmas Day, National Day"}
                className="bg-slate-50 border-slate-200 dark:bg-slate-955 dark:border-slate-800 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="holiday-date" className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  {t("holidays.form_date") || "Date"}
                </Label>
                <Input
                  id="holiday-date"
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="bg-slate-50 border-slate-200 dark:bg-slate-955 dark:border-slate-800 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <Label htmlFor="holiday-type" className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  {t("holidays.form_type") || "Type"}
                </Label>
                <Select
                  value={newHolidayType}
                  onValueChange={(val: any) => setNewHolidayType(val)}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200 dark:bg-slate-955 dark:border-slate-800 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectItem value="Public Holiday">{t("holidays.type_public") || "Public Holiday"}</SelectItem>
                    <SelectItem value="Institutional">{t("holidays.type_institutional") || "Institutional"}</SelectItem>
                    <SelectItem value="Break">{t("holidays.type_break") || "Academic Break"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="border-slate-200 dark:border-slate-800 font-medium rounded-lg text-sm"
              >
                {t("holidays.form_cancel") || "Cancel"}
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"
              >
                {t("holidays.add_holiday") || "Add Holiday"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Bulk Import File */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-none p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              {t("holidays.dialog_import_title") || "Import Academic Calendar"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
              {t("holidays.dialog_import_desc") || "Upload a `.ICS` (iCalendar) or `.CSV` file to bulk import institutional holidays."}
            </DialogDescription>
          </DialogHeader>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
              isDragging
                ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-955/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-955/30"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept=".ics,.csv"
              className="hidden"
            />
            {importedFile ? (
              <FileText className="w-10 h-10 text-indigo-500" />
            ) : (
              <Upload className="w-10 h-10 text-slate-400" />
            )}
            <div>
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                {importedFile ? importedFile.name : (t("holidays.drag_drop") || "Drag & Drop calendar file here")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {importedFile
                  ? `${(importedFile.size / 1024).toFixed(1)} KB`
                  : (t("holidays.browse") || "or click to browse from finder (.CSV or .ICS)")}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {importError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Parsed List Preview */}
          {parsedHolidays.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {t("holidays.parsed_count").replace("{count}", String(parsedHolidays.length))}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImportedFile(null);
                    setParsedHolidays([]);
                    setImportError(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/40 h-7"
                >
                  {t("holidays.clear_file") || "Clear File"}
                </Button>
              </div>
              <div className="max-h-[180px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-2 bg-slate-50/30 dark:bg-slate-955/20">
                {parsedHolidays.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100/80 dark:border-slate-800"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {h.name}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={cn("text-[9px] scale-90", getBadgeColor(h.type))}>
                        {getHolidayTypeLabel(h.type)}
                      </Badge>
                      <span className="text-slate-400 font-medium">{h.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setImportedFile(null);
                setParsedHolidays([]);
                setImportError(null);
                setIsImportOpen(false);
              }}
              className="border-slate-200 dark:border-slate-800 font-medium rounded-lg text-sm"
            >
              {t("holidays.form_cancel") || "Cancel"}
            </Button>
            <Button
              disabled={parsedHolidays.length === 0}
              onClick={handleConfirmImport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-md shadow-blue-500/10"
            >
              {t("holidays.import_btn") || "Import File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
