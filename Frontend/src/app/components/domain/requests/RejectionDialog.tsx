import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export const RejectionDialog = ({ open, onOpenChange, onConfirm }: RejectionDialogProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Reject Request</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this request. This will be visible to the teacher.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
            <Label htmlFor="reason" className="mb-2 block text-sm font-medium">Rejection Reason</Label>
            <Textarea 
                id="reason" 
                placeholder="E.g., Room conflict, Policy violation..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={!reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirm Rejection
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
