import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import type { CreateUserRequest, UserRole } from '../../../services/users/userTypes';

interface AddUserModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  roles: UserRole[];
  onClose: () => void;
  onSave: (user: CreateUserRequest) => Promise<void> | void;
}

interface FormData {
  fullName: string;
  email: string;
}

export const AddUserModal = ({
  isOpen,
  isSaving = false,
  roles,
  onClose,
  onSave,
}: AddUserModalProps) => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['Teacher']);

  useEffect(() => {
    if (isOpen) {
      reset({ fullName: '', email: '' });
      setSelectedRoles(['Teacher']);
    }
  }, [isOpen, reset]);

  const handleRoleToggle = (role: UserRole, checked: boolean) => {
    setSelectedRoles((currentRoles) => {
      if (checked) {
        return Array.from(new Set([...currentRoles, role]));
      }

      const nextRoles = currentRoles.filter((currentRole) => currentRole !== role);
      return nextRoles.length > 0 ? nextRoles : currentRoles;
    });
  };

  const onSubmit = async (data: FormData) => {
    await onSave({
      fullName: data.fullName,
      email: data.email,
      roles: selectedRoles,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a platform user and assign one or more roles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. Dr. Jane Smith"
              {...register('fullName', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. jane.smith@uni.edu"
              {...register('email', { required: true })}
            />
          </div>

          <div className="space-y-3">
            <Label>Roles</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roles.map((role) => {
                const checked = selectedRoles.includes(role);

                return (
                  <label
                    key={role}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => handleRoleToggle(role, Boolean(value))}
                      />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{role}</span>
                    </div>
                    {checked && <Badge variant="secondary">Selected</Badge>}
                  </label>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
