import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '../../../components/ui/select';
import { User, UserRole } from '../../../mocks/data';
import { toast } from 'sonner@2.0.3';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>) => void;
}

interface FormData {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export const AddUserModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: AddUserModalProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        email: '',
        role: 'teacher',
        avatarUrl: ''
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormData) => {
    const userData: Omit<User, 'id'> = {
      name: data.name,
      email: data.email,
      role: data.role,
      avatarUrl: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
    };

    onSave(userData);
    onClose();
    toast.success("User created successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account for the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Dr. Jane Smith" 
              {...register('name', { required: true })} 
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

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
                onValueChange={(val) => setValue('role', val as UserRole)} 
                defaultValue="teacher"
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
