import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ArrowLeft, Monitor, Layers, ArrowRight, Component, GitBranch, MousePointer2, User, UserCog, Shield, CheckCircle2, LayoutDashboard, Calendar as CalendarIcon, FilePlus, FileText, Settings, BarChart } from 'lucide-react';
import { ProjectStoryboard } from './ProjectStoryboard'; // Low-fi
import { SignInPage } from '../auth/SignInPage';
import { Overview } from './Overview';
import { TeacherView } from './TeacherView';
import { CoordinatorView } from './CoordinatorView';
import { Card } from '../ui/card';
import { DesignSystem } from './DesignSystem';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { MockCalendarScreen, MockReportScreen, MockProfileScreen, MockRequestDetailsScreen } from './HighFidelityMocks';

// --- Mock Components for Diagram ---

const NavigabilityDiagram = () => (
    <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 mb-24 overflow-x-auto shadow-sm">
        <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-3">
                <GitBranch className="w-6 h-6" /> Site Map & Information Architecture
            </h3>
            <p className="text-slate-500 mt-2">Hierarchical view of application structure and navigation paths.</p>
        </div>
        
        <div className="relative min-w-[1000px] mx-auto flex flex-col items-center">
             {/* Level 1: Authentication */}
             <div className="flex flex-col items-center relative z-10 mb-16">
                 <div className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl border-4 border-slate-800 text-lg">
                     Login / Authentication
                 </div>
                 <div className="text-xs text-slate-400 mt-2 font-mono">Entry Point</div>
             </div>
             
             {/* Connector 1-2 */}
             <div className="absolute top-16 left-1/2 -translate-x-0.5 w-0.5 h-24 bg-slate-300 dark:bg-slate-700" />
             
             {/* Level 2: Dashboard */}
             <div className="flex flex-col items-center relative z-10 mb-20">
                 <div className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl font-bold shadow-lg border-2 border-slate-900 dark:border-slate-600 text-lg min-w-[240px] text-center">
                     Dashboard (Home)
                 </div>
                 <div className="text-xs text-slate-500 mt-2 font-mono">Central Hub</div>
             </div>
             
             {/* Main Horizontal Branch Line */}
             <div className="absolute top-[230px] left-[10%] right-[10%] h-0.5 bg-slate-300 dark:bg-slate-700" />
             
             {/* Vertical Connectors to Level 3 */}
             <div className="absolute top-[230px] left-[10%] w-0.5 h-12 bg-slate-300 dark:bg-slate-700" /> {/* Calendar */}
             <div className="absolute top-[230px] left-[30%] w-0.5 h-12 bg-slate-300 dark:bg-slate-700" /> {/* Teacher Requests */}
             <div className="absolute top-[230px] left-[50%] w-0.5 h-12 bg-slate-300 dark:bg-slate-700" /> {/* Coordinator */}
             <div className="absolute top-[230px] left-[70%] w-0.5 h-12 bg-slate-300 dark:bg-slate-700" /> {/* Reports */}
             <div className="absolute top-[230px] left-[90%] w-0.5 h-12 bg-slate-300 dark:bg-slate-700" /> {/* Profile */}

             {/* Level 3: Main Modules */}
             <div className="w-full grid grid-cols-5 gap-4 relative z-10 px-8">
                 
                 {/* Module 1: Calendar */}
                 <div className="flex flex-col items-center">
                      <div className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold border border-slate-300 dark:border-slate-600 shadow-sm w-40 text-center mb-6">
                          Calendar
                      </div>
                      {/* Sub-nodes */}
                      <div className="flex flex-col gap-3 w-full items-center relative">
                          <div className="absolute top-[-24px] w-0.5 h-6 bg-slate-200 dark:bg-slate-700" />
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Monthly View</div>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Event Details</div>
                      </div>
                 </div>

                 {/* Module 2: Teacher Requests */}
                 <div className="flex flex-col items-center">
                      <div className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold border border-slate-300 dark:border-slate-600 shadow-sm w-40 text-center mb-6">
                          Requests
                      </div>
                      <div className="flex flex-col gap-3 w-full items-center relative">
                          <div className="absolute top-[-24px] w-0.5 h-6 bg-slate-200 dark:bg-slate-700" />
                          <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs border border-green-200 dark:border-green-800 rounded w-32 text-center font-semibold">New Request +</div>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">My Requests List</div>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Request Details</div>
                      </div>
                 </div>

                 {/* Module 3: Coordinator */}
                 <div className="flex flex-col items-center">
                      <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-bold border border-blue-200 dark:border-blue-800 shadow-sm w-40 text-center mb-6">
                          Coordination
                      </div>
                      <div className="flex flex-col gap-3 w-full items-center relative">
                          <div className="absolute top-[-24px] w-0.5 h-6 bg-blue-200 dark:bg-blue-800" />
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Kanban Board</div>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Approval Flow</div>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">History Log</div>
                      </div>
                 </div>

                 {/* Module 4: Reports */}
                 <div className="flex flex-col items-center">
                      <div className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold border border-slate-300 dark:border-slate-600 shadow-sm w-40 text-center mb-6">
                          Reports
                      </div>
                      <div className="flex flex-col gap-3 w-full items-center relative">
                          <div className="absolute top-[-24px] w-0.5 h-6 bg-slate-200 dark:bg-slate-700" />
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Hours Bank</div>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Export Data</div>
                      </div>
                 </div>

                 {/* Module 5: Profile */}
                 <div className="flex flex-col items-center">
                      <div className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold border border-slate-300 dark:border-slate-600 shadow-sm w-40 text-center mb-6">
                          Settings
                      </div>
                      <div className="flex flex-col gap-3 w-full items-center relative">
                          <div className="absolute top-[-24px] w-0.5 h-6 bg-slate-200 dark:bg-slate-700" />
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">My Profile</div>
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 rounded w-32 text-center">Notifications</div>
                      </div>
                 </div>
             </div>
        </div>
    </div>
);

const BrowserWindow = ({ title, children, scale = 0.5, className }: { title: string, children: React.ReactNode, scale?: number, className?: string }) => (
  <div className={`flex flex-col items-center relative group z-10 ${className}`}>
    <div className="w-[1000px] bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-slate-900/5 transition-transform hover:scale-105 duration-300 origin-top" style={{ transform: `scale(${scale})`, marginBottom: `-${(1 - scale) * 600}px`, transformOrigin: 'top center' }}>
      <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="ml-4 flex-1 bg-white dark:bg-slate-800 rounded-md px-3 py-1 text-[10px] text-slate-500 text-center font-mono">
           compensa.edu/{title.toLowerCase().replace(/\s+/g, '-')}
        </div>
      </div>
      <div className="relative w-full h-[600px] bg-slate-50 dark:bg-slate-950 overflow-hidden group">
        <div className="w-full h-full overflow-hidden pointer-events-none select-none">
           {children}
        </div>
        <div className="absolute inset-0 bg-transparent" /> {/* Interaction shield */}
      </div>
    </div>
    <div className="mt-8 text-center" style={{ marginTop: `${scale * 600 - 550}px` }}>
       <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm inline-block">
         {title}
       </h3>
    </div>
  </div>
);

const JourneyStep = ({ 
    step,
    title, 
    description, 
    children, 
    align = 'left' 
}: { 
    step: string | number,
    title: string, 
    description: string, 
    children: React.ReactNode, 
    align?: 'left' | 'right' 
}) => (
    <div className={`flex flex-col xl:flex-row gap-16 items-center mb-32 ${align === 'right' ? 'xl:flex-row-reverse' : ''}`}>
        <div className="flex-1 space-y-4 min-w-[300px] max-w-lg z-20">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold font-mono shadow-lg shadow-slate-900/20">
                {step}
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
        <div className="flex-1 flex justify-center w-full relative">
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full scale-150" />
            <div className="transform transition-transform duration-500 hover:scale-[1.02]">
                {children}
            </div>
        </div>
    </div>
);

const SectionDivider = ({ title, icon: Icon, colorClass = "bg-slate-900" }: { title: string, icon: any, colorClass?: string }) => (
    <div className="flex items-center gap-4 py-16 w-full max-w-5xl mx-auto">
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        <div className={`flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold uppercase tracking-wider shadow-lg ${colorClass}`}>
            <Icon className="w-5 h-5" />
            {title}
        </div>
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
    </div>
);

export const FullProjectStoryboard = ({ onExit }: { onExit: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onExit} className="gap-2">
               <ArrowLeft className="w-4 h-4" /> Back to App
            </Button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100">Compensa+ Documentation</h1>
         </div>
         
         <div className="flex items-center gap-2">
             <span className="text-xs text-slate-500 font-mono">v1.0.0-RC1</span>
         </div>
      </header>

      <div className="flex-1 p-8 overflow-auto">
        <Tabs defaultValue="hi-fi" className="space-y-8">
           <div className="flex justify-center">
              <TabsList className="grid w-[600px] grid-cols-3">
                 <TabsTrigger value="lo-fi" className="gap-2">
                    <Layers className="w-4 h-4" /> Wireframes
                 </TabsTrigger>
                 <TabsTrigger value="hi-fi" className="gap-2">
                    <Monitor className="w-4 h-4" /> Prototype Flow
                 </TabsTrigger>
                 <TabsTrigger value="design-system" className="gap-2">
                    <Component className="w-4 h-4" /> Components
                 </TabsTrigger>
              </TabsList>
           </div>

           {/* Low Fidelity (Wireframes) */}
           <TabsContent value="lo-fi" className="max-w-full mx-auto">
              <ProjectStoryboard />
           </TabsContent>

           {/* High Fidelity (Prototype Flow) */}
           <TabsContent value="hi-fi" className="w-full">
              <div className="w-full flex flex-col items-center pb-32">
                  <div className="text-center space-y-4 max-w-3xl mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">Interactive Prototype</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                       Comprehensive high-fidelity presentation of key user journeys.
                    </p>
                  </div>
                  
                  <NavigabilityDiagram />

                  {/* 1. Global Entry */}
                  <div className="mb-24">
                     <BrowserWindow title="Authentication" scale={0.7}>
                        <div className="h-full flex items-center justify-center bg-white dark:bg-slate-950">
                           <SignInPage onNavigate={() => {}} onLogin={() => {}} />
                        </div>
                     </BrowserWindow>
                  </div>

                  {/* 2. Teacher Journey */}
                  <SectionDivider title="Teacher Profile (Requester)" icon={User} colorClass="bg-indigo-600" />
                  
                  <div className="max-w-[1600px] w-full px-8">
                      <JourneyStep 
                          step="01" 
                          title="Dashboard Overview" 
                          description="The central hub for teachers to view their hours bank balance, track recent activities, and see upcoming alerts."
                      >
                          <BrowserWindow title="Teacher Dashboard" scale={0.6}>
                              <div className="bg-slate-50 dark:bg-slate-950 p-8 h-full overflow-hidden">
                                 <Overview onNavigate={() => {}} />
                              </div>
                          </BrowserWindow>
                      </JourneyStep>

                      <JourneyStep 
                          step="02" 
                          align="right"
                          title="Schedule Management" 
                          description="Teachers consult the academic calendar to check for holidays, events, or available slots for replacement classes."
                      >
                          <BrowserWindow title="Calendar View" scale={0.6}>
                              <MockCalendarScreen />
                          </BrowserWindow>
                      </JourneyStep>

                      <JourneyStep 
                          step="03" 
                          title="Compensation Request" 
                          description="A streamlined process to request class replacements or allowance, with integrated conflict checking."
                      >
                          <BrowserWindow title="My Requests" scale={0.6}>
                              <div className="bg-slate-50 dark:bg-slate-950 p-8 h-full overflow-hidden">
                                 <TeacherView />
                              </div>
                          </BrowserWindow>
                      </JourneyStep>

                      <JourneyStep 
                          step="04" 
                          align="right"
                          title="Profile & Settings" 
                          description="Managing personal information, notification preferences, and account security."
                      >
                          <BrowserWindow title="User Settings" scale={0.6}>
                              <MockProfileScreen />
                          </BrowserWindow>
                      </JourneyStep>
                  </div>

                  {/* 3. Coordinator Journey */}
                  <SectionDivider title="Coordinator Profile (Approver)" icon={UserCog} colorClass="bg-slate-900" />

                  <div className="max-w-[1600px] w-full px-8">
                      <JourneyStep 
                          step="01" 
                          title="Kanban Management" 
                          description="Coordinators use a drag-and-drop board to efficiently manage incoming requests across different statuses."
                      >
                          <BrowserWindow title="Coordinator View" scale={0.6}>
                              <div className="bg-slate-50 dark:bg-slate-900 p-8 h-full overflow-hidden">
                                 <CoordinatorView userRole="coordinator" />
                              </div>
                          </BrowserWindow>
                      </JourneyStep>

                      <JourneyStep 
                          step="02" 
                          align="right"
                          title="Detailed Review" 
                          description="Deep dive into specific requests to view justifications, attachments, and discussion history before approval."
                      >
                          <BrowserWindow title="Request Details" scale={0.6}>
                              <MockRequestDetailsScreen />
                          </BrowserWindow>
                      </JourneyStep>

                      <JourneyStep 
                          step="03" 
                          title="Analytics & Reporting" 
                          description="Generating comprehensive reports on faculty hours banks, compliance status, and department metrics."
                      >
                          <BrowserWindow title="Reports Dashboard" scale={0.6}>
                              <MockReportScreen />
                          </BrowserWindow>
                      </JourneyStep>
                  </div>
              </div>
           </TabsContent>

            {/* Design System & Components */}
           <TabsContent value="design-system">
              <DesignSystem />
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
