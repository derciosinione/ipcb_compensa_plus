import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Badge } from '../../../components/ui/badge';
import type { Course, CurricularUnit } from '../../../services/courses/courseTypes';
import type { PlatformUser } from '../../../services/users/userTypes';

interface TeacherUnitsModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (curricularUnitIds: string[]) => Promise<void> | void;
  user?: PlatformUser;
  courses: Course[];
  units: CurricularUnit[];
  assignedUnitIds: string[];
}

export const TeacherUnitsModal = ({
  isOpen,
  isSaving = false,
  onClose,
  onSave,
  user,
  courses,
  units,
  assignedUnitIds,
}: TeacherUnitsModalProps) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setSelectedCourseId(courses[0]?.id ?? '');
      setSelectedUnitIds(new Set(assignedUnitIds));
    }
  }, [assignedUnitIds, courses, isOpen]);

  const currentCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const currentCourseUnits = useMemo(
    () => units.filter((unit) => unit.courseId === selectedCourseId),
    [selectedCourseId, units],
  );

  const handleToggleUnit = (unitId: string, checked: boolean) => {
    setSelectedUnitIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (checked) {
        nextIds.add(unitId);
      } else {
        nextIds.delete(unitId);
      }

      return nextIds;
    });
  };

  const handleSave = async () => {
    await onSave(Array.from(selectedUnitIds));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Assign Courses and Units</DialogTitle>
          <DialogDescription>
            Select the curricular units for <strong>{user.fullName || user.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Course</Label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium text-sm text-slate-500">
              Available Units{currentCourse ? ` in ${currentCourse.abbreviation}` : ''}
            </div>
            <ScrollArea className="h-[320px] p-4 bg-white dark:bg-slate-900">
              {currentCourseUnits.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No units found in this course.</div>
              ) : (
                <div className="space-y-3">
                  {currentCourseUnits.map((unit) => {
                    const isAssigned = selectedUnitIds.has(unit.id);

                    return (
                      <div
                        key={unit.id}
                        className="flex items-start space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <Checkbox
                          id={unit.id}
                          checked={isAssigned}
                          onCheckedChange={(checked) => handleToggleUnit(unit.id, Boolean(checked))}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={unit.id}
                            className="text-sm font-medium leading-none cursor-pointer text-slate-900 dark:text-slate-200"
                          >
                            {unit.name}
                          </label>
                          <div className="flex gap-2 text-xs text-slate-500">
                            <Badge variant="outline" className="text-[10px] h-5 px-1 font-normal">
                              Year {unit.year}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-1 font-normal">
                              S{unit.semester}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-1 font-normal">
                              {unit.ects} ECTS
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="text-sm text-slate-500">
            Total units assigned: {selectedUnitIds.size}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
