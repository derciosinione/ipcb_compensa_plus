import React, { useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  AlertCircle, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  File as FileIcon, 
  Upload, 
  X, 
  Download, 
  Trash2,
  Table as TableIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { toast } from 'sonner@2.0.3';
import { TimeSlot } from '../../../mocks/data';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';

interface BulkImportSchedulesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (schedules: Omit<TimeSlot, 'id'>[]) => void;
  courseName: string;
}

export const BulkImportSchedulesSheet = ({ 
  open, 
  onOpenChange, 
  onImport,
  courseName
}: BulkImportSchedulesSheetProps) => {
  const [previewData, setPreviewData] = useState<Omit<TimeSlot, 'id'>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPreviewData(null);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseExcelOrCSV = (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      return mapToTimeSlots(jsonData);
    } catch (e) {
      console.error("Excel parse error:", e);
      throw new Error("Failed to parse spreadsheet. Please check the format.");
    }
  };

  const parseJSON = (text: string) => {
    try {
      const jsonData = JSON.parse(text);
      if (!Array.isArray(jsonData)) throw new Error("JSON must be an array of objects");
      return mapToTimeSlots(jsonData);
    } catch (e) {
      console.error("JSON parse error:", e);
      throw new Error("Invalid JSON format.");
    }
  };

  const mapToTimeSlots = (data: any[]): Omit<TimeSlot, 'id'>[] => {
    return data.map((item, index) => {
      // Flexible mapping for CSV/Excel headers
      const dayRaw = item.dayOfWeek || item.Day || item.day || 1;
      const startRaw = item.startTime || item.Start || item.start || "09:00";
      const endRaw = item.endTime || item.End || item.end || "10:00";
      const unitRaw = item.unit || item.Unit || item.Subject || "Unknown Unit";
      const typeRaw = item.type || item.Type || "theoretical";
      const roomRaw = item.room || item.Room || "TBD";
      const yearGroupRaw = item.yearGroup || item.Year || "Year 1";
      const classGroupRaw = item.classGroup || item.Class || "A";

      // Convert Day String to Number if necessary
      let dayNum = Number(dayRaw);
      if (isNaN(dayNum)) {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayStr = String(dayRaw).toLowerCase().substring(0, 3);
        dayNum = days.indexOf(dayStr);
        if (dayNum === -1) dayNum = 1; // Default to Monday
      }

      return {
        dayOfWeek: dayNum,
        startTime: String(startRaw),
        endTime: String(endRaw),
        unit: String(unitRaw),
        type: String(typeRaw).toLowerCase() as 'theoretical' | 'practical',
        room: String(roomRaw),
        course: courseName,
        yearGroup: String(yearGroupRaw),
        classGroup: String(classGroupRaw)
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

    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const slots = parseExcelOrCSV(buffer);
          setPreviewData(slots);
          toast.success(`Successfully parsed ${slots.length} rows from ${file.name}`);
        } catch (err: any) {
          setError(err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.json') || file.name.endsWith('.txt')) {
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          // Try JSON first
          if (text.trim().startsWith('[')) {
             const slots = parseJSON(text);
             setPreviewData(slots);
             toast.success(`Successfully parsed JSON file`);
          } else {
             // Assume CSV-like text if not JSON? Or just error.
             // Let's try to parse as CSV using XLSX for text files too if they look like CSV
             // But for now, let's assume text files are JSON or fail.
             // Actually, users might upload a CSV as .txt.
             // Let's try XLSX read with 'string' type
             try {
                const workbook = XLSX.read(text, { type: 'string' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                const slots = mapToTimeSlots(jsonData);
                setPreviewData(slots);
                toast.success(`Successfully parsed text file as CSV`);
             } catch {
                throw new Error("Could not parse file as JSON or CSV.");
             }
          }
        } catch (err: any) {
          setError(err.message);
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
        // Mock PDF parsing
        setTimeout(() => {
            const mockData: Omit<TimeSlot, 'id'>[] = [
                { dayOfWeek: 1, startTime: "09:00", endTime: "11:00", unit: "Software Architecture", type: "theoretical", room: "C1.04", yearGroup: "Year 1", classGroup: "A", course: courseName },
                { dayOfWeek: 2, startTime: "14:00", endTime: "16:00", unit: "Web Development", type: "practical", room: "L.02", yearGroup: "Year 1", classGroup: "A", course: courseName },
                { dayOfWeek: 3, startTime: "10:00", endTime: "12:00", unit: "Database Systems", type: "theoretical", room: "C2.01", yearGroup: "Year 1", classGroup: "B", course: courseName },
            ];
            setPreviewData(mockData);
            toast.success("PDF parsed successfully (Simulated)");
            toast.info("Note: PDF parsing is simulated in this demo environment.");
        }, 1000);
    } else {
      setError("Unsupported file format. Please upload .csv, .xlsx, .json, or .pdf");
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
      { Day: "Mon", Start: "09:00", End: "11:00", Unit: "Unit Name", Type: "theoretical", Room: "C1.01", Year: "Year 1", Class: "A" },
      { Day: "Wed", Start: "14:00", End: "16:00", Unit: "Another Unit", Type: "practical", Room: "Lab 1", Year: "Year 1", Class: "PL1" }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "schedule_template.xlsx");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
    }}>
      <SheetContent className="sm:max-w-[800px] w-full flex flex-col h-full">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Bulk Import Schedules
          </SheetTitle>
          <SheetDescription>
            Upload a file (CSV, Excel, PDF, JSON) to import class schedules for <strong>{courseName}</strong>.
            Review the data in the table below before confirming.
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
                            {fileName ? fileName : "Drag & drop or click to upload"}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Supports .xlsx, .csv, .json, and .pdf files. 
                            Ensure your file follows the required format.
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
                            <Button className="w-full relative z-0">
                                Select File
                            </Button>
                         </div>
                         <Button variant="outline" onClick={downloadTemplate} className="w-full gap-2">
                             <Download className="w-4 h-4" /> Download Template
                         </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="max-w-md text-left">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Import Error</AlertTitle>
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
                                <p className="font-medium text-slate-900 dark:text-slate-100">{fileName}</p>
                                <p className="text-xs text-slate-500">{previewData.length} records found</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetState} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4 mr-2" /> Discard
                        </Button>
                    </div>

                    <div className="flex-1 border rounded-md overflow-hidden bg-white dark:bg-slate-950 shadow-sm relative">
                        <ScrollArea className="h-full w-full">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Day</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Room</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Class</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">
                                                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][item.dayOfWeek] || item.dayOfWeek}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {item.startTime} - {item.endTime}
                                            </TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                                    {item.room}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    item.type === 'theoretical' 
                                                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                                }>
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.classGroup}</TableCell>
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
            <Button variant="outline" className="w-full">Cancel</Button>
          </SheetClose>
          <Button 
            onClick={handleImport} 
            disabled={!previewData}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            <Check className="w-4 h-4 mr-2" /> Confirm Import
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
