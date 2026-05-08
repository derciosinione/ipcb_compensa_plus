
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, BookOpen, MapPin, FileText, ChevronRight, GraduationCap } from 'lucide-react';
import { Input } from '../components/ui/input';
import { cn } from '../components/ui/utils';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { useLanguage } from '../providers/LanguageContext';

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'class' | 'request' | 'room';
  subtitle?: string;
}

const mockResults: SearchResult[] = [
  { id: '1', title: 'Software Engineering', type: 'course', subtitle: 'Unit Code: SE101' },
  { id: '2', title: 'Databases I', type: 'course', subtitle: 'Unit Code: DB101' },
  { id: '3', title: '2nd Year - Class A', type: 'class', subtitle: 'Computer Science' },
  { id: '4', title: 'Lab 3', type: 'room', subtitle: 'Computer Lab' },
  { id: '5', title: 'Room 204', type: 'room', subtitle: 'Lecture Hall' },
  { id: '6', title: 'Request #R1', type: 'request', subtitle: 'Pending • Software Engineering' },
];

export const GlobalSearch = ({ onNavigate }: { onNavigate?: (type: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockResults.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) || 
        r.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        r.type.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (onNavigate) {
       if (result.type === 'course') onNavigate('courses');
       if (result.type === 'class') onNavigate('courses');
       if (result.type === 'request') onNavigate('requests');
       if (result.type === 'room') onNavigate('classrooms');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'class': return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case 'request': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'room': return <MapPin className="w-4 h-4 text-red-500" />;
      default: return <Search className="w-4 h-4 text-slate-500" />;
    }
  };

  const groupedResults = {
    course: results.filter(r => r.type === 'course'),
    class: results.filter(r => r.type === 'class'),
    request: results.filter(r => r.type === 'request'),
    room: results.filter(r => r.type === 'room'),
  };

  return (
    <div className="hidden md:flex items-center relative" ref={ref}>
       <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none z-10" />
       <Input 
         type="text" 
         placeholder={t('search.placeholder')}
         value={query}
         onChange={(e) => setQuery(e.target.value)}
         onFocus={() => setIsOpen(true)}
         className="pl-9 pr-4 py-1.5 h-9 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-full w-64 focus:w-96 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 placeholder:text-slate-400 dark:text-slate-200 truncate"
       />
       
       {isOpen && (
         <div className="absolute top-full left-0 w-96 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 z-50">
            {results.length === 0 && query.length > 0 ? (
               <div className="p-4 text-center text-sm text-slate-500">
                  {t('search.no_results').replace('{query}', query)}
               </div>
            ) : results.length === 0 ? (
               <div className="p-2">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('search.shortcuts')}</div>
                  <div className="grid grid-cols-2 gap-1">
                     <button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left" onClick={() => onNavigate?.('courses')}>
                        <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                           <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span className="truncate">{t('menu.courses')}</span>
                     </button>
                     <button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left" onClick={() => onNavigate?.('requests')}>
                        <div className="w-6 h-6 rounded bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                           <FileText className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="truncate">{t('menu.requests')}</span>
                     </button>
                     <button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left" onClick={() => onNavigate?.('classrooms')}>
                        <div className="w-6 h-6 rounded bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                           <MapPin className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <span className="truncate">{t('menu.classrooms')}</span>
                     </button>
                     <button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left" onClick={() => onNavigate?.('courses')}>
                        <div className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                           <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <span className="truncate">{t('menu.courses')}</span>
                     </button>
                  </div>
               </div>
            ) : (
               <ScrollArea className="max-h-[400px]">
                  <div className="p-2 space-y-3">
                     {Object.entries(groupedResults).map(([type, items]) => (
                        items.length > 0 && (
                           <div key={type}>
                              <div className="px-2 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                 {type === 'class' ? 'Classes & Groups' : type + 's'}
                                 <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 rounded text-[9px]">{items.length}</span>
                              </div>
                              <div className="space-y-0.5">
                                 {items.map(result => (
                                    <button
                                       key={result.id}
                                       onClick={() => handleSelect(result)}
                                       className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors text-left"
                                    >
                                       <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-700">
                                          {getIcon(result.type)}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{result.title}</div>
                                          {result.subtitle && <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>}
                                       </div>
                                       <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )
                     ))}
                  </div>
               </ScrollArea>
            )}
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
               <span>{t('search.platform')}</span>
               <div className="flex gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans shadow-sm">Esc</kbd>
                  <span>{t('search.close')}</span>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
