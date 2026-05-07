import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Building2, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../components/ui/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import { Room, mockRooms, User } from '../../mocks/data';

interface ClassroomsPageProps {
  user: User;
}

export const ClassroomsPage = ({ user }: ClassroomsPageProps) => {
  const rooms: Room[] = mockRooms;
  const [roomPage, setRoomPage] = useState(1);
  const roomPageSize = 6;

  const totalRoomPages = Math.ceil(rooms.length / roomPageSize);
  const paginatedRooms = rooms.slice((roomPage - 1) * roomPageSize, roomPage * roomPageSize);

  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Classrooms Management</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage physical spaces and their resources.</p>
         </div>
         {isAdmin && (
           <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Add Classroom
           </Button>
         )}
      </div>

      <div className="flex justify-between items-center">
         <div className="relative w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search classrooms..." className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-200 dark:placeholder:text-slate-500" />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRooms.map((room, i) => (
             <Card key={i} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
                <div className={cn("h-2 w-full", room.type === 'PC Lab' ? "bg-blue-500" : room.type === 'Amphitheater' ? "bg-purple-500" : "bg-green-500")} />
                <CardHeader className="pb-3">
                   <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                         <Building2 className="w-5 h-5 text-slate-400" />
                         {room.name}
                      </CardTitle>
                      <Badge variant='secondary' className={cn(
                         "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}>
                         Active
                      </Badge>
                   </div>
                   <CardDescription className="text-slate-500 dark:text-slate-400">{room.type} • {room.capacity} Seats</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="flex flex-wrap gap-2 mt-2">
                      {room.features.map((r, idx) => (
                         <span key={idx} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {r}
                         </span>
                      ))}
                   </div>
                   {isAdmin && (
                     <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <Button variant="ghost" size="sm" className="w-full text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">Edit</Button>
                        <Button variant="ghost" size="sm" className="w-full text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</Button>
                     </div>
                   )}
                </CardContent>
             </Card>
          ))}
      </div>

      {totalRoomPages > 1 && (
          <div className="py-4">
              <Pagination>
                  <PaginationContent>
                      <PaginationItem>
                          <PaginationPrevious 
                              onClick={() => setRoomPage(p => Math.max(1, p - 1))}
                              className={cn("cursor-pointer", roomPage === 1 && "pointer-events-none opacity-50")}
                          />
                      </PaginationItem>
                      {Array.from({ length: totalRoomPages }, (_, i) => i + 1).map(p => (
                          <PaginationItem key={p}>
                              <PaginationLink isActive={roomPage === p} onClick={() => setRoomPage(p)} className="cursor-pointer">
                                  {p}
                              </PaginationLink>
                          </PaginationItem>
                      ))}
                      <PaginationItem>
                          <PaginationNext 
                              onClick={() => setRoomPage(p => Math.min(totalRoomPages, p + 1))}
                              className={cn("cursor-pointer", roomPage === totalRoomPages && "pointer-events-none opacity-50")}
                          />
                      </PaginationItem>
                  </PaginationContent>
              </Pagination>
          </div>
       )}
    </div>
  );
};
