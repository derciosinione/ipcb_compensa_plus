import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Building2,
  Loader2,
  Plus,
  Search,
  Trash2,
  LayoutGrid,
  List,
  AlertTriangle,
} from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import type { User } from "../../types/user";
import {
  createClassroom,
  deleteClassroom,
  deleteClassroomsBulk,
  getClassroomUsage,
  getClassroomsUsageBulk,
  listClassrooms,
  updateClassroom,
} from "../../services/classrooms/classroomsApi";
import type {
  Classroom,
  ClassroomType,
  UpsertClassroomRequest,
} from "../../services/classrooms/classroomTypes";
import { getErrorMessage } from "../../utils/errors";

interface ClassroomsPageProps {
  user: User;
}

interface ClassroomFormState {
  name: string;
  type: ClassroomType;
  capacity: string;
  features: string;
  isActive: boolean;
}

const classroomTypeOptions: Array<{ value: ClassroomType; label: string }> = [
  { value: "Amphitheater", label: "Amphitheater" },
  { value: "Standard", label: "Standard" },
  { value: "PcLab", label: "PC Lab" },
  { value: "MacLab", label: "Mac Lab" },
];

const initialFormState: ClassroomFormState = {
  name: "",
  type: "Standard",
  capacity: "",
  features: "",
  isActive: true,
};

const getClassroomTypeLabel = (type: ClassroomType) => {
  return (
    classroomTypeOptions.find((option) => option.value === type)?.label ?? type
  );
};

const getClassroomAccent = (type: ClassroomType) => {
  if (type === "PcLab") return "bg-blue-500";
  if (type === "MacLab") return "bg-emerald-500";
  if (type === "Amphitheater") return "bg-purple-500";
  return "bg-green-500";
};

export const ClassroomsPage = ({ user }: ClassroomsPageProps) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomPage, setRoomPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Classroom | null>(null);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(
    null,
  );
  const [formState, setFormState] =
    useState<ClassroomFormState>(initialFormState);

  const [viewType, setViewType] = useState<"grid" | "table">("grid");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [schedulesCountToDelete, setSchedulesCountToDelete] = useState<number | null>(null);
  const [bulkSchedulesCount, setBulkSchedulesCount] = useState<number | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null);
  const [loadingBulk, setLoadingBulk] = useState(false);

  const roomPageSize = 6;
  const isAdmin = user.role === "admin";

  const loadClassrooms = async () => {
    try {
      setIsLoading(true);
      const result = await listClassrooms();
      setClassrooms(result);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load classrooms."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {
    setRoomPage(1);
    setSelectedRoomIds([]);
  }, [searchTerm]);

  useEffect(() => {
    setSelectedRoomIds([]);
  }, [roomPage, viewType]);

  const filteredClassrooms = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return classrooms;
    }

    return classrooms.filter(
      (classroom) =>
        classroom.name.toLowerCase().includes(normalizedSearch) ||
        getClassroomTypeLabel(classroom.type)
          .toLowerCase()
          .includes(normalizedSearch) ||
        classroom.features.some((feature) =>
          feature.toLowerCase().includes(normalizedSearch),
        ),
    );
  }, [classrooms, searchTerm]);

  const totalRoomPages = Math.max(
    1,
    Math.ceil(filteredClassrooms.length / roomPageSize),
  );
  const paginatedRooms = filteredClassrooms.slice(
    (roomPage - 1) * roomPageSize,
    roomPage * roomPageSize,
  );

  const openCreate = () => {
    setEditingClassroom(null);
    setFormState(initialFormState);
    setIsFormOpen(true);
  };

  const openEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setFormState({
      name: classroom.name,
      type: classroom.type,
      capacity: classroom.capacity.toString(),
      features: classroom.features.join(","),
      isActive: classroom.isActive,
    });
    setIsFormOpen(true);
  };

  const buildRequest = (): UpsertClassroomRequest | null => {
    const capacity = Number(formState.capacity);

    if (!formState.name.trim()) {
      toast.error("Classroom name is required.");
      return null;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      toast.error("Capacity must be a positive whole number.");
      return null;
    }

    return {
      name: formState.name.trim(),
      type: formState.type,
      capacity,
      features: formState.features
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
      isActive: formState.isActive,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const request = buildRequest();

    if (!request) {
      return;
    }

    try {
      setIsSaving(true);
      const saved = editingClassroom
        ? await updateClassroom(editingClassroom.id, request)
        : await createClassroom(request);

      if (!saved) {
        throw new Error("Classroom response was empty.");
      }

      setClassrooms((current) => {
        if (editingClassroom) {
          return current.map((classroom) =>
            classroom.id === saved.id ? saved : classroom,
          );
        }

        return [...current, saved].sort((a, b) => a.name.localeCompare(b.name));
      });

      setIsFormOpen(false);
      toast.success(
        editingClassroom ? "Classroom updated." : "Classroom created.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save classroom."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async (classroom: Classroom) => {
    try {
      setLoadingRoomId(classroom.id);
      const usage = await getClassroomUsage(classroom.id);
      setSchedulesCountToDelete(usage.associatedSchedulesCount);
      setRoomToDelete(classroom);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao obter dados de uso da sala."));
    } finally {
      setLoadingRoomId(null);
    }
  };

  const executeDelete = async () => {
    if (!roomToDelete) return;
    const roomId = roomToDelete.id;
    setRoomToDelete(null);

    try {
      await deleteClassroom(roomId);
      setClassrooms((current) => current.filter((item) => item.id !== roomId));
      setSelectedRoomIds((prev) => prev.filter((id) => id !== roomId));
      toast.success("Sala eliminada com sucesso.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível eliminar a sala."));
    }
  };

  const handleBulkDeleteClick = async () => {
    if (selectedRoomIds.length === 0) return;
    try {
      setLoadingBulk(true);
      const usages = await getClassroomsUsageBulk(selectedRoomIds);
      const totalSchedules = usages.reduce((sum, u) => sum + u.associatedSchedulesCount, 0);
      setBulkSchedulesCount(totalSchedules);
      setIsBulkDeleteOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao obter dados de uso das salas selecionadas."));
    } finally {
      setLoadingBulk(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedRoomIds.length === 0) return;
    const idsToDelete = [...selectedRoomIds];
    setIsBulkDeleteOpen(false);

    try {
      await deleteClassroomsBulk(idsToDelete);
      setClassrooms((current) => current.filter((item) => !idsToDelete.includes(item.id)));
      setSelectedRoomIds([]);
      toast.success("Salas eliminadas com sucesso.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível eliminar as salas."));
    }
  };

  const handleSelectRoom = (roomId: string, checked: boolean) => {
    setSelectedRoomIds((prev) =>
      checked ? [...prev, roomId] : prev.filter((id) => id !== roomId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    const paginatedIds = paginatedRooms.map((room) => room.id);
    if (checked) {
      setSelectedRoomIds((prev) => {
        const union = new Set([...prev, ...paginatedIds]);
        return Array.from(union);
      });
    } else {
      setSelectedRoomIds((prev) => prev.filter((id) => !paginatedIds.includes(id)));
    }
  };

  const isAllSelected = paginatedRooms.length > 0 && paginatedRooms.every((room) => selectedRoomIds.includes(room.id));
  const isSomeSelected = paginatedRooms.some((room) => selectedRoomIds.includes(room.id)) && !isAllSelected;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Classrooms Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage physical spaces and their resources.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreate}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Classroom
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-[380px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search classrooms..."
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-200 dark:placeholder:text-slate-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {isAdmin && selectedRoomIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDeleteClick}
              className="rounded-xl shadow-lg shadow-red-500/10"
              disabled={loadingBulk}
            >
              {loadingBulk ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Eliminar ({selectedRoomIds.length})
            </Button>
          )}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-900">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewType("grid")}
              className={cn(
                "h-9 w-9 rounded-lg transition-colors",
                viewType === "grid"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
              )}
            >
              <LayoutGrid className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewType("table")}
              className={cn(
                "h-9 w-9 rounded-lg transition-colors",
                viewType === "table"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
              )}
            >
              <List className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading classrooms...
        </div>
      ) : viewType === "table" ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-250 dark:border-slate-800">
                {isAdmin && (
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Select all classrooms"
                    />
                  </TableHead>
                )}
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Capacity</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Features</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                {isAdmin && (
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRooms.map((room) => (
                <TableRow
                  key={room.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {isAdmin && (
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedRoomIds.includes(room.id)}
                        onCheckedChange={(checked) => handleSelectRoom(room.id, !!checked)}
                        aria-label={`Select ${room.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {room.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {getClassroomTypeLabel(room.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-650 dark:text-slate-350">{room.capacity} Seats</TableCell>
                  <TableCell className="text-slate-650 dark:text-slate-350 max-w-[250px] truncate">
                    <div className="flex flex-wrap gap-1">
                      {room.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded text-[10px] text-slate-605 dark:text-slate-355 font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                      {room.features.length > 3 && (
                        <span className="text-[10px] text-slate-405 font-medium">+{room.features.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "px-2.5 py-0.5 font-semibold rounded-full text-xs",
                        room.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {room.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(room)}
                          className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(room)}
                          className="text-slate-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={loadingRoomId !== null}
                        >
                          {loadingRoomId === room.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRooms.map((room) => (
            <Card
              key={room.id}
              className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900"
            >
              <div
                className={cn("h-2 w-full", getClassroomAccent(room.type))}
              />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    {room.name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {room.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {getClassroomTypeLabel(room.type)} - {room.capacity} Seats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-2 min-h-8">
                  {room.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(room)}
                      className="w-full text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(room)}
                      className="w-full text-slate-500 dark:text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={loadingRoomId !== null}
                    >
                      {loadingRoomId === room.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredClassrooms.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No classrooms found.
        </div>
      )}

      {totalRoomPages > 1 && (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setRoomPage((page) => Math.max(1, page - 1))}
                  className={cn(
                    "cursor-pointer",
                    roomPage === 1 && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
              {Array.from(
                { length: totalRoomPages },
                (_, index) => index + 1,
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={roomPage === page}
                    onClick={() => setRoomPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setRoomPage((page) => Math.min(totalRoomPages, page + 1))
                  }
                  className={cn(
                    "cursor-pointer",
                    roomPage === totalRoomPages &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>
                {editingClassroom ? "Edit Classroom" : "Add Classroom"}
              </DialogTitle>
              <DialogDescription>
                Configure rooms before building courses, units, classes, and
                schedules.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="classroom-name">Name</Label>
                <Input
                  id="classroom-name"
                  placeholder="C1.01"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value: ClassroomType) =>
                    setFormState((current) => ({ ...current, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {classroomTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroom-capacity">Capacity</Label>
                <Input
                  id="classroom-capacity"
                  type="number"
                  min={1}
                  placeholder="40"
                  value={formState.capacity}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      capacity: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                <div>
                  <Label htmlFor="classroom-active">Active</Label>
                  <p className="text-xs text-slate-500">
                    Available for scheduling
                  </p>
                </div>
                <Switch
                  id="classroom-active"
                  checked={formState.isActive}
                  onCheckedChange={(checked) =>
                    setFormState((current) => ({
                      ...current,
                      isActive: checked,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="classroom-features">Features</Label>
                <Input
                  id="classroom-features"
                  placeholder="Projector, Whiteboard, 30 PCs"
                  value={formState.features}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      features: event.target.value,
                    }))
                  }
                />
                <p className="text-xs text-slate-500">
                  Separate features with commas.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingClassroom ? "Save Classroom" : "Create Classroom"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={roomToDelete !== null}
        onOpenChange={(open) => !open && setRoomToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Eliminar Sala</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Tem a certeza de que deseja eliminar a sala "<strong>{roomToDelete?.name}</strong>"? Esta ação é permanente.
              </p>
              {schedulesCountToDelete !== null && schedulesCountToDelete > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">Aviso Importante</h4>
                    <p className="text-xs mt-1 leading-relaxed text-amber-800 dark:text-amber-305">
                      Esta sala tem <strong>{schedulesCountToDelete}</strong> turma(s)/aula(s) associada(s). Se a eliminar, estas turmas poderão ficar sem salas atribuídas.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Eliminar Salas em Lote</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Tem a certeza de que deseja eliminar as <strong>{selectedRoomIds.length}</strong> salas selecionadas? Esta ação é permanente.
              </p>
              {bulkSchedulesCount !== null && bulkSchedulesCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">Aviso Importante</h4>
                    <p className="text-xs mt-1 leading-relaxed text-amber-800 dark:text-amber-305">
                      As salas selecionadas têm um total de <strong>{bulkSchedulesCount}</strong> turma(s)/aula(s) associada(s). Ao eliminá-las, estas turmas poderão ficar sem salas atribuídas.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
