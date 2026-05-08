import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, MoreHorizontal, GraduationCap, ShieldCheck, UserPlus, BookOpen, Upload } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { cn } from '../../components/ui/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import { mockTeachers, User, mockUnits, CurricularUnit } from '../../mocks/data';
import { AddUserModal } from './components/AddUserModal';
import { TeacherUnitsModal } from './components/TeacherUnitsModal';
import { BulkImportUsersSheet } from './components/BulkImportUsersSheet';
import { useLanguage } from '../../providers/LanguageContext';
import { toast } from 'sonner@2.0.3';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockTeachers);
  const [units, setUnits] = useState<CurricularUnit[]>(mockUnits); // For TeacherUnitsModal
  const { t } = useLanguage();

  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAssignUnitsOpen, setIsAssignUnitsOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | undefined>(undefined);

  const totalUserPages = Math.ceil(users.length / userPageSize);
  const paginatedUsers = users.slice((userPage - 1) * userPageSize, userPage * userPageSize);

  const handleAddUser = (userData: Omit<User, 'id'>) => {
      const newUser: User = {
          ...userData,
          id: `u_${Date.now()}`
      };
      setUsers(prev => [...prev, newUser]);
  };

  const handleBulkImport = (newUsers: Omit<User, 'id'>[]) => {
      const usersToAdd = newUsers.map((user, index) => ({
          ...user,
          id: `u_imported_${Date.now()}_${index}`
      }));
      
      setUsers(prev => [...prev, ...usersToAdd]);
      toast.success(`Successfully imported ${newUsers.length} users.`);
  };

  const handleOpenAssignUnits = (user: User) => {
      if (user.role !== 'teacher') return;
      setSelectedTeacher(user);
      setIsAssignUnitsOpen(true);
  };

  const handleSaveUnitAssignments = (updates: { unitId: string, assigned: boolean }[]) => {
      if (!selectedTeacher) return;

      setUnits(prevUnits => prevUnits.map(unit => {
          const update = updates.find(u => u.unitId === unit.id);
          if (!update) return unit;

          const currentTeacherIds = new Set(unit.teacherIds);
          if (update.assigned) {
              currentTeacherIds.add(selectedTeacher.id);
          } else {
              currentTeacherIds.delete(selectedTeacher.id);
          }

          return {
              ...unit,
              teacherIds: Array.from(currentTeacherIds)
          };
      }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <AddUserModal 
        isOpen={isAddUserOpen} 
        onClose={() => setIsAddUserOpen(false)} 
        onSave={handleAddUser} 
      />

      <TeacherUnitsModal 
        isOpen={isAssignUnitsOpen}
        onClose={() => setIsAssignUnitsOpen(false)}
        onSave={handleSaveUnitAssignments}
        teacher={selectedTeacher}
        allUnits={units}
      />

      <BulkImportUsersSheet
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onImport={handleBulkImport}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('users.title')}</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('users.subtitle')}</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkImportOpen(true)} className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
               <Upload className="w-4 h-4 mr-2" /> Bulk Import
            </Button>
            <Button onClick={() => setIsAddUserOpen(true)} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                <UserPlus className="w-4 h-4 mr-2" /> {t('actions.add_user')}
            </Button>
         </div>
      </div>

       <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder={t('users.search')} className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-200 dark:placeholder:text-slate-500" />
             </div>
             <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                <Filter className="w-4 h-4 mr-2" /> {t('actions.filter')}
             </Button>
          </div>
       </div>
       
       <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
         <Table>
           <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
             <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
               <TableHead className="pl-6 text-slate-500 dark:text-slate-400">{t('users.name')}</TableHead>
               <TableHead className="text-slate-500 dark:text-slate-400">{t('users.email')}</TableHead>
               <TableHead className="text-slate-500 dark:text-slate-400">{t('users.role')}</TableHead>
               <TableHead className="text-right pr-6 text-slate-500 dark:text-slate-400">{t('actions.actions')}</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {paginatedUsers.map((user) => (
               <TableRow key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800 transition-colors">
                 <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-9 w-9 border border-white dark:border-slate-800 shadow-sm">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-200">{user.name}</p>
                       </div>
                    </div>
                 </TableCell>
                 <TableCell className="text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                 <TableCell>
                    <Badge variant="secondary" className={cn("flex w-fit items-center gap-1 border capitalize",
                        user.role === 'teacher' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30" :
                        user.role === 'coordinator' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30" :
                        "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-900/30"
                    )}>
                       {user.role === 'teacher' && <GraduationCap className="w-3 h-3" />}
                       {user.role === 'coordinator' && <ShieldCheck className="w-3 h-3" />}
                       {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                       {user.role === 'teacher' ? t('role.teacher') : user.role === 'coordinator' ? t('role.coordinator') : t('role.admin')}
                    </Badge>
                 </TableCell>
                 <TableCell className="text-right pr-6">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                             <MoreHorizontal className="w-4 h-4" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-xl dark:bg-slate-900 dark:border-slate-800">
                          <DropdownMenuItem className="dark:text-slate-300 dark:focus:bg-slate-800">{t('actions.edit_details')}</DropdownMenuItem>
                          {user.role === 'teacher' && (
                            <DropdownMenuItem onClick={() => handleOpenAssignUnits(user)} className="dark:text-slate-300 dark:focus:bg-slate-800">
                                <BookOpen className="w-4 h-4 mr-2" /> {t('actions.assign_units')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 dark:focus:bg-red-900/20">{t('actions.deactivate')}</DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
         
         {totalUserPages > 1 && (
            <div className="py-4 border-t border-slate-100 dark:border-slate-800">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                className={cn("cursor-pointer", userPage === 1 && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(p => (
                            <PaginationItem key={p}>
                                <PaginationLink isActive={userPage === p} onClick={() => setUserPage(p)} className="cursor-pointer">
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext 
                                onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                                className={cn("cursor-pointer", userPage === totalUserPages && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
         )}
       </Card>
    </div>
  );
};
