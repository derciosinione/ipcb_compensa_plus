# Componentization Guide

## Overview
This project has been refactored to follow DRY (Don't Repeat Yourself) principles and improve code reusability. Common UI patterns have been extracted into reusable components.

## Reusable Components

All common components are located in `/src/app/components/common/` and can be imported from the index:

```typescript
import { EmptyState, StatCard, PageHeader, LoadingSpinner } from '../common';
```

### 1. EmptyState

**Purpose:** Display empty/placeholder states with consistent styling.

**Props:**
```typescript
{
  icon: LucideIcon;           // Icon component from lucide-react
  title: string;              // Main heading text
  description: string;        // Descriptive text
  action?: React.ReactNode;   // Optional CTA button/element
  className?: string;         // Additional CSS classes
  iconClassName?: string;     // Icon circle styling
  size?: 'sm' | 'md' | 'lg'; // Component size (default: 'md')
}
```

**Usage:**
```typescript
<EmptyState
  icon={FileText}
  title="No data available"
  description="Upload a document to get started"
  size="md"
/>
```

**Replaced:**
- Duplicate empty state UI in App.tsx (Settings, Profile, Preferences)
- Upload mode preview in AIDocumentConverter
- Any centered icon + title + description pattern

---

### 2. StatCard (formerly KPICard)

**Purpose:** Display key metrics and statistics with consistent styling.

**Props:**
```typescript
{
  title: string;           // Metric label
  value: number | string;  // Metric value
  icon: LucideIcon;        // Icon component
  trend?: string;          // Optional trend text (e.g., "+12%")
  trendUp?: boolean;       // Trend direction (affects color)
  className?: string;      // Additional CSS classes
  iconColor?: string;      // Icon background color
  onClick?: () => void;    // Optional click handler
}
```

**Usage:**
```typescript
<StatCard
  title="Total Requests"
  value={142}
  icon={FileText}
  trend="+12%"
  trendUp={true}
  iconColor="text-blue-600"
/>
```

**Replaced:**
- KPICard in Overview component
- Can replace similar stat displays across the app

---

### 3. PageHeader

**Purpose:** Consistent page headers with title, description, icon, and actions.

**Props:**
```typescript
{
  title: string;              // Page title
  description?: string;       // Optional subtitle
  icon?: LucideIcon;         // Optional icon (displayed in gradient circle)
  action?: React.ReactNode;  // Optional action buttons/elements
  className?: string;        // Additional CSS classes
}
```

**Usage:**
```typescript
<PageHeader
  icon={Sparkles}
  title="AI Document Converter"
  description="Upload and process documents"
  action={<Button>New Request</Button>}
/>
```

**Replaced:**
- Header section in AIDocumentConverter
- Can replace headers in other views

---

### 4. LoadingSpinner

**Purpose:** Consistent loading states throughout the app.

**Props:**
```typescript
{
  size?: 'sm' | 'md' | 'lg'; // Spinner size (default: 'md')
  text?: string;             // Optional loading text
  className?: string;        // Additional CSS classes
  fullScreen?: boolean;      // Full-screen overlay mode
}
```

**Usage:**
```typescript
<LoadingSpinner
  size="lg"
  text="Processing..."
/>

{/* Full-screen loading */}
<LoadingSpinner
  fullScreen
  text="Loading application..."
/>
```

**Replaced:**
- Manual Loader2 + animate-spin patterns
- Loading states in AIDocumentConverter
- Loading state in CompensationChart
- Can replace all loading spinners

---

## Benefits

### Before Componentization

```typescript
// Repeated 3 times in App.tsx
<div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
    <Settings className="w-10 h-10 text-slate-400" />
  </div>
  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">System Settings</h2>
  <p className="text-slate-500 dark:text-slate-400">Global configuration coming soon.</p>
</div>
```

### After Componentization

```typescript
<EmptyState
  icon={Settings}
  title="System Settings"
  description="Global configuration coming soon."
/>
```

**Result:** 80% less code, consistent styling, easier maintenance.

---

## Migration Guide

### Step 1: Identify Patterns

Look for repeated UI patterns:
- Empty states (icon + title + description)
- Stat/metric cards
- Loading spinners
- Page headers

### Step 2: Replace with Common Components

**Before:**
```typescript
<div className="flex flex-col items-center justify-center py-12">
  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  <p className="text-sm text-slate-600 mt-2">Loading...</p>
</div>
```

**After:**
```typescript
<LoadingSpinner size="md" text="Loading..." />
```

### Step 3: Update Imports

Use the common components index:

```typescript
import { EmptyState, StatCard, LoadingSpinner } from '../common';
```

---

## Files Refactored

### Completed ✅
- `/src/app/App.tsx` - Uses EmptyState for Settings, Profile, Preferences
- `/src/app/components/compensa/Overview.tsx` - Uses StatCard (replaced KPICard)
- `/src/app/components/compensa/AIDocumentConverter.tsx` - Uses PageHeader, EmptyState, LoadingSpinner
- `/src/app/components/compensa/CompensationChart.tsx` - Uses LoadingSpinner

### Opportunities for Future Refactoring

1. **TeacherView/CoordinatorView** - Could use StatCard for metrics
2. **CalendarView** - Could use EmptyState for empty calendar states
3. **CoursesView/ClassroomsView** - Could use EmptyState when no items
4. **Modals/Sheets** - Could extract common modal patterns
5. **Form Components** - Could extract common form field patterns

---

## Best Practices

### 1. Consistency
Always use common components for their intended patterns instead of creating new variations.

### 2. Extensibility
Common components accept `className` for additional styling:

```typescript
<EmptyState
  icon={User}
  title="No Users"
  description="Add your first user"
  className="bg-blue-50 border-blue-200"  // Custom styling
/>
```

### 3. Composition
Combine components with action props:

```typescript
<EmptyState
  icon={Plus}
  title="No Courses"
  description="Get started by creating a course"
  action={<Button onClick={handleCreate}>Create Course</Button>}
/>
```

### 4. Type Safety
All components are fully typed. Use TypeScript IntelliSense for prop discovery.

---

## Metrics

### Code Reduction
- **App.tsx:** ~60 lines → ~15 lines (empty states)
- **AIDocumentConverter:** ~30 lines → ~10 lines (header + loading)
- **CompensationChart:** ~8 lines → ~1 line (loading)

### Consistency
- **Before:** 3+ different loading spinner implementations
- **After:** 1 LoadingSpinner component

### Maintainability
- Update styling in one place affects all instances
- Easier to ensure accessibility and responsive design
- Clearer component intent from semantic names

---

## Next Steps

1. Continue identifying repeated patterns across other views
2. Extract form field patterns if needed
3. Create table/list components if patterns emerge
4. Consider extracting modal/dialog wrappers
5. Document any new common components added

---

## Questions?

Refer to the component source files in `/src/app/components/common/` for implementation details and prop types.
