import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Calendar,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { toast } from "sonner";
import { useLanguage } from "../../providers/LanguageContext";
import { useAcademicYear } from "../../providers/AcademicYearContext";
import {
  importSchedulesApi,
  type TimetableImportPreviewResponse,
  type CoursePreviewDto,
  type ClassGroupPreviewDto,
  type SchedulePreviewDto,
} from "../../services/api/importSchedulesApi";

const WEEKDAYS = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export const ImportSchedulesPage = () => {
  const { t } = useLanguage();
  const { academicYears, selectedYear, setSelectedYearId } = useAcademicYear();

  // Page workflow state
  // "upload" | "preview" | "success"
  const [step, setStep] = useState<"upload" | "preview" | "success">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [importCount, setImportCount] = useState(0);

  // Upload state
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Preview state from backend
  const [previewData, setPreviewData] =
    useState<TimetableImportPreviewResponse | null>(null);

  // Local changes/overrides mapped by key
  // Course ID override: courseTempId -> courseId (database GUID)
  const [courseMappings, setCourseMappings] = useState<Record<string, string>>(
    {},
  );
  // Class Group ID override: classTempId -> classGroupId
  const [classMappings, setClassMappings] = useState<Record<string, string>>(
    {},
  );
  // Semester override
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(true);

  // We also keep track of local overrides for schedule slots
  // Key format: `${classTempId}_${slotIndex}` -> { matchedCurricularUnitId, matchedClassroomId, componentType, dayOfWeek, startTime, endTime }
  const [slotOverrides, setSlotOverrides] = useState<
    Record<
      string,
      {
        matchedCurricularUnitId?: string;
        matchedClassroomId?: string;
        componentType?: string;
        dayOfWeek?: number;
        startTime?: string;
        endTime?: string;
      }
    >
  >({});

  // Active view inside preview (which course & class we are inspecting)
  const [activeCourseIndex, setActiveCourseIndex] = useState<number>(0);
  const [activeClassIndex, setActiveClassIndex] = useState<number>(0);

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.name.endsWith(".html") || f.name.endsWith(".htm"),
      );
      if (droppedFiles.length === 0) {
        toast.error("Please drop only HTML or HTM files.");
        return;
      }
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  // Handle File Input Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        (f) => f.name.endsWith(".html") || f.name.endsWith(".htm"),
      );
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  // Remove File from list
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Run preview analysis
  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please add at least one timetable HTML file.");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      if (selectedYear) {
        formData.append("academicYearId", selectedYear.id);
      }

      const res = await importSchedulesApi.previewImport(formData);
      if (res.success && res.data) {
        setPreviewData(res.data);
        setSelectedSemester(res.data.detectedSemester);

        // Initialize mappings
        const initialCourseMaps: Record<string, string> = {};
        const initialClassMaps: Record<string, string> = {};

        res.data.courses.forEach((course) => {
          if (course.matchedCourseId) {
            initialCourseMaps[course.tempId] = course.matchedCourseId;
          }
          course.classes.forEach((cls) => {
            if (cls.matchedClassGroupId) {
              initialClassMaps[cls.tempId] = cls.matchedClassGroupId;
            }
          });
        });

        setCourseMappings(initialCourseMaps);
        setClassMappings(initialClassMaps);
        setSlotOverrides({});

        setActiveCourseIndex(0);
        setActiveClassIndex(0);
        setStep("preview");
        toast.success("HTML files parsed successfully! Please review matches.");
      } else {
        toast.error(res.message || "Failed to process timetables.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Error processing files.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Get active course/class previews
  const activeCourse = previewData?.courses[activeCourseIndex];
  const activeClass = activeCourse?.classes[activeClassIndex];
  const dbClassGroups = previewData?.availableClassGroups || [];

  // Lookup data helper
  const getCourseName = (tempId: string) => {
    const courseId = courseMappings[tempId];
    if (!courseId) return "Unmatched Course";
    return (
      previewData?.availableCourses.find((c) => c.id === courseId)?.name ||
      "Selected Course"
    );
  };

  const updateSlotOverride = (
    classTempId: string,
    slotIndex: number,
    field: string,
    value: any,
  ) => {
    const key = `${classTempId}_${slotIndex}`;
    setSlotOverrides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // Collect and confirm mapping and save schedules
  const handleConfirmImport = async () => {
    if (!previewData || !selectedYear) return;

    setIsSaving(true);
    try {
      const items: any[] = [];
      let missingMappings = 0;

      // Loop through all courses, classes and schedules
      previewData.courses.forEach((course) => {
        const mappedCourseId = courseMappings[course.tempId];
        if (!mappedCourseId) {
          missingMappings++;
          return;
        }

        course.classes.forEach((cls) => {
          const mappedClassGroupId = classMappings[cls.tempId];
          if (!mappedClassGroupId) {
            missingMappings++;
            return;
          }

          cls.schedules.forEach((slot, sIdx) => {
            const override = slotOverrides[`${cls.tempId}_${sIdx}`];
            const finalUnitId =
              override?.matchedCurricularUnitId ?? slot.matchedCurricularUnitId;
            const finalClassroomId =
              override?.matchedClassroomId ?? slot.matchedClassroomId;
            const finalCompType = override?.componentType ?? slot.componentType;
            const finalDay = override?.dayOfWeek ?? slot.dayOfWeek;
            const finalStart = override?.startTime ?? slot.startTime;
            const finalEnd = override?.endTime ?? slot.endTime;

            if (!finalUnitId || !finalClassroomId) {
              // Skip slots that are not fully mapped (classroom or unit missing)
              return;
            }

            items.push({
              courseId: mappedCourseId,
              classGroupId: mappedClassGroupId,
              curricularUnitId: finalUnitId,
              classroomId: finalClassroomId,
              componentType: finalCompType,
              dayOfWeek: finalDay,
              startTime:
                finalStart.length === 5 ? `${finalStart}:00` : finalStart,
              endTime: finalEnd.length === 5 ? `${finalEnd}:00` : finalEnd,
            });
          });
        });
      });

      if (missingMappings > 0) {
        toast.error(
          `Please map all courses and classes. There are ${missingMappings} unmatched entities.`,
        );
        setIsSaving(false);
        return;
      }

      if (items.length === 0) {
        toast.error(
          "No valid schedules were mapped. Please make sure UCs and classrooms are selected.",
        );
        setIsSaving(false);
        return;
      }

      const requestPayload = {
        academicYearId: selectedYear.id,
        semester: selectedSemester,
        schedules: items,
        overwriteExisting: overwriteExisting,
      };

      const res = await importSchedulesApi.confirmImport(requestPayload);
      if (res.success && res.data !== undefined) {
        setImportCount(res.data);
        setStep("success");
        toast.success(`${res.data} schedules imported successfully!`);
      } else {
        toast.error(res.message || "Failed to save imported schedules.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Error saving schedules.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetState = () => {
    setFiles([]);
    setPreviewData(null);
    setCourseMappings({});
    setClassMappings({});
    setSlotOverrides({});
    setStep("upload");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* 1. UPLOAD VIEW */}
      {step === "upload" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                {t("menu.import_schedules") || "Importar Horários"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Faça o carregamento dos horários exportados em HTML para inserir
                no sistema.
              </p>
            </div>
            {selectedYear && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ano Letivo:
                </span>
                <Select
                  value={selectedYear.id}
                  onValueChange={setSelectedYearId}
                >
                  <SelectTrigger className="h-8 border-none bg-transparent p-0 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <SelectValue placeholder="Ano Letivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-0">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-12 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500"
                    : ""
                }`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4 animate-bounce">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                  Arraste e solte seus ficheiros HTML aqui
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                  Selecione um ou mais ficheiros HTML exportados do
                  GestHor/Cronológica para processar os horários.
                </p>
                <span className="text-xs text-blue-500 mt-4 font-semibold hover:underline">
                  Procurar Ficheiros
                </span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".html,.htm"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader className="pb-3 border-b dark:border-slate-800">
                <CardTitle className="text-base font-bold flex justify-between items-center">
                  <span>Ficheiros Selecionados ({files.length})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 h-8 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => setFiles([])}
                  >
                    Limpar Todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 max-h-80 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold truncate max-w-sm md:max-w-md">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleUploadSubmit}
              disabled={files.length === 0 || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 px-6 shadow-lg shadow-blue-500/20"
            >
              {isProcessing && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isProcessing
                ? "A processar ficheiros..."
                : "Analisar e Pré-visualizar"}
            </Button>
          </div>
        </div>
      )}

      {/* 2. PREVIEW & ADJUST VIEW */}
      {step === "preview" && previewData && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Pré-visualizar Importação
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Ficheiros lidos com sucesso. Verifique e ajuste as
                correspondências abaixo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border">
                <span className="text-xs text-slate-500">Semestre:</span>
                <Select
                  value={String(selectedSemester)}
                  onValueChange={(val) => setSelectedSemester(Number(val))}
                >
                  <SelectTrigger className="h-8 border-none bg-transparent p-0 font-semibold text-sm">
                    <SelectValue placeholder="Semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Semestre</SelectItem>
                    <SelectItem value="2">2º Semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border">
                <Checkbox
                  id="overwrite-check"
                  checked={overwriteExisting}
                  onCheckedChange={(checked) =>
                    setOverwriteExisting(Boolean(checked))
                  }
                />
                <label
                  htmlFor="overwrite-check"
                  className="text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  Sobrescrever existentes
                </label>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-slate-500">Cursos Encontrados</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {previewData.courses.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full">
                  <BookOpen className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-slate-500">Turmas Encontradas</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {previewData.courses.reduce(
                      (acc, c) => acc + c.classes.length,
                      0,
                    )}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                  <FileText className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-slate-500">Total de Aulas/Slots</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {previewData.courses.reduce(
                      (acc, c) =>
                        acc +
                        c.classes.reduce(
                          (ac, cl) => ac + cl.schedules.length,
                          0,
                        ),
                      0,
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full">
                  <Calendar className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-slate-500">
                    Alertas de Associação
                  </p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {/* Calculate unmatched courses/classes/slots */}
                    {previewData.courses.filter(
                      (c) => !courseMappings[c.tempId],
                    ).length +
                      previewData.courses.reduce(
                        (acc, c) =>
                          acc +
                          c.classes.filter((cl) => !classMappings[cl.tempId])
                            .length,
                        0,
                      )}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar selector */}
            <div className="lg:col-span-3 space-y-3 max-h-[600px] overflow-y-auto p-1 bg-slate-50/50 dark:bg-slate-900/50 dark:border dark:border-slate-800 rounded-xl">
              <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                Ficheiros / Turmas
              </div>
              {previewData.courses.map((course, cIdx) => (
                <div key={course.tempId} className="space-y-1">
                  <div className="px-2.5 py-1 text-left text-xs font-bold text-slate-500 flex items-center justify-between">
                    <span>{course.abbreviation}</span>
                    {!courseMappings[course.tempId] && (
                      <Badge className="bg-amber-100 text-amber-700 text-[10px] py-0 border-none">
                        Por Associar
                      </Badge>
                    )}
                  </div>
                  {course.classes.map((cls, clIdx) => {
                    const isActive =
                      activeCourseIndex === cIdx && activeClassIndex === clIdx;
                    const isMatched = classMappings[cls.tempId];
                    return (
                      <button
                        key={cls.tempId}
                        onClick={() => {
                          setActiveCourseIndex(cIdx);
                          setActiveClassIndex(clIdx);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white font-semibold"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="truncate">{cls.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              isActive
                                ? "bg-blue-700 text-blue-100"
                                : "bg-slate-200/60 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {cls.schedules.length}
                          </span>
                          {!isMatched && (
                            <AlertCircle
                              className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-amber-500"}`}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Editing / Matching Area */}
            <div className="lg:col-span-9 space-y-6">
              {activeCourse && activeClass ? (
                <>
                  {/* Entity Alignment Card */}
                  <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-3 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <CardTitle className="text-base font-bold text-left flex items-center gap-2">
                        <span>Associação de Curso e Turma</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Course Mapping */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-slate-500">
                          Curso no Ficheiro:{" "}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {activeCourse.abbreviation} ({activeCourse.name})
                          </span>
                        </label>
                        <Select
                          value={courseMappings[activeCourse.tempId] || ""}
                          onValueChange={(val) => {
                            setCourseMappings((prev) => ({
                              ...prev,
                              [activeCourse.tempId]: val,
                            }));
                          }}
                        >
                          <SelectTrigger
                            className={
                              !courseMappings[activeCourse.tempId]
                                ? "border-amber-500 dark:border-amber-500 bg-amber-50/20"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Selecione o Curso correspondente..." />
                          </SelectTrigger>
                          <SelectContent>
                            {previewData.availableCourses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.abbreviation} - {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Class Group Mapping */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-slate-500">
                          Turma no Ficheiro:{" "}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {activeClass.name}
                          </span>
                        </label>
                        <Select
                          value={classMappings[activeClass.tempId] || ""}
                          onValueChange={(val) => {
                            setClassMappings((prev) => ({
                              ...prev,
                              [activeClass.tempId]: val,
                            }));
                          }}
                          disabled={!courseMappings[activeCourse.tempId]}
                        >
                          <SelectTrigger
                            className={
                              !classMappings[activeClass.tempId]
                                ? "border-amber-500 dark:border-amber-500 bg-amber-50/20"
                                : ""
                            }
                          >
                            <SelectValue
                              placeholder={
                                courseMappings[activeCourse.tempId]
                                  ? "Selecione a Turma correspondente..."
                                  : "Selecione primeiro o Curso"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Render available class groups for selected course */}
                            {/* In a real project, we load class groups for that course, or we let the user map to existing class groups */}
                            {/* For flexibility, we list class groups matching activeCourse.matchedCourseId or lets allow mapping to any */}
                            {/* Here we show the class groups that belong to the chosen course */}
                            {/* To avoid loading state, let's filter dbClassGroups or just list active year class groups */}
                            {/* We can show active class groups for this academic year */}
                            {/* Or let's generate them */}
                            {/* Let's list all class groups for selected course */}
                            {dbClassGroups
                              .filter(
                                (cg) =>
                                  cg.courseId ===
                                  courseMappings[activeCourse.tempId],
                              )
                              .map((cg) => (
                                <SelectItem key={cg.id} value={cg.id}>
                                  {cg.name}
                                </SelectItem>
                              ))}
                            {/* If no class groups exist, allow selection or alert */}
                            {dbClassGroups.filter(
                              (cg) =>
                                cg.courseId ===
                                courseMappings[activeCourse.tempId],
                            ).length === 0 && (
                              <SelectItem value="empty" disabled>
                                Nenhuma turma encontrada neste ano letivo
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schedules Table */}
                  <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <CardTitle className="text-base font-bold text-left">
                        Aulas Detetadas ({activeClass.schedules.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[24%]">
                              Unidade Curricular (UC)
                            </TableHead>
                            <TableHead className="w-[12%]">Tipo</TableHead>
                            <TableHead className="w-[12%]">Dia</TableHead>
                            <TableHead className="w-[20%]">Horário</TableHead>
                            <TableHead className="w-[24%]">
                              Sala de Aula
                            </TableHead>
                            <TableHead className="w-[8%] text-center"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeClass.schedules.map((slot, sIdx) => {
                            const overrideKey = `${activeClass.tempId}_${sIdx}`;
                            const override = slotOverrides[overrideKey];

                            const selectedUnitId =
                              override?.matchedCurricularUnitId ??
                              slot.matchedCurricularUnitId ??
                              "";
                            const selectedRoomId =
                              override?.matchedClassroomId ??
                              slot.matchedClassroomId ??
                              "";
                            const compType =
                              override?.componentType ?? slot.componentType;
                            const day = override?.dayOfWeek ?? slot.dayOfWeek;
                            const start = override?.startTime ?? slot.startTime;
                            const end = override?.endTime ?? slot.endTime;

                            // Curricular units filter for the chosen course
                            const availableUnits =
                              activeCourse.availableUnits || [];

                            return (
                              <TableRow
                                key={sIdx}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                              >
                                {/* UC Selection */}
                                <TableCell className="py-2.5">
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      Sigla: {slot.curricularUnitAbbreviation}
                                    </span>
                                    <Select
                                      value={selectedUnitId}
                                      onValueChange={(val) =>
                                        updateSlotOverride(
                                          activeClass.tempId,
                                          sIdx,
                                          "matchedCurricularUnitId",
                                          val,
                                        )
                                      }
                                      disabled={
                                        !courseMappings[activeCourse.tempId]
                                      }
                                    >
                                      <SelectTrigger
                                        className={`h-8 py-0 px-2 text-xs ${!selectedUnitId ? "border-amber-500 dark:border-amber-500 bg-amber-50/10 text-amber-700 dark:text-amber-400" : ""}`}
                                      >
                                        <SelectValue placeholder="Associar UC..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableUnits.map((unit) => (
                                          <SelectItem
                                            key={unit.id}
                                            value={unit.id}
                                          >
                                            {unit.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>

                                {/* Component Type */}
                                <TableCell className="py-2.5">
                                  <Select
                                    value={compType}
                                    onValueChange={(val) =>
                                      updateSlotOverride(
                                        activeClass.tempId,
                                        sIdx,
                                        "componentType",
                                        val,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-8 py-0 px-2 text-xs">
                                      <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Theoretical">
                                        Teórica (T)
                                      </SelectItem>
                                      <SelectItem value="Practical">
                                        Prática (P/TP)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>

                                {/* Day of Week */}
                                <TableCell className="py-2.5">
                                  <Select
                                    value={String(day)}
                                    onValueChange={(val) =>
                                      updateSlotOverride(
                                        activeClass.tempId,
                                        sIdx,
                                        "dayOfWeek",
                                        Number(val),
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-8 py-0 px-2 text-xs">
                                      <SelectValue placeholder="Dia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {WEEKDAYS.map((w) => (
                                        <SelectItem
                                          key={w.value}
                                          value={String(w.value)}
                                        >
                                          {w.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>

                                {/* Time Picker */}
                                <TableCell className="py-2.5">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      className="w-11 text-center h-8 bg-transparent border rounded text-xs py-0.5 px-1 dark:border-slate-800"
                                      value={start}
                                      onChange={(e) =>
                                        updateSlotOverride(
                                          activeClass.tempId,
                                          sIdx,
                                          "startTime",
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <span className="text-slate-400 text-xs">
                                      -
                                    </span>
                                    <input
                                      type="text"
                                      className="w-11 text-center h-8 bg-transparent border rounded text-xs py-0.5 px-1 dark:border-slate-800"
                                      value={end}
                                      onChange={(e) =>
                                        updateSlotOverride(
                                          activeClass.tempId,
                                          sIdx,
                                          "endTime",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                </TableCell>

                                {/* Classroom Selection */}
                                <TableCell className="py-2.5">
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      Detetada: {slot.classroomName || "N/A"}
                                    </span>
                                    <Select
                                      value={selectedRoomId}
                                      onValueChange={(val) =>
                                        updateSlotOverride(
                                          activeClass.tempId,
                                          sIdx,
                                          "matchedClassroomId",
                                          val,
                                        )
                                      }
                                    >
                                      <SelectTrigger
                                        className={`h-8 py-0 px-2 text-xs ${!selectedRoomId ? "border-amber-500 dark:border-amber-500 bg-amber-50/10 text-amber-700 dark:text-amber-400" : ""}`}
                                      >
                                        <SelectValue placeholder="Associar Sala..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {previewData.availableClassrooms.map(
                                          (room) => (
                                            <SelectItem
                                              key={room.id}
                                              value={room.id}
                                            >
                                              {room.name}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>

                                {/* Delete Slot Action */}
                                <TableCell className="py-2.5 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                                    onClick={() => {
                                      // Remove this slot from activeClass.schedules
                                      // Modifying state arrays directly
                                      activeClass.schedules.splice(sIdx, 1);
                                      // Trigger re-render by setting a copy
                                      setPreviewData({ ...previewData });
                                      toast.info(
                                        "Slot removido da importação.",
                                      );
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50 dark:bg-slate-900 border rounded-xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold">
                    Nenhuma turma ou curso selecionado
                  </p>
                  <p className="text-xs text-slate-500">
                    Por favor, clique em um item da barra lateral para
                    visualizar as suas aulas.
                  </p>
                </div>
              )}

              {/* Confirm Import Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border dark:border-slate-800 dark:bg-slate-900 rounded-xl">
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-500">
                    Ao confirmar, os horários selecionados e ajustados serão
                    guardados no sistema.
                  </p>
                  <p className="text-xs text-slate-400">
                    Total de slots mapeados com sucesso:{" "}
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {previewData.courses.reduce(
                        (acc, c) =>
                          acc +
                          c.classes.reduce((ac, cl) => {
                            const mappedClsId = classMappings[cl.tempId];
                            if (!mappedClsId) return ac;
                            return (
                              ac +
                              cl.schedules.filter((s, idx) => {
                                const override =
                                  slotOverrides[`${cl.tempId}_${idx}`];
                                const uId =
                                  override?.matchedCurricularUnitId ??
                                  s.matchedCurricularUnitId;
                                const rId =
                                  override?.matchedClassroomId ??
                                  s.matchedClassroomId;
                                return !!uId && !!rId;
                              }).length
                            );
                          }, 0),
                        0,
                      )}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetState}>
                    Começar de Novo
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {isSaving && (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Confirmar Importação
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUCCESS VIEW */}
      {step === "success" && (
        <Card className="max-w-2xl mx-auto dark:bg-slate-900 dark:border-slate-800 p-8 shadow-xl animate-in zoom-in-95 duration-300">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50">
              Importação Concluída!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-md">
              Foram importados com sucesso{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                {importCount}
              </span>{" "}
              horários de aulas para o {selectedSemester}º Semestre do Ano
              Letivo {previewData?.academicYearName}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full">
              <Button variant="outline" onClick={resetState} className="w-full">
                Importar Mais Horários
              </Button>
              <Button
                onClick={() => (window.location.href = "/calendar")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Ver Calendário
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
