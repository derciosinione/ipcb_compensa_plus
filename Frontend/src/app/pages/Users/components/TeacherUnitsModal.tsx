import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
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
import { Course, CurricularUnit, mockCourses, User } from '../../../mocks/data';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../../../components/ui/badge';

interface TeacherUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignments: { unitId: string, assigned: boolean }[]) => void;
  teacher?: User;
  allUnits: CurricularUnit[];
}

export const TeacherUnitsModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  teacher,
  allUnits
}: TeacherUnitsModalProps) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(mockCourses[0]?.id || '');
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());

  // Reset state when modal opens or teacher changes
  useEffect(() => {
    if (isOpen && teacher) {
      // Find all units where this teacher is currently assigned
      const currentAssignments = new Set(
        allUnits
          .filter(u => u.teacherIds.includes(teacher.id))
          .map(u => u.id)
      );
      setSelectedUnitIds(currentAssignments);
    }
  }, [isOpen, teacher, allUnits]);

  const handleToggleUnit = (unitId: string, checked: boolean) => {
    const newSet = new Set(selectedUnitIds);
    if (checked) {
      newSet.add(unitId);
    } else {
      newSet.delete(unitId);
    }
    setSelectedUnitIds(newSet);
  };

  const handleSave = () => {
    // Determine changes
    // We send back ALL units for the selected course (or all units changed?)
    // Actually simpler: we just iterate over all units we know about or just the ones in the selected course?
    // If we only show one course, we might accidentally unset units in other courses if we just send a full list.
    // The onSave callback expects a list of changes or the full new state.
    // Let's send a list of ALL units and their desired state (assigned or not) for the *current* selection set.
    
    // Better: Send a list of { unitId, assigned } for ALL units, because the Set contains the truth for everything.
    const updates = allUnits.map(u => ({
        unitId: u.id,
        assigned: selectedUnitIds.has(u.id)
    }));

    onSave(updates);
    onClose();
    toast.success(`Updated unit assignments for ${teacher?.name}`);
  };

  if (!teacher) return null;

  const currentCourseUnits = allUnits.filter(u => u.courseId === selectedCourseId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Assign Units to Teacher</DialogTitle>
          <DialogDescription>
            Select the curricular units for <strong>{teacher.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Course</Label>
            <Select 
                value={selectedCourseId} 
                onValueChange={setSelectedCourseId}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                    {mockCourses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.name} ({course.abbreviation})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
             <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium text-sm text-slate-500">
                Available Units in {mockCourses.find(c => c.id === selectedCourseId)?.abbreviation}
             </div>
             <ScrollArea className="h-[300px] p-4 bg-white dark:bg-slate-900">
                {currentCourseUnits.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">No units found in this course.</div>
                ) : (
                    <div className="space-y-3">
                        {currentCourseUnits.map(unit => {
                            const isAssigned = selectedUnitIds.has(unit.id);
                            return (
                                <div key={unit.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors">
                                    <Checkbox 
                                        id={unit.id} 
                                        checked={isAssigned}
                                        onCheckedChange={(checked) => handleToggleUnit(unit.id, checked as boolean)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={unit.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
