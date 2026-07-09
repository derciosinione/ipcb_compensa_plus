import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "../../providers/LanguageContext";
import {
  listAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  copyOfferings,
} from "../../services/academicYears/academicYearsApi";
import type { AcademicYear } from "../../services/academicYears/academicYearTypes";
import { getErrorMessage } from "../../utils/errors";
import { useAcademicYear } from "../../providers/AcademicYearContext";

export const AcademicYearsPage = () => {
  const { t, language } = useLanguage();
  const { refresh: refreshGlobalYears } = useAcademicYear();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formStartsOn, setFormStartsOn] = useState("");
  const [formEndsOn, setFormEndsOn] = useState("");
  const [formIsActive, setFormIsActive] = useState(false);

  // Copy states
  const [sourceYearId, setSourceYearId] = useState("");
  const [targetYearId, setTargetYearId] = useState("");

  const loadAcademicYears = async () => {
    try {
      setIsLoading(true);
      const data = await listAcademicYears();
      setAcademicYears(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load academic years."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const openCreate = () => {
    setEditingYear(null);
    setFormName("");
    setFormStartsOn(new Date().toISOString().split("T")[0]);
    setFormEndsOn(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]);
    setFormIsActive(false);
    setIsFormOpen(true);
  };

  const openEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setFormName(year.name);
    setFormStartsOn(year.startsOn.split("T")[0]);
    setFormEndsOn(year.endsOn.split("T")[0]);
    setFormIsActive(year.isActive);
    setIsFormOpen(true);
  };

  const openCopy = (targetYear: AcademicYear) => {
    setTargetYearId(targetYear.id);
    setSourceYearId("");
    setIsCopyModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const request = {
        name: formName,
        startsOn: new Date(formStartsOn).toISOString(),
        endsOn: new Date(formEndsOn).toISOString(),
        isActive: formIsActive,
      };

      if (editingYear) {
        await updateAcademicYear(editingYear.id, request);
        toast.success("Academic year updated successfully");
      } else {
        await createAcademicYear(request);
        toast.success("Academic year created successfully");
      }

      await loadAcademicYears();
      await refreshGlobalYears();
      setIsFormOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save academic year."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!sourceYearId || !targetYearId) {
      toast.error("Please select both source and target years.");
      return;
    }

    setIsSaving(true);
    try {
      await copyOfferings(targetYearId, sourceYearId);
      toast.success("Courses and unit offerings copied successfully.");
      setIsCopyModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to copy offerings."));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredYears = academicYears.filter((y) =>
    y.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Academic Years
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage academic years and configure course offerings.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Academic Year
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search academic years..."
          className="pl-9 bg-white dark:bg-slate-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredYears.map((year) => (
            <Card key={year.id} className="overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{year.name}</CardTitle>
                    <CardDescription>
                      {new Date(year.startsOn).getFullYear()} - {new Date(year.endsOn).getFullYear()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {year.isActive && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-none">
                        Active
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEdit(year)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openCopy(year)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy From Year...
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("academic_years.starts_on")}</span>
                    <span className="font-medium">{new Date(year.startsOn).toLocaleDateString(language === "pt" ? "pt-PT" : "en-US")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("academic_years.ends_on")}</span>
                    <span className="font-medium">{new Date(year.endsOn).toLocaleDateString(language === "pt" ? "pt-PT" : "en-US")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingYear ? "Edit Academic Year" : "New Academic Year"}</DialogTitle>
              <DialogDescription>
                Configure the dates and status for the academic year.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 2024/2025"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startsOn">Starts On</Label>
                  <Input
                    id="startsOn"
                    type="date"
                    value={formStartsOn}
                    onChange={(e) => setFormStartsOn(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endsOn">Ends On</Label>
                  <Input
                    id="endsOn"
                    type="date"
                    value={formEndsOn}
                    onChange={(e) => setFormEndsOn(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Year</Label>
                  <p className="text-xs text-slate-500">The current default year for the system.</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingYear ? "Save Changes" : "Create Year"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Copy Modal */}
      <Dialog open={isCopyModalOpen} onOpenChange={setIsCopyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-600" />
              Copy Configuration
            </DialogTitle>
            <DialogDescription>
              Copy all courses and curricular unit offerings from a previous year.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This will duplicate all course coordinators and responsible teachers from the source year to the target year.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Source Year</Label>
              <Select value={sourceYearId} onValueChange={setSourceYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year to copy from" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears
                    .filter((y) => y.id !== targetYearId)
                    .map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Target Year</Label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-medium border">
                {academicYears.find(y => y.id === targetYearId)?.name}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCopyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopy} disabled={isSaving || !sourceYearId} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
