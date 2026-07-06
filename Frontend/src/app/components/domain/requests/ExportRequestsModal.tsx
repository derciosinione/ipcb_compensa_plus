import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Download, Calendar as CalendarIcon, FileSpreadsheet, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useLanguage } from "../../../providers/LanguageContext";
import { useAcademicYear } from "../../../providers/AcademicYearContext";
import { listCourses, getCourseDetails } from "../../../services/courses/coursesApi";
import { listUserUnitAssignments } from "../../../services/assignments/assignmentsApi";
import { listCompensationRequests } from "../../../services/compensationRequests/compensationRequestsApi";
import type { AuthenticatedUser } from "../../../types/user";
import type { Course, CurricularUnit } from "../../../services/courses/courseTypes";
import type { CompensationRequest } from "../../../services/compensationRequests/compensationRequestTypes";
import { getErrorMessage } from "../../../utils/errors";

interface ExportRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthenticatedUser;
}

export const ExportRequestsModal: React.FC<ExportRequestsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { t } = useLanguage();
  const { selectedYear } = useAcademicYear();

  // Export Settings State
  const [format, setFormat] = useState<"excel" | "pdf">("excel");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Options Loaded State
  const [courses, setCourses] = useState<Course[]>([]);
  const [curricularUnits, setCurricularUnits] = useState<CurricularUnit[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isAdmin = user.role === "admin";
  const isCoordinator = user.role === "coordinator";
  const isTeacher = user.role === "teacher";

  // Load Course and UC options based on user role and permissions
  useEffect(() => {
    if (!isOpen || !selectedYear) return;

    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const [allCourses, assignments] = await Promise.all([
          listCourses(undefined, selectedYear.id),
          !isAdmin ? listUserUnitAssignments(user.id) : Promise.resolve({ courses: [], units: [] }),
        ]);

        let filteredCourses: Course[] = [];
        let filteredUnits: CurricularUnit[] = [];

        if (isAdmin) {
          filteredCourses = allCourses;
          // Load all details to get all units (similar to UsersPage)
          const details = await Promise.all(
            allCourses.map((c) => getCourseDetails(c.id, selectedYear.id))
          );
          filteredUnits = details.flatMap((d) => d?.units ?? []);
        } else if (isCoordinator) {
          // Coordinated courses
          filteredCourses = allCourses.filter(
            (c) =>
              c.coordinatorUserId === user.id ||
              assignments.courses.some((ac) => ac.courseId === c.id && ac.isCoordinator)
          );

          // Get UCs for coordinated courses
          const details = await Promise.all(
            filteredCourses.map((c) => getCourseDetails(c.id, selectedYear.id))
          );
          filteredUnits = details.flatMap((d) => d?.units ?? []);
        } else if (isTeacher) {
          // Teacher only coordinates UCs, but they might belong to different courses
          const teacherUnitIds = assignments.units.map((u) => u.curricularUnitId);
          const courseIds = Array.from(new Set(assignments.units.map((u) => u.courseId)));

          filteredCourses = allCourses.filter((c) => courseIds.includes(c.id));

          const details = await Promise.all(
            filteredCourses.map((c) => getCourseDetails(c.id, selectedYear.id))
          );
          const allTeacherUnits = details.flatMap((d) => d?.units ?? []);
          filteredUnits = allTeacherUnits.filter((u) => teacherUnitIds.includes(u.id));
        }

        setCourses(filteredCourses);
        setCurricularUnits(filteredUnits);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load options for report filters."));
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadOptions();
  }, [isOpen, selectedYear, user.id, isAdmin, isCoordinator, isTeacher]);

  // Handle Dynamic Sub-filtering of Curricular Units when Course changes
  const displayUnits = curricularUnits.filter(
    (u) => selectedCourseId === "all" || u.courseId === selectedCourseId
  );

  const handleExport = async () => {
    if (!selectedYear) return;
    try {
      setIsExporting(true);

      // Fetch requests scope
      // Teacher role fetches only requests authored by user.id
      // Coordinator / Admin fetches all scope requests
      const teacherParam = isTeacher ? user.id : undefined;
      const rawRequests = await listCompensationRequests(undefined, teacherParam, selectedYear.id);

      // Apply Filters in memory
      let filtered = [...rawRequests];

      // Role Check Safeguards for Coordinators in memory (backend already does it, but double check)
      if (isCoordinator && !isAdmin) {
        const coordinatedIds = courses.map((c) => c.id);
        filtered = filtered.filter(
          (r) => (r.courseId && coordinatedIds.includes(r.courseId)) || r.teacherUserId === user.id
        );
      }

      // Filter by Status
      if (statusFilter !== "all") {
        filtered = filtered.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase());
      }

      // Filter by Course
      if (selectedCourseId !== "all" && !isTeacher) {
        filtered = filtered.filter((r) => r.courseId === selectedCourseId);
      }

      // Filter by Curricular Unit
      if (selectedUnitId !== "all") {
        filtered = filtered.filter((r) => r.curricularUnitId === selectedUnitId);
      }

      // Filter by Date Range
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter((r) => new Date(r.newDate) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter((r) => new Date(r.newDate) <= end);
      }

      if (filtered.length === 0) {
        toast.info("No requests match the selected filters.");
        return;
      }

      const filename = `Compensation_Requests_${selectedYear.name.replace("/", "-")}_Report`;

      if (format === "excel") {
        generateExcel(filtered, filename);
      } else {
        generatePDF(filtered);
      }

      toast.success("Report generated successfully!");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to export report."));
    } finally {
      setIsExporting(false);
    }
  };

  const generateExcel = (requests: CompensationRequest[], filename: string) => {
    const data = requests.map((req) => ({
      "Academic Year": selectedYear?.name ?? "",
      "Semester": req.semester,
      "Course": req.course,
      "Curricular Unit": req.curricularUnit,
      "Year Groups": req.yearGroups.join(", "),
      "Component": req.componentType,
      "Teacher": req.teacherName,
      "Original Date": req.originalDate,
      "Original Time": `${req.originalStartTime.slice(0, 5)} - ${req.originalEndTime.slice(0, 5)}`,
      "Original Room": req.originalRoom,
      "New Date": req.newDate,
      "New Time": `${req.newStartTime.slice(0, 5)} - ${req.newEndTime.slice(0, 5)}`,
      "New Room": req.newRoom,
      "Justification": req.justification,
      "Status": req.status,
      "Conflict": req.hasConflict ? "Yes" : "No",
      "Submitted At": req.submittedAt.split("T")[0],
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests Report");

    // Auto-fit columns
    const maxLens = data.reduce((acc, row) => {
      Object.keys(row).forEach((key) => {
        const val = String((row as any)[key] ?? "");
        acc[key] = Math.max(acc[key] ?? key.length, val.length);
      });
      return acc;
    }, {} as Record<string, number>);
    ws["!cols"] = Object.keys(maxLens).map((k) => ({ wch: maxLens[k] + 3 }));

    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const generatePDF = (requests: CompensationRequest[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export PDF.");
      return;
    }

    const total = requests.length;
    const pending = requests.filter((r) => r.status.toLowerCase() === "pending").length;
    const approved = requests.filter((r) => r.status.toLowerCase() === "approved").length;
    const rejected = requests.filter((r) => r.status.toLowerCase() === "rejected").length;
    const cancelled = requests.filter((r) => r.status.toLowerCase() === "cancelled").length;

    // Filters text block
    const activeCourseName = selectedCourseId === "all" ? "All Courses" : courses.find(c => c.id === selectedCourseId)?.name ?? "Selected Course";
    const activeUCName = selectedUnitId === "all" ? "All Curricular Units" : curricularUnits.find(u => u.id === selectedUnitId)?.name ?? "Selected UC";
    const dateRangeStr = startDate || endDate ? `${startDate || "..."} to ${endDate || "..."}` : "All time";

    const filtersHtml = `
      <div class="filter-item"><strong>Role context:</strong> ${user.role.toUpperCase()}</div>
      <div class="filter-item"><strong>Status:</strong> ${statusFilter.toUpperCase()}</div>
      <div class="filter-item"><strong>Course Filter:</strong> ${activeCourseName}</div>
      <div class="filter-item"><strong>UC Filter:</strong> ${activeUCName}</div>
      <div class="filter-item"><strong>Date Range:</strong> ${dateRangeStr}</div>
    `;

    const rowsHtml = requests
      .map(
        (req, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${req.curricularUnit}</strong><br><small style="color: #64748b">${req.course}</small></td>
        <td>${req.teacherName}</td>
        <td>${req.originalDate}<br><small style="color: #64748b">${req.originalStartTime.slice(0, 5)} - ${req.originalEndTime.slice(0, 5)}</small></td>
        <td>${req.newDate}<br><small style="color: #64748b">${req.newStartTime.slice(0, 5)} - ${req.newEndTime.slice(0, 5)}</small></td>
        <td>${req.newRoom || "-"}</td>
        <td><span class="badge badge-${req.status.toLowerCase()}">${req.status}</span></td>
      </tr>
    `
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>Compensa+ - Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 40px 30px;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 26px;
              font-weight: 800;
              color: #2563eb;
              letter-spacing: -0.025em;
            }
            .logo span {
              color: #64748b;
              font-weight: 400;
            }
            .title {
              font-size: 20px;
              font-weight: 700;
              color: #1e293b;
              margin-top: 4px;
            }
            .metadata {
              font-size: 13px;
              color: #64748b;
              text-align: right;
              line-height: 1.5;
            }
            .filters-summary {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px 20px;
              margin-bottom: 30px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              font-size: 13px;
            }
            .filter-item {
              line-height: 1.5;
            }
            .filter-item strong {
              color: #475569;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 16px;
              margin-bottom: 30px;
            }
            .card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              text-align: center;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
            }
            .card-value {
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
            }
            .card-label {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              margin-top: 6px;
              letter-spacing: 0.05em;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 12px;
            }
            th {
              background: #f8fafc;
              color: #475569;
              font-weight: 600;
              text-align: left;
              padding: 12px 14px;
              border-bottom: 2px solid #e2e8f0;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.05em;
            }
            td {
              padding: 14px;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: top;
              line-height: 1.4;
            }
            tr:nth-child(even) td {
              background: #fcfdfe;
            }
            .badge {
              display: inline-flex;
              padding: 4px 10px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.025em;
            }
            .badge-approved { background: #dcfce7; color: #15803d; }
            .badge-pending { background: #fef9c3; color: #a16207; }
            .badge-rejected { background: #fee2e2; color: #b91c1c; }
            .badge-cancelled { background: #f1f5f9; color: #475569; }
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Compensa<span>+</span></div>
              <div class="title">Compensation Requests Report</div>
            </div>
            <div class="metadata">
              Academic Year: <strong>${selectedYear?.name ?? ""}</strong><br>
              Date Generated: <strong>${new Date().toLocaleDateString()}</strong>
            </div>
          </div>

          <div class="filters-summary">
            ${filtersHtml}
          </div>

          <div class="summary-cards">
            <div class="card" style="border-top: 4px solid #2563eb">
              <div class="card-value">${total}</div>
              <div class="card-label">Total</div>
            </div>
            <div class="card" style="border-top: 4px solid #eab308">
              <div class="card-value">${pending}</div>
              <div class="card-label">Pending</div>
            </div>
            <div class="card" style="border-top: 4px solid #22c55e">
              <div class="card-value">${approved}</div>
              <div class="card-label">Approved</div>
            </div>
            <div class="card" style="border-top: 4px solid #ef4444">
              <div class="card-value">${rejected}</div>
              <div class="card-label">Rejected</div>
            </div>
            <div class="card" style="border-top: 4px solid #64748b">
              <div class="card-value">${cancelled}</div>
              <div class="card-label">Cancelled</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px">#</th>
                <th>Curricular Unit & Course</th>
                <th>Teacher</th>
                <th>Original Schedule</th>
                <th>Proposed Schedule</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 transition-all duration-300">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {t("requests.export_report") || "Export Requests Report"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Configure format and filters to generate a report of compensation requests.
          </DialogDescription>
        </DialogHeader>

        {isLoadingOptions ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading filters options...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Export Format
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("excel")}
                  className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                    format === "excel"
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("pdf")}
                  className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                    format === "pdf"
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  PDF Report
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Filter Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="all" className="cursor-pointer capitalize">All Statuses</SelectItem>
                  <SelectItem value="pending" className="cursor-pointer capitalize">Pending</SelectItem>
                  <SelectItem value="approved" className="cursor-pointer capitalize">Approved</SelectItem>
                  <SelectItem value="rejected" className="cursor-pointer capitalize">Rejected</SelectItem>
                  <SelectItem value="cancelled" className="cursor-pointer capitalize">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Filter (Admins & Coordinators only) */}
            {!isTeacher && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Filter Course
                </Label>
                <Select value={selectedCourseId} onValueChange={(val) => {
                  setSelectedCourseId(val);
                  setSelectedUnitId("all"); // reset unit selection when course changes
                }}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <SelectItem value="all" className="cursor-pointer">All Courses</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Curricular Unit Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Filter Curricular Unit (UC)
              </Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <SelectValue placeholder="Select Curricular Unit" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <SelectItem value="all" className="cursor-pointer">
                    {isTeacher ? "All my UCs" : "All Curricular Units"}
                  </SelectItem>
                  {displayUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Start Date
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  End Date
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoadingOptions || isExporting}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-5"
          >
            {isExporting ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                Exporting...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                Generate Report
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
