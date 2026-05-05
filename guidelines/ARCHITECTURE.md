# Technical Architecture

## System Overview

Compensa+ is a single-page application (SPA) built with React and TypeScript, utilizing modern web technologies for a responsive, accessible, and maintainable educational management system.

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
│  ┌───────────────────────────────────────────────┐  │
│  │           React Application (SPA)             │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Components + State + Routing           │  │  │
│  │  │  - Tailwind CSS for styling             │  │  │
│  │  │  - TypeScript for type safety           │  │  │
│  │  │  - Context API for global state         │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS/REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend Server (To Implement)           │
│  ┌───────────────────────────────────────────────┐  │
│  │  API Endpoints                                │  │
│  │  - /api/ai/process-document                  │  │
│  │  - /api/database/insert                      │  │
│  │  - /api/auth/*                               │  │
│  │  - /api/requests/*                           │  │
│  │  - /api/users/*                              │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Business Logic Layer                        │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL/MySQL/MongoDB)         │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           External Services (Optional)               │
│  - AI/ML Service (OpenAI, Anthropic Claude)         │
│  - File Storage (S3, Cloudinary)                    │
│  - Email Service (SendGrid, AWS SES)                │
│  - Analytics (Google Analytics, Mixpanel)           │
└─────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

#### Core
- **React 18.3.1** - UI library with concurrent features
- **TypeScript 5.x** - Static typing and enhanced DX
- **Vite 6.3.5** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework

#### UI Framework
- **shadcn/ui** - Accessible component library built on Radix UI
- **Radix UI** - Headless, accessible UI primitives
- **Lucide React** - Icon library (500+ icons)
- **Motion** - Animation library (formerly Framer Motion)

#### State & Data
- **React Context API** - Global state (theme, language, user)
- **React Hooks** - Local state management
- **date-fns** - Date manipulation and formatting
- **React Hook Form** - Form state and validation

#### Additional Libraries
- **Recharts** - Chart and data visualization
- **Sonner** - Toast notifications
- **React DnD** - Drag and drop interactions
- **next-themes** - Theme management (light/dark)

### Directory Structure

```
src/
├── app/
│   ├── components/
│   │   ├── common/                   # ✅ Reusable components
│   │   │   ├── EmptyState.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ...
│   │   │
│   │   ├── compensa/                 # Business components
│   │   │   ├── data.ts               # Types & mock data
│   │   │   ├── LanguageContext.tsx   # i18n provider
│   │   │   ├── Layout.tsx            # Main layout
│   │   │   ├── Overview.tsx          # Dashboard
│   │   │   ├── TeacherView.tsx
│   │   │   ├── CoordinatorView.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── CoursesView.tsx
│   │   │   ├── ClassroomsView.tsx
│   │   │   ├── UsersView.tsx
│   │   │   ├── NotificationsView.tsx
│   │   │   ├── AIDocumentConverter.tsx
│   │   │   ├── AIChatInterface.tsx
│   │   │   ├── FloatingAIChat.tsx
│   │   │   └── ...
│   │   │
│   │   └── auth/                     # Authentication
│   │       ├── SignInPage.tsx
│   │       └── SignUpPage.tsx
│   │
│   ├── App.tsx                       # Root component
│   │
│   └── styles/
│       ├── theme.css                 # Design tokens
│       └── fonts.css                 # Font imports
│
├── imports/                          # Figma imports (SVGs, assets)
├── public/                           # Static assets
└── index.html                        # HTML entry point
```

### Component Architecture

#### Component Hierarchy
```
App
├── ThemeProvider
│   └── LanguageProvider
│       ├── SignInPage (unauthenticated)
│       ├── SignUpPage (unauthenticated)
│       └── Layout (authenticated)
│           ├── Sidebar
│           │   ├── Logo
│           │   ├── Navigation Menu
│           │   │   ├── Main Items
│           │   │   └── Admin Items
│           │   └── User Dropdown
│           │       ├── Profile
│           │       ├── Settings
│           │       ├── Language Selector
│           │       ├── Theme Toggle
│           │       └── Logout
│           │
│           └── SidebarInset (Main Content)
│               ├── Header
│               │   ├── Sidebar Trigger
│               │   ├── Breadcrumbs
│               │   ├── Global Search
│               │   └── Notifications
│               │
│               └── Content Area (Dynamic View)
│                   ├── Overview (dashboard)
│                   ├── TeacherView
│                   ├── CoordinatorView
│                   ├── CalendarView
│                   ├── CoursesView
│                   ├── ClassroomsView
│                   ├── UsersView
│                   ├── NotificationsView
│                   └── AIDocumentConverter
│
└── FloatingAIChat (Global Overlay)
    └── Dialog
        └── AIChatInterface
```

### State Management

#### Global State (Context)
```typescript
// Theme Context (from next-themes)
interface ThemeContext {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: string) => void;
}

// Language Context (custom)
interface LanguageContext {
  language: 'en' | 'pt' | 'es' | 'fr';
  changeLanguage: (lang: string) => void;
  t: (key: string) => string; // Translation function
}

// User Context (implicit via App state)
interface UserContext {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
}
```

#### Local State Patterns
```typescript
// UI State
const [isOpen, setIsOpen] = useState(false);
const [currentView, setCurrentView] = useState('dashboard');

// Data State
const [users, setUsers] = useState<User[]>([]);
const [requests, setRequests] = useState<Request[]>([]);

// Async State
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Form State (React Hook Form)
const form = useForm<FormData>();
```

### Routing System

#### Internal State-Based Routing
```typescript
// App.tsx
const [currentView, setCurrentView] = useState('dashboard');

// Layout.tsx - Navigation
<SidebarMenuButton onClick={() => setCurrentView('calendar')}>
  Calendar
</SidebarMenuButton>

// App.tsx - Content Rendering
const renderContent = () => {
  switch (currentView) {
    case 'dashboard': return <Overview />;
    case 'calendar': return <CalendarView />;
    case 'courses': return <CoursesView />;
    // ... etc
  }
};
```

**Why no React Router?**
- Simpler implementation for this SPA
- No URL requirements specified
- Easier to manage view transitions
- Can be added later if needed

### Data Flow

#### Unidirectional Data Flow
```
User Action (Click, Type, Submit)
        ↓
Event Handler (onClick, onChange, onSubmit)
        ↓
State Update (setState, dispatch)
        ↓
API Call (optional - fetch, axios)
        ↓
State Update (with response data)
        ↓
Component Re-render
        ↓
UI Update
```

#### Example: Submit Request
```typescript
// 1. User clicks submit
<Button onClick={handleSubmit}>Submit</Button>

// 2. Event handler
const handleSubmit = async () => {
  setIsLoading(true);
  
  // 3. API call
  try {
    const response = await fetch('/api/requests', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    // 4. State update
    setRequests([...requests, data]);
    toast.success('Request submitted');
    
  } catch (error) {
    toast.error('Failed to submit request');
  } finally {
    setIsLoading(false);
  }
};

// 5. UI re-renders with new data
```

### Design System

#### Theme Architecture
```css
/* theme.css - CSS Variables */
:root {
  /* Colors */
  --color-primary: 59 130 246;        /* Blue */
  --color-success: 16 185 129;        /* Green */
  --color-warning: 245 158 11;        /* Amber */
  --color-error: 239 68 68;           /* Red */
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
}

/* Dark mode overrides */
.dark {
  --color-bg: 15 23 42;               /* slate-900 */
  --color-text: 248 250 252;          /* slate-50 */
}
```

#### Component Variants
```typescript
// Using class-variance-authority (CVA)
const buttonVariants = cva(
  'rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-slate-300 hover:bg-slate-50',
        ghost: 'hover:bg-slate-100',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
```

### Internationalization (i18n)

#### Translation Structure
```typescript
// LanguageContext.tsx
const translations = {
  en: {
    'dashboard.title': 'Dashboard',
    'dashboard.total_requests': 'Total Requests',
    'menu.calendar': 'Calendar',
    // ... 200+ keys
  },
  pt: {
    'dashboard.title': 'Painel',
    'dashboard.total_requests': 'Total de Pedidos',
    'menu.calendar': 'Calendário',
    // ...
  },
  es: { /* Spanish */ },
  fr: { /* French */ },
};

// Translation function
const t = (key: string): string => {
  return translations[language][key] || key;
};
```

#### Usage Pattern
```typescript
// Component
const { t } = useLanguage();

return (
  <div>
    <h1>{t('dashboard.title')}</h1>
    <p>{t('dashboard.description')}</p>
  </div>
);
```

### Performance Optimization

#### Current Optimizations
1. **Component Reusability** - Reduced bundle size via DRY
2. **Lazy Image Loading** - `ImageWithFallback` component
3. **Memoized Callbacks** - `useCallback` for event handlers
4. **Memoized Values** - `useMemo` for computed data
5. **Debounced Inputs** - Search and filter inputs

#### Future Optimizations
1. **Code Splitting** - Route-based lazy loading
2. **Virtual Lists** - For large data sets (react-window)
3. **Service Worker** - Offline support and caching
4. **Image Optimization** - WebP format, responsive images
5. **Bundle Analysis** - Identify large dependencies

### Build & Deployment

#### Build Process
```bash
# Development
pnpm install
pnpm run dev        # Starts Vite dev server on port 5173

# Production
pnpm run build      # Builds to /dist folder
pnpm run preview    # Preview production build locally
```

#### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js       # Main bundle
│   ├── index-[hash].css      # Compiled styles
│   └── vendor-[hash].js      # Third-party libs
├── index.html                # Entry HTML
└── vite.svg                  # Favicon
```

#### Deployment Targets
- **Static Hosting** - Vercel, Netlify, GitHub Pages
- **CDN** - CloudFront, Cloudflare
- **Traditional** - Apache, Nginx

## Backend Architecture (To Implement)

### Required Endpoints

#### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
POST   /api/auth/refresh-token
GET    /api/auth/me
```

#### Users
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

#### Requests
```
GET    /api/requests
GET    /api/requests/:id
POST   /api/requests
PUT    /api/requests/:id
DELETE /api/requests/:id
PATCH  /api/requests/:id/approve
PATCH  /api/requests/:id/reject
```

#### Courses
```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
```

#### AI Processing
```
POST   /api/ai/process-document
POST   /api/database/insert
```

### Database Schema (Suggested)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'teacher', 'coordinator', 'admin'
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Requests
CREATE TABLE requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'pending', 'approved', 'rejected'
  course_id UUID REFERENCES courses(id),
  classroom_id UUID REFERENCES classrooms(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  credits INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY,
  building VARCHAR(100) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  type VARCHAR(50), -- 'class', 'holiday', 'meeting'
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Architecture

### Frontend Security
- **XSS Prevention** - React escapes by default
- **CSRF Protection** - Token-based (backend)
- **Input Validation** - React Hook Form + Zod
- **Secure Storage** - No sensitive data in localStorage

### Backend Security (To Implement)
- **Authentication** - JWT tokens
- **Authorization** - Role-based access control
- **Rate Limiting** - Prevent abuse
- **SQL Injection** - Parameterized queries
- **File Upload** - Type and size validation

## Monitoring & Analytics (Future)

### Error Tracking
- **Sentry** - Frontend error monitoring
- **LogRocket** - Session replay
- **Console warnings** - Development only

### Analytics
- **Google Analytics** - User behavior
- **Mixpanel** - Event tracking
- **Custom metrics** - Business KPIs

## Scalability Considerations

### Current Limitations
- Client-side only (no server rendering)
- No caching strategy
- No CDN integration
- Mock data only

### Scaling Strategies
1. **Server-Side Rendering (SSR)** - Next.js migration
2. **API Caching** - Redis, CDN caching
3. **Database Optimization** - Indexes, query optimization
4. **Horizontal Scaling** - Load balancers, multiple servers
5. **Microservices** - Separate auth, AI, data services

## Testing Architecture (Future)

### Testing Pyramid
```
         /\
        /E2E\         Cypress, Playwright (5%)
       /------\
      /  INT   \      Integration tests (15%)
     /----------\
    /   UNIT     \    Unit tests (80%)
   /--------------\
```

### Test Stack (Proposed)
- **Vitest** - Unit testing (Vite-compatible)
- **React Testing Library** - Component testing
- **Cypress/Playwright** - E2E testing
- **MSW** - API mocking

## CI/CD Pipeline (Future)

```
GitHub Push
    ↓
GitHub Actions
    ├─ Lint (ESLint)
    ├─ Type Check (tsc)
    ├─ Test (Vitest)
    └─ Build (Vite)
        ↓
    Success?
        ↓
    Deploy to Vercel/Netlify
        ↓
    Notify Team (Slack/Email)
```

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0
