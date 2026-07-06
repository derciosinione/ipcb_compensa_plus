# CLAUDE.md - AI Agent Instructions

## Project Context

This is **Compensa+**, an educational compensation management system built with React, TypeScript, and Tailwind CSS v4. The application helps educational institutions manage teacher compensation requests, class scheduling, and administrative workflows.

## Core Principles

### 1. Component Reusability - CRITICAL
**ALWAYS check `/src/app/components/common/` before creating new UI patterns.**

Available reusable components:
- `EmptyState` - For all empty/placeholder states
- `StatCard` - For all metrics/statistics displays
- `PageHeader` - For all page headers with title/description/actions
- `LoadingSpinner` - For ALL loading states

**Example:**
```typescript
// ❌ DON'T create custom empty states
<div className="flex flex-col items-center justify-center p-12">
  <Icon className="w-10 h-10" />
  <h2>Title</h2>
</div>

// ✅ DO use EmptyState component
<EmptyState icon={Icon} title="Title" description="Description" />
```

### 2. DRY (Don't Repeat Yourself)
- Never duplicate code patterns
- Extract repeated logic into reusable functions
- Use TypeScript interfaces for shared types in `/src/app/components/compensa/data.ts`

### 3. Type Safety
- Use TypeScript strictly - no `any` types
- Define interfaces for all component props
- Use existing types from `data.ts` when applicable

### 4. Styling Conventions
- Use Tailwind CSS v4 classes
- Dark mode support is required: use `dark:` variants
- Use design tokens from `/src/styles/theme.css`
- Never use inline styles unless absolutely necessary

## File Structure

```
src/app/
├── components/
│   ├── common/          # ✅ REUSABLE components - CHECK HERE FIRST
│   │   ├── EmptyState.tsx
│   │   ├── StatCard.tsx
│   │   ├── PageHeader.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts
│   ├── compensa/        # Business logic components
│   │   ├── data.ts      # ✅ Shared types and mock data
│   │   ├── LanguageContext.tsx  # ✅ i18n context
│   │   ├── Layout.tsx   # Main layout wrapper
│   │   ├── Overview.tsx # Dashboard
│   │   ├── TeacherView.tsx
│   │   ├── CoordinatorView.tsx
│   │   ├── CalendarView.tsx
│   │   ├── CoursesView.tsx
│   │   ├── ClassroomsView.tsx
│   │   ├── UsersView.tsx
│   │   ├── NotificationsView.tsx
│   │   ├── AIDocumentConverter.tsx
│   │   ├── AIChatInterface.tsx
│   │   ├── FloatingAIChat.tsx
│   │   └── ...
│   ├── ui/              # shadcn/ui components (DO NOT MODIFY)
│   └── auth/            # Authentication components
├── App.tsx              # Main app component with routing
└── styles/
    ├── theme.css        # Design tokens and CSS variables
    └── fonts.css        # Font imports only
```

## Key Components

### Layout System
- **Layout.tsx** - Sidebar navigation, header, theme toggle
- Uses `SidebarProvider` from shadcn/ui
- Role-based menu items (teacher/coordinator/admin)
- Responsive design with collapsible sidebar

### Internationalization (i18n)
- **LanguageContext.tsx** provides `useLanguage()` hook
- Supported languages: English (en), Portuguese (pt), Spanish (es), French (fr)
- Always use `t('key.path')` for text content
- Never hardcode user-facing strings

**Example:**
```typescript
const { t, language, changeLanguage } = useLanguage();

// ✅ DO
<h1>{t('dashboard.title')}</h1>

// ❌ DON'T
<h1>Dashboard</h1>
```

### State Management
- Local component state with `useState`
- Context for global state (theme, language)
- No external state management library (Redux, Zustand, etc.)

### Routing
- Internal routing via `currentView` state in App.tsx
- Views: dashboard, requests, calendar, courses, classrooms, users, notifications, ai-converter, etc.
- No React Router (by design)

## AI Document Converter Feature

### Architecture
- **AIDocumentConverter.tsx** - Main component with two modes (Upload/Chat)
- **AIChatInterface.tsx** - Reusable chat UI
- **FloatingAIChat.tsx** - Global floating button with modal

### Backend Integration Points
Backend endpoints are **NOT implemented** - frontend is complete, backend is user's responsibility:

```typescript
// Document processing endpoint
POST YOUR_BACKEND_URL/api/ai/process-document
Body: FormData { file: File, prompt: string }
Response: { headers: string[], rows: any[][] }

// Database insert endpoint
POST YOUR_BACKEND_URL/api/database/insert
Body: { headers: string[], rows: any[][] }
Response: { success: boolean, message: string, rowsAffected: number }
```

**Important:** Always remind users to replace `YOUR_BACKEND_URL` with their actual backend.

## Component Creation Guidelines

### 1. Check for Reusable Components First
Before creating ANY new component, check:
1. `/src/app/components/common/` - Reusable UI components
2. `/src/app/components/ui/` - shadcn/ui primitives
3. Existing components in `/src/app/components/compensa/`

### 2. Component Template
```typescript
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface MyComponentProps {
  title: string;
  description?: string;
  className?: string;
}

export function MyComponent({ title, description, className }: MyComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
```

### 3. Props Best Practices
- Use `interface` for props (not `type`)
- Optional props use `?`
- Provide default values in destructuring
- Accept `className` for extensibility
- Use `LucideIcon` type for icon props

### 4. Styling Best Practices
- Use Tailwind utility classes
- Always include dark mode variants
- Use semantic color classes: `text-slate-900 dark:text-slate-100`
- Consistent spacing: `gap-4`, `p-6`, `mb-4`
- Hover/focus states for interactive elements

## Data Layer

The production frontend reads from the backend APIs through `src/app/services`.
Shared presentation types live in `src/app/types`, while API DTOs live beside their service modules.

```typescript
import type { ClassRequest } from '../types/requests';
import { listCompensationRequests } from '../services/compensationRequests/compensationRequestsApi';
```

### Adding New Data Types
1. Define API DTOs beside the relevant service module.
2. Define presentation-only types in `src/app/types` when a UI model differs from the API shape.
3. Map API responses explicitly at page or feature boundaries.
4. Do not add production flows that depend on static mock data.

## Common Patterns

### Empty States
```typescript
import { EmptyState } from '../common';

<EmptyState
  icon={FileText}
  title="No items found"
  description="Get started by creating a new item"
  action={<Button onClick={handleCreate}>Create Item</Button>}
/>
```

### Loading States
```typescript
import { LoadingSpinner } from '../common';

{isLoading ? (
  <LoadingSpinner size="lg" text="Loading data..." />
) : (
  <Content />
)}
```

### Statistics/Metrics
```typescript
import { StatCard } from '../common';

<StatCard
  title="Total Requests"
  value={142}
  icon={FileText}
  trend="+12%"
  trendUp={true}
  iconColor="text-blue-600"
/>
```

### Page Headers
```typescript
import { PageHeader } from '../common';

<PageHeader
  icon={Calendar}
  title="Calendar"
  description="Manage your schedule"
  action={<Button>Add Event</Button>}
/>
```

### Modal Dialogs
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description for accessibility</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Forms with React Hook Form
```typescript
import { useForm } from 'react-hook-form';

const form = useForm<FormData>({
  defaultValues: { name: '', email: '' }
});

const onSubmit = (data: FormData) => {
  console.log(data);
};

<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input {...form.register('name')} />
  <Button type="submit">Submit</Button>
</form>
```

## Error Handling

### React Keys
Always provide unique keys for list items:
```typescript
// ✅ DO - Use unique IDs
data.map(item => <Card key={item.id}>{item.name}</Card>)

// ❌ DON'T - Use index as key
data.map((item, i) => <Card key={i}>{item.name}</Card>)
```

### Accessibility
- Always include `DialogDescription` in dialogs
- Use semantic HTML elements
- Include `aria-label` for icon-only buttons
- Ensure keyboard navigation works

### Toast Notifications
```typescript
import { toast } from 'sonner';

toast.success('Operation successful');
toast.error('Operation failed');
toast.info('Information message');
```

## Performance Considerations

### 1. Avoid Unnecessary Re-renders
```typescript
// ✅ DO - Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);

// ✅ DO - Extract static data
const OPTIONS = [{ value: 'a', label: 'A' }]; // Outside component

// ❌ DON'T - Create new arrays/objects in render
<Select options={[{ value: 'a', label: 'A' }]} />
```

### 2. Code Splitting
Not currently implemented, but could use:
```typescript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

## Testing Considerations

No tests are currently implemented. If adding tests:
- Use React Testing Library
- Test user interactions, not implementation details
- Mock external dependencies (API calls)

## Git Workflow

### Commit Messages
Follow conventional commits:
```
feat: add AI chat floating button
fix: resolve duplicate keys in chart
refactor: extract EmptyState component
docs: update CLAUDE.md with component guidelines
style: fix dark mode colors in StatCard
```

### Branch Naming
- `feature/ai-chat-interface`
- `fix/calendar-timezone-bug`
- `refactor/componentize-empty-states`

## Common Gotchas

### 1. Tailwind v4 Changes
This project uses Tailwind v4, which has different syntax:
- ✅ Use: `@import "tailwindcss"`
- ❌ Don't use: `tailwind.config.js` (not needed in v4)

### 2. Import Paths
- Use relative imports: `'../common'`, `'./components'`
- Don't use path aliases (not configured)

### 3. Recharts Keys
Recharts components need explicit keys:
```typescript
<Bar key="total-bar" dataKey="total" fill="#3b82f6" />
```

### 4. Sonner Import
```typescript
// ✅ Correct
import { Toaster } from 'sonner@2.0.3';
import { toast } from 'sonner';

// ❌ Wrong
import { Toaster } from 'sonner';
```

### 5. Motion Import
```typescript
// ✅ Correct
import { motion, AnimatePresence } from 'motion/react';

// ❌ Wrong
import { motion } from 'framer-motion';
```

## When Making Changes

### Checklist Before Committing
- [ ] Component uses existing common components where applicable
- [ ] TypeScript has no errors (`tsc --noEmit`)
- [ ] Dark mode works correctly
- [ ] i18n keys are used (no hardcoded strings)
- [ ] Unique keys provided for all list items
- [ ] Accessibility requirements met
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] No console errors or warnings

## Questions to Ask Before Implementing

1. **Does this pattern exist already?** → Check `/src/app/components/common/`
2. **Is this a UI primitive?** → Check `/src/app/components/ui/`
3. **Should this be extracted?** → If used 2+ times, extract it
4. **Is this accessible?** → Keyboard navigation, screen readers, ARIA labels
5. **Does this need i18n?** → All user-facing text should use `t()`

## Additional Resources

- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/docs
- **Lucide Icons:** https://lucide.dev/icons
- **Recharts:** https://recharts.org/en-US
- **React Hook Form:** https://react-hook-form.com/docs
- **date-fns:** https://date-fns.org/docs

## Project-Specific Notes

### Theme System
- Uses CSS variables in `/src/styles/theme.css`
- Theme toggle via `ThemeProvider` from `next-themes`
- Supports light/dark modes

### Role-Based Views
- Teacher: See own requests, limited actions
- Coordinator: Approve requests, manage teachers
- Admin: Full system access, user management

### Floating AI Chat
- Available globally via floating action button
- Bottom-right corner of screen
- Opens modal dialog with chat interface
- Persists across all views when authenticated

## Contact & Support

For questions about project architecture or conventions:
1. Read `COMPONENTIZATION_GUIDE.md`
2. Read `PROJECT_OVERVIEW.md`
3. Check existing implementations in codebase

---

**Last Updated:** 2026-05-05
**Version:** 1.0.0
