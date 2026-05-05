import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Check, AlertCircle, Bell, User, Calendar } from 'lucide-react';

export const DesignSystem = () => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">Design System & Components</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
           A comprehensive guide to the atomic components, typography, and color palette used in Compensa+.
        </p>
      </div>

      {/* 1. Color Palette */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">1. Color Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
           {/* Primary Blues */}
           <div className="space-y-2">
              <div className="h-20 rounded-lg bg-blue-500 shadow-sm ring-1 ring-black/5"></div>
              <div className="text-xs font-mono">
                 <div className="font-bold">Primary</div>
                 <div className="text-slate-500">blue-500</div>
              </div>
           </div>
           <div className="space-y-2">
              <div className="h-20 rounded-lg bg-blue-600 shadow-sm ring-1 ring-black/5"></div>
              <div className="text-xs font-mono">
                 <div className="font-bold">Primary Hover</div>
                 <div className="text-slate-500">blue-600</div>
              </div>
           </div>
           <div className="space-y-2">
              <div className="h-20 rounded-lg bg-blue-50 shadow-sm ring-1 ring-black/5"></div>
              <div className="text-xs font-mono">
                 <div className="font-bold">Background Accent</div>
                 <div className="text-slate-500">blue-50</div>
              </div>
           </div>
           
           {/* Neutrals */}
           <div className="space-y-2">
              <div className="h-20 rounded-lg bg-slate-900 shadow-sm ring-1 ring-black/5"></div>
              <div className="text-xs font-mono">
                 <div className="font-bold">Foreground</div>
                 <div className="text-slate-500">slate-900</div>
              </div>
           </div>
           <div className="space-y-2">
              <div className="h-20 rounded-lg bg-slate-500 shadow-sm ring-1 ring-black/5"></div>
              <div className="text-xs font-mono">
                 <div className="font-bold">Muted Text</div>
                 <div className="text-slate-500">slate-500</div>
              </div>
           </div>
           <div className="space-y-2">
              <div className="h-20 rounded-lg bg-slate-100 shadow-sm ring-1 ring-black/5"></div>
              <div className="text-xs font-mono">
                 <div className="font-bold">Background Muted</div>
                 <div className="text-slate-500">slate-100</div>
              </div>
           </div>
        </div>
      </section>

      {/* 2. Typography */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">2. Typography</h3>
        <div className="space-y-4 border rounded-xl p-6 bg-white dark:bg-slate-950">
           <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
              <span className="text-xs font-mono text-slate-400">Heading 1</span>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">The quick brown fox</h1>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
              <span className="text-xs font-mono text-slate-400">Heading 2</span>
              <h2 className="text-3xl font-semibold tracking-tight first:mt-0">The quick brown fox</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
              <span className="text-xs font-mono text-slate-400">Heading 3</span>
              <h3 className="text-2xl font-semibold tracking-tight">The quick brown fox</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
              <span className="text-xs font-mono text-slate-400">Body</span>
              <p className="leading-7 [&:not(:first-child)]:mt-6">
                 The quick brown fox jumps over the lazy dog. Compensa+ uses a system font stack for optimal performance and native feel across all devices.
              </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
              <span className="text-xs font-mono text-slate-400">Small / Mono</span>
              <p className="text-sm font-medium leading-none font-mono text-slate-500">v1.0.2 - Build 2024</p>
           </div>
        </div>
      </section>

      {/* 3. Interface Components */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">3. Interface Components</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Buttons */}
           <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Buttons & Actions</h4>
              <div className="flex flex-wrap gap-4 p-6 border rounded-xl bg-white dark:bg-slate-950 items-center">
                 <Button>Primary Button</Button>
                 <Button variant="secondary">Secondary</Button>
                 <Button variant="outline">Outline</Button>
                 <Button variant="ghost">Ghost</Button>
                 <Button variant="destructive">Destructive</Button>
                 <Button size="icon" variant="outline"><Bell className="w-4 h-4" /></Button>
              </div>
           </div>

           {/* Form Elements */}
           <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Input Fields</h4>
              <div className="space-y-4 p-6 border rounded-xl bg-white dark:bg-slate-950">
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input type="email" id="email" placeholder="name@example.com" />
                 </div>
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="date">Date Selection</Label>
                    <div className="relative">
                        <Input type="text" id="date" placeholder="Select date" className="pl-10" />
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Cards */}
           <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Containers (Cards)</h4>
              <Card className="w-full max-w-md">
                 <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                    <CardDescription>Key metrics for current semester.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-slate-400 text-sm italic">
                       Content Area
                    </div>
                 </CardContent>
                 <CardFooter className="flex justify-between">
                    <Button variant="ghost">Dismiss</Button>
                    <Button>View Details</Button>
                 </CardFooter>
              </Card>
           </div>

           {/* Badges & Status */}
           <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Status Indicators</h4>
              <div className="flex flex-col gap-4 p-6 border rounded-xl bg-white dark:bg-slate-950">
                 <div className="flex gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
                       <AlertCircle className="w-4 h-4" />
                       <span>Information alert with details.</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-100">
                       <Check className="w-4 h-4" />
                       <span>Success confirmation message.</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
