# Development Guidelines

## Table of Contents
1. [Code Style](#code-style)
2. [Component Guidelines](#component-guidelines)
3. [TypeScript Best Practices](#typescript-best-practices)
4. [Styling Conventions](#styling-conventions)
5. [State Management](#state-management)
6. [Performance](#performance)
7. [Accessibility](#accessibility)
8. [Testing Strategy](#testing-strategy)
9. [Git Workflow](#git-workflow)
10. [Common Patterns](#common-patterns)

---

## Code Style

### General Principles
- **DRY (Don't Repeat Yourself)** - Extract reusable logic
- **KISS (Keep It Simple, Stupid)** - Avoid over-engineering
- **YAGNI (You Aren't Gonna Need It)** - Don't add unused features
- **Single Responsibility** - One component, one purpose

### File Organization
```
ComponentName.tsx         # Component implementation
ComponentName.test.tsx    # Unit tests (if applicable)
ComponentName.stories.tsx # Storybook stories (if applicable)
types.ts                  # Shared types
utils.ts                  # Utility functions
constants.ts              # Constants
```

### Import Order
```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// 2. UI components
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

// 3. Common components
import { EmptyState, LoadingSpinner } from '../common';

// 4. Business components
import { RequestForm } from './RequestForm';

// 5. Utilities and types
import { cn } from '../ui/utils';
import { User, Request } from './data';

// 6. Icons
import { Plus, Edit, Trash } from 'lucide-react';

// 7. Styles (if any)
import './styles.css';
```

### Naming Conventions

#### Components
```typescript
// PascalCase for components
export function UserProfile() {}
export function RequestList() {}
export function AIDocumentConverter() {}
```

#### Functions
```typescript
// camelCase for functions
const handleClick = () => {};
const fetchUserData = async () => {};
const validateForm = (data: FormData) => {};
```

#### Constants
```typescript
// UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PAGE_SIZE = 20;
```

#### Types/Interfaces
```typescript
// PascalCase for types and interfaces
interface UserProfile {}
type RequestStatus = 'pending' | 'approved' | 'rejected';
```

#### Boolean Variables
```typescript
// Use descriptive prefixes
const isLoading = true;
const hasPermission = false;
const canEdit = true;
const shouldShowModal = false;
```

---

## Component Guidelines

### Component Structure Template
```typescript
import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

// 1. Props Interface
interface MyComponentProps {
  // Required props first
  title: string;
  data: DataType[];
  
  // Optional props after
  description?: string;
  onAction?: () => void;
  
  // Styling props last
  className?: string;
}

// 2. Component Definition
export function MyComponent({
  title,
  data,
  description,
  onAction,
  className
}: MyComponentProps) {
  // 3. Hooks (in order)
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  // 4. Derived state / memoized values
  const itemCount = data.length;
  
  // 5. Event handlers
  const handleClick = () => {
    setIsOpen(true);
    onAction?.();
  };
  
  // 6. Effects (if any)
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 7. Early returns for loading/error states
  if (data.length === 0) {
    return <EmptyState icon={FileText} title="No data" description="..." />;
  }
  
  // 8. Main render
  return (
    <div className={cn('base-classes', className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Props Best Practices

#### ✅ DO
```typescript
interface GoodProps {
  // Use descriptive names
  userName: string;
  isActive: boolean;
  
  // Use specific types
  status: 'pending' | 'approved' | 'rejected';
  
  // Provide optional callback types
  onSubmit?: (data: FormData) => void;
  
  // Accept className for extensibility
  className?: string;
  
  // Use union types for variants
  variant?: 'primary' | 'secondary' | 'danger';
}
```

#### ❌ DON'T
```typescript
interface BadProps {
  // Too generic
  data: any;
  
  // Unclear purpose
  flag: boolean;
  
  // Missing type information
  callback: Function;
  
  // Inflexible (can't extend styling)
  color: string; // Instead use className or variant
}
```

### Component Size Guidelines
- **Small:** < 100 lines - Single purpose, minimal logic
- **Medium:** 100-300 lines - Multiple related features
- **Large:** > 300 lines - Consider splitting into sub-components

**Rule of Thumb:** If you need to scroll to see the entire component, consider refactoring.

---

## TypeScript Best Practices

### Type Safety

#### ✅ DO
```typescript
// Explicit types for function parameters
function processUser(user: User): void {
  console.log(user.name);
}

// Type inference for simple variables
const count = 10; // TypeScript infers number

// Specific union types
type Status = 'idle' | 'loading' | 'success' | 'error';

// Interface for object shapes
interface ApiResponse {
  data: User[];
  total: number;
  page: number;
}
```

#### ❌ DON'T
```typescript
// Avoid 'any'
function process(data: any) {} // NO!

// Don't use 'object' type
function handle(obj: object) {} // Too generic

// Don't ignore TypeScript errors
// @ts-ignore
const value = dangerousOperation(); // NO!
```

### Utility Types
```typescript
// Partial - Make all properties optional
type PartialUser = Partial<User>;

// Pick - Select specific properties
type UserBasic = Pick<User, 'id' | 'name' | 'email'>;

// Omit - Exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Required - Make all properties required
type RequiredConfig = Required<Config>;

// Record - Create object type with specific key/value types
type UserRoles = Record<string, UserRole>;
```

### Type Guards
```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

// Usage
if (isUser(data)) {
  console.log(data.name); // TypeScript knows data is User
}
```

---

## Styling Conventions

### Tailwind CSS Best Practices

#### Component Styling
```typescript
// ✅ DO - Use cn() for conditional classes
<div className={cn(
  'base-classes',
  'text-slate-900 dark:text-slate-100',
  isActive && 'bg-blue-50',
  className
)}>

// ❌ DON'T - String concatenation
<div className={`base-classes ${isActive ? 'active' : ''} ${className}`}>
```

#### Responsive Design
```typescript
// Mobile-first approach
<div className="
  w-full          // Mobile (default)
  md:w-1/2        // Tablet
  lg:w-1/3        // Desktop
  xl:w-1/4        // Large desktop
">
```

#### Dark Mode
```typescript
// Always include dark mode variants
<div className="
  bg-white dark:bg-slate-900
  text-slate-900 dark:text-slate-100
  border-slate-200 dark:border-slate-800
">
```

### Color Guidelines

#### Semantic Colors
```typescript
// Success
'text-green-600 dark:text-green-400'
'bg-green-50 dark:bg-green-900/20'

// Warning
'text-amber-600 dark:text-amber-400'
'bg-amber-50 dark:bg-amber-900/20'

// Error
'text-red-600 dark:text-red-400'
'bg-red-50 dark:bg-red-900/20'

// Info
'text-blue-600 dark:text-blue-400'
'bg-blue-50 dark:bg-blue-900/20'
```

#### Text Colors
```typescript
// Primary text
'text-slate-900 dark:text-slate-100'

// Secondary text
'text-slate-600 dark:text-slate-400'

// Muted text
'text-slate-500 dark:text-slate-500'
```

### Spacing Scale
```
gap-2  = 0.5rem  (8px)
gap-4  = 1rem    (16px)
gap-6  = 1.5rem  (24px)
p-4    = 1rem    (16px)
p-6    = 1.5rem  (24px)
mb-4   = 1rem    (16px)
```

---

## State Management

### Local State (useState)
```typescript
// ✅ DO - Simple, isolated state
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// ❌ DON'T - Too many useState calls
// Consider useReducer or object state instead
const [field1, setField1] = useState('');
const [field2, setField2] = useState('');
// ... 10 more fields
```

### Complex State (useReducer)
```typescript
type State = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: User[] | null;
  error: string | null;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, status: 'success', data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}

// Usage
const [state, dispatch] = useReducer(reducer, initialState);
```

### Context API
```typescript
// ✅ DO - Use for truly global state
// - Theme (light/dark)
// - Language preference
// - Current user
// - Authentication state

// ❌ DON'T - Use for component-level state
// - Form field values
// - Modal open/close
// - Temporary UI state
```

### State Updates
```typescript
// ✅ DO - Immutable updates
setUser({ ...user, name: 'New Name' });
setItems([...items, newItem]);

// ❌ DON'T - Mutate state directly
user.name = 'New Name';  // NO!
items.push(newItem);     // NO!
```

---

## Performance

### Memoization

#### useMemo
```typescript
// ✅ DO - Expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// ❌ DON'T - Simple operations
const doubled = useMemo(() => count * 2, [count]); // Unnecessary
```

#### useCallback
```typescript
// ✅ DO - Callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ DON'T - Callbacks not passed to children
const handleChange = useCallback(
  (e) => setValue(e.target.value),
  []
); // Unnecessary if not passed down
```

### List Rendering
```typescript
// ✅ DO - Use unique IDs as keys
{items.map(item => (
  <Card key={item.id}>{item.name}</Card>
))}

// ⚠️ CAUTION - Index as key (only if list never changes)
{items.map((item, index) => (
  <Card key={index}>{item.name}</Card>
))}

// ❌ DON'T - Random or non-stable keys
{items.map(item => (
  <Card key={Math.random()}>{item.name}</Card>
))}
```

### Code Splitting (Future)
```typescript
// Lazy load heavy components
const HeavyChart = React.lazy(() => import('./HeavyChart'));

// Use Suspense for loading state
<Suspense fallback={<LoadingSpinner />}>
  <HeavyChart />
</Suspense>
```

---

## Accessibility

### Semantic HTML
```typescript
// ✅ DO - Use semantic elements
<header>
  <nav>
    <button onClick={handleClick}>Submit</button>
  </nav>
</header>

// ❌ DON'T - Use divs for everything
<div className="header">
  <div className="nav">
    <div onClick={handleClick}>Submit</div>
  </div>
</div>
```

### ARIA Labels
```typescript
// Icon-only buttons need labels
<button aria-label="Delete item">
  <Trash className="w-4 h-4" />
</button>

// Images need alt text
<img src="photo.jpg" alt="User profile photo" />

// Skip to content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to content
</a>
```

### Keyboard Navigation
```typescript
// ✅ DO - Support keyboard interactions
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Button
</div>

// Better: Use actual button
<button onClick={handleClick}>
  Real Button
</button>
```

### Focus Management
```typescript
// Manage focus for modals
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// Restore focus on close
const handleClose = () => {
  setIsOpen(false);
  triggerRef.current?.focus();
};
```

---

## Testing Strategy

### Unit Tests (Future Implementation)
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests (Future)
```typescript
// Test user workflows
it('submits compensation request', async () => {
  render(<RequestForm />);
  
  fireEvent.change(screen.getByLabelText('Date'), {
    target: { value: '2026-05-10' }
  });
  
  fireEvent.click(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(screen.getByText('Request submitted')).toBeInTheDocument();
  });
});
```

---

## Git Workflow

### Branch Naming
```bash
feature/add-ai-chat          # New feature
fix/calendar-timezone-bug    # Bug fix
refactor/extract-components  # Code refactoring
docs/update-readme           # Documentation
style/fix-dark-mode-colors   # Visual changes
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add floating AI chat button
fix: resolve duplicate keys in compensation chart
refactor: extract EmptyState component
docs: update development guidelines
style: improve dark mode contrast
perf: optimize calendar rendering
test: add unit tests for RequestForm
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] No console errors
- [ ] Dark mode works
- [ ] Responsive design verified
- [ ] i18n keys used

## Screenshots
(if applicable)
```

---

## Common Patterns

### Async Data Fetching
```typescript
const [data, setData] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchData();
}, []);

// Render
if (isLoading) return <LoadingSpinner />;
if (error) return <div>Error: {error}</div>;
return <div>{/* Render data */}</div>;
```

### Form Handling
```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
}

function MyForm() {
  const form = useForm<FormData>();
  
  const onSubmit = (data: FormData) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('name', { required: true })} />
      {form.formState.errors.name && <span>Required</span>}
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Modal Pattern
```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <Button onClick={() => setIsOpen(true)}>
      Open Modal
    </Button>
    
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  </>
);
```

### Toast Notifications
```typescript
import { toast } from 'sonner';

// Success
toast.success('Operation completed successfully');

// Error
toast.error('An error occurred');

// Info
toast.info('Here is some information');

// Promise (auto-handles loading/success/error)
toast.promise(
  fetchData(),
  {
    loading: 'Loading...',
    success: 'Data loaded!',
    error: 'Failed to load data',
  }
);
```

---

## Checklist Before Committing

- [ ] Code compiles without TypeScript errors
- [ ] No console errors or warnings in browser
- [ ] Dark mode works correctly
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] Unique keys for all list items
- [ ] Accessibility requirements met
- [ ] Reusable components used where applicable
- [ ] No duplicate code patterns
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0
