import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Building2, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../components/ui/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner@2.0.3';
import type { User } from '../../mocks/data';
import {
  createClassroom,
  deleteClassroom,
  listClassrooms,
  updateClassroom,
} from '../../services/classrooms/classroomsApi';
import type { Classroom, ClassroomType, UpsertClassroomRequest } from '../../services/classrooms/classroomTypes';
import { getErrorMessage } from '../../utils/errors';

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
  { value: 'Amphitheater', label: 'Amphitheater' },
  { value: 'Standard', label: 'Standard' },
  { value: 'PcLab', label: 'PC Lab' },
  { value: 'MacLab', label: 'Mac Lab' },
];

const initialFormState: ClassroomFormState = {
  name: '',
  type: 'Standard',
  capacity: '',
  features: '',
  isActive: true,
};

const getClassroomTypeLabel = (type: ClassroomType) => {
  return classroomTypeOptions.find((option) => option.value === type)?.label ?? type;
};

const getClassroomAccent = (type: ClassroomType) => {
  if (type === 'PcLab') return 'bg-blue-500';
  if (type === 'MacLab') return 'bg-emerald-500';
  if (type === 'Amphitheater') return 'bg-purple-500';
  return 'bg-green-500';
};

export const ClassroomsPage = ({ user }: ClassroomsPageProps) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomPage, setRoomPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [formState, setFormState] = useState<ClassroomFormState>(initialFormState);

  const roomPageSize = 6;
  const isAdmin = user.role === 'admin';

  const loadClassrooms = async () => {
    try {
      setIsLoading(true);
      const result = await listClassrooms();
      setClassrooms(result);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load classrooms.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {
    setRoomPage(1);
  }, [searchTerm]);

  const filteredClassrooms = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return classrooms;
    }

    return classrooms.filter((classroom) =>
      classroom.name.toLowerCase().includes(normalizedSearch) ||
      getClassroomTypeLabel(classroom.type).toLowerCase().includes(normalizedSearch) ||
      classroom.features.some((feature) => feature.toLowerCase().includes(normalizedSearch)),
    );
  }, [classrooms, searchTerm]);

  const totalRoomPages = Math.max(1, Math.ceil(filteredClassrooms.length / roomPageSize));
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
      features: classroom.features.join(', '),
      isActive: classroom.isActive,
    });
    setIsFormOpen(true);
  };

  const buildRequest = (): UpsertClassroomRequest | null => {
    const capacity = Number(formState.capacity);

    if (!formState.name.trim()) {
      toast.error('Classroom name is required.');
      return null;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      toast.error('Capacity must be a positive whole number.');
      return null;
    }

    return {
      name: formState.name.trim(),
      type: formState.type,
      capacity,
      features: formState.features
        .split(',')
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
        throw new Error('Classroom response was empty.');
      }

      setClassrooms((current) => {
        if (editingClassroom) {
          return current.map((classroom) => (classroom.id === saved.id ? saved : classroom));
        }

        return [...current, saved].sort((a, b) => a.name.localeCompare(b.name));
      });

      setIsFormOpen(false);
      toast.success(editingClassroom ? 'Classroom updated.' : 'Classroom created.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to save classroom.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (classroom: Classroom) => {
    if (!window.confirm(`Delete classroom ${classroom.name}?`)) {
      return;
    }

    try {
      await deleteClassroom(classroom.id);
      setClassrooms((current) => current.filter((item) => item.id !== classroom.id));
      toast.success('Classroom deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete classroom.'));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Classrooms Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage physical spaces and their resources.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4 mr-2" /> Add Classroom
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-[380px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search classrooms..."
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-200 dark:placeholder:text-slate-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading classrooms...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRooms.map((room) => (
            <Card key={room.id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
              <div className={cn('h-2 w-full', getClassroomAccent(room.type))} />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    {room.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {room.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {getClassroomTypeLabel(room.type)} - {room.capacity} Seats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-2 min-h-8">
                  {room.features.map((feature) => (
                    <span key={feature} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium">
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
                      onClick={() => handleDelete(room)}
                      className="w-full text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
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
                  className={cn('cursor-pointer', roomPage === 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              {Array.from({ length: totalRoomPages }, (_, index) => index + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink isActive={roomPage === page} onClick={() => setRoomPage(page)} className="cursor-pointer">
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setRoomPage((page) => Math.min(totalRoomPages, page + 1))}
                  className={cn('cursor-pointer', roomPage === totalRoomPages && 'pointer-events-none opacity-50')}
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
              <DialogTitle>{editingClassroom ? 'Edit Classroom' : 'Add Classroom'}</DialogTitle>
              <DialogDescription>
                Configure rooms before building courses, units, classes, and schedules.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="classroom-name">Name</Label>
                <Input
                  id="classroom-name"
                  placeholder="C1.01"
                  value={formState.name}
                  onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value: ClassroomType) => setFormState((current) => ({ ...current, type: value }))}
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
                  onChange={(event) => setFormState((current) => ({ ...current, capacity: event.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                <div>
                  <Label htmlFor="classroom-active">Active</Label>
                  <p className="text-xs text-slate-500">Available for scheduling</p>
                </div>
                <Switch
                  id="classroom-active"
                  checked={formState.isActive}
                  onCheckedChange={(checked) => setFormState((current) => ({ ...current, isActive: checked }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="classroom-features">Features</Label>
                <Input
                  id="classroom-features"
                  placeholder="Projector, Whiteboard, 30 PCs"
                  value={formState.features}
                  onChange={(event) => setFormState((current) => ({ ...current, features: event.target.value }))}
                />
                <p className="text-xs text-slate-500">Separate features with commas.</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingClassroom ? 'Save Classroom' : 'Create Classroom'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
