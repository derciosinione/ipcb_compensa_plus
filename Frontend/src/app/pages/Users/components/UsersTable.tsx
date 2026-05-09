import { BookOpen, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { cn } from '../../../components/ui/utils';
import type { PlatformUser } from '../../../services/users/userTypes';
import { getUserInitials, UserRoleBadges } from '../userPresentation';

interface UsersTableLabels {
  actions: string;
  assignUnits: string;
  deactivate: string;
  editDetails: string;
  email: string;
  name: string;
  role: string;
}

interface UsersTableProps {
  assignmentCounts: Map<string, number>;
  currentPage: number;
  isLoading: boolean;
  labels: UsersTableLabels;
  onAssignUnits: (user: PlatformUser) => void;
  onPageChange: (page: number) => void;
  totalPages: number;
  users: PlatformUser[];
}

export const UsersTable = ({
  assignmentCounts,
  currentPage,
  isLoading,
  labels,
  onAssignUnits,
  onPageChange,
  totalPages,
  users,
}: UsersTableProps) => (
  <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
    <Table>
      <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
          <TableHead className="pl-6 text-slate-500 dark:text-slate-400">{labels.name}</TableHead>
          <TableHead className="text-slate-500 dark:text-slate-400">{labels.email}</TableHead>
          <TableHead className="text-slate-500 dark:text-slate-400">{labels.role}</TableHead>
          <TableHead className="text-slate-500 dark:text-slate-400">Units</TableHead>
          <TableHead className="text-right pr-6 text-slate-500 dark:text-slate-400">{labels.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-slate-500">
              Loading users...
            </TableCell>
          </TableRow>
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-slate-500">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const canAssignUnits = user.roles.includes('Teacher');

            return (
              <TableRow key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800 transition-colors">
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white dark:border-slate-800 shadow-sm">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.email)}&background=random`} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{user.fullName || user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                <TableCell>
                  <UserRoleBadges roles={user.roles} />
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {assignmentCounts.get(user.id) ?? 0}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl dark:bg-slate-900 dark:border-slate-800">
                      <DropdownMenuItem className="dark:text-slate-300 dark:focus:bg-slate-800">{labels.editDetails}</DropdownMenuItem>
                      {canAssignUnits && (
                        <DropdownMenuItem onClick={() => onAssignUnits(user)} className="dark:text-slate-300 dark:focus:bg-slate-800">
                          <BookOpen className="w-4 h-4 mr-2" /> {labels.assignUnits}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600 dark:text-red-400 dark:focus:bg-red-900/20">{labels.deactivate}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>

    {totalPages > 1 && (
      <div className="py-4 border-t border-slate-100 dark:border-slate-800">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={cn('cursor-pointer', currentPage === 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink isActive={currentPage === page} onClick={() => onPageChange(page)} className="cursor-pointer">
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={cn('cursor-pointer', currentPage === totalPages && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )}
  </Card>
);
