# Compensa+ 🎓

> Modern Educational Compensation Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646cff)](https://vitejs.dev/)

Compensa+ is a comprehensive web application designed to streamline teacher compensation requests, class scheduling, and administrative workflows for educational institutions.

## ✨ Features

### 🤖 AI-Powered Document Processing
- **Upload Mode:** Drag-and-drop interface with AI-powered data extraction
- **Chat Mode:** Conversational AI for natural language document processing
- **Floating Assistant:** Global access to AI features from any page
- Supports PDF, Word, Excel, CSV, and text files

### 📋 Request Management
- Submit and track compensation requests
- Approval workflows for coordinators
- Real-time status updates
- Bulk operations and filtering

### 📅 Calendar & Scheduling
- Personal and department calendars
- Holiday and event management
- Conflict detection
- Multi-view layouts (day, week, month)

### 🎓 Academic Management
- Course catalog and management
- Classroom inventory
- Teacher assignments
- Student enrollment tracking

### 👥 User Management
- Role-based access control (Teacher, Coordinator, Admin)
- Bulk user import from Excel/CSV
- User profiles and permissions
- Department organization

### 📊 Dashboard & Analytics
- Real-time KPI metrics
- Compensation trends visualization
- Weekly calendar overview
- Quick stats and insights

### 🌐 Internationalization
- 🇺🇸 English
- 🇵🇹 Portuguese
- 🇪🇸 Spanish
- 🇫🇷 French

### 🎨 Modern UI/UX
- Light and dark mode
- Responsive design (mobile, tablet, desktop)
- Accessible components (WCAG 2.1)
- Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+ (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/compensa-plus.git
cd compensa-plus

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
pnpm run build

# Preview production build
pnpm run preview
```

## 📁 Project Structure

```
compensa-plus/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── common/          # Reusable components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── compensa/        # Business components
│   │   │   └── auth/            # Authentication
│   │   ├── styles/              # Global styles
│   │   └── App.tsx              # Root component
│   ├── imports/                 # Figma imports
│   └── public/                  # Static assets
├── docs/                        # Documentation
├── CLAUDE.md                    # AI agent instructions
├── PROJECT_OVERVIEW.md          # Project overview
├── DEVELOPMENT_GUIDELINES.md    # Development standards
├── ARCHITECTURE.md              # Technical architecture
├── COMPONENTIZATION_GUIDE.md    # Component reusability
└── README.md                    # This file
```

## 🛠️ Technology Stack

### Core
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite 6.3** - Build tool
- **Tailwind CSS v4** - Styling

### UI Components
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Lucide Icons** - Icon system
- **Motion** - Animations

### Key Libraries
- **date-fns** - Date utilities
- **React Hook Form** - Forms
- **Recharts** - Data visualization
- **Sonner** - Notifications
- **React DnD** - Drag & drop

## 📖 Documentation

Comprehensive documentation is available:

### For Developers
- **[CLAUDE.md](./CLAUDE.md)** - AI agent instructions and conventions
- **[DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)** - Code style and best practices
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and system design
- **[COMPONENTIZATION_GUIDE.md](./COMPONENTIZATION_GUIDE.md)** - Component reusability guide

### For Product/Business
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Product vision, features, and roadmap

### For Backend Implementation
- **[AI_BACKEND_IMPLEMENTATION.md](./AI_BACKEND_IMPLEMENTATION.md)** - Backend API specifications

## 🎯 Key Concepts

### Component Reusability
This project follows DRY principles with reusable components in `/src/app/components/common/`:

```typescript
// Always check common components first!
import { EmptyState, StatCard, PageHeader, LoadingSpinner } from '../common';

// Empty states
<EmptyState icon={FileText} title="No data" description="Get started" />

// Statistics
<StatCard title="Total" value={142} icon={FileText} trend="+12%" />

// Page headers
<PageHeader icon={Calendar} title="Calendar" action={<Button>New</Button>} />

// Loading states
<LoadingSpinner size="lg" text="Loading..." />
```

### Internationalization
All user-facing text uses i18n:

```typescript
const { t } = useLanguage();

return <h1>{t('dashboard.title')}</h1>;
```

### Theme Support
Built-in light/dark mode:

```typescript
// Tailwind classes with dark variants
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
```

## 🔧 Configuration

### Environment Variables
Currently frontend-only, no environment variables required.

### Backend Integration
The AI features require backend implementation. See [AI_BACKEND_IMPLEMENTATION.md](./AI_BACKEND_IMPLEMENTATION.md) for API specifications.

Update backend URLs in:
- `src/app/components/compensa/AIDocumentConverter.tsx`
- `src/app/components/compensa/AIChatInterface.tsx`

Replace `YOUR_BACKEND_URL` with your actual backend URL.

## 👥 User Roles

### Teacher
- View and submit compensation requests
- Access personal calendar
- View assigned courses

### Coordinator
- Approve/reject requests
- Manage department schedules
- Assign teachers to courses
- View departmental analytics

### Administrator
- Full system access
- User management
- System configuration
- Global calendar management

## 🧪 Testing

Testing framework not yet implemented. Recommended stack:

```bash
# Unit tests (future)
pnpm run test

# E2E tests (future)
pnpm run test:e2e
```

See [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md#testing-strategy) for testing approach.

## 📦 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Deploy
netlify deploy --prod
```

### Manual Deployment
```bash
# Build
pnpm run build

# Upload /dist folder to your hosting provider
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Read the docs** - Familiarize yourself with [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)
2. **Check existing components** - Use common components from `/src/app/components/common/`
3. **Follow conventions** - TypeScript, i18n, dark mode support
4. **Write clean code** - DRY, KISS, YAGNI principles
5. **Test thoroughly** - No console errors, responsive design
6. **Update documentation** - Keep docs in sync with changes

### Pull Request Process
1. Create feature branch (`feature/amazing-feature`)
2. Make your changes
3. Test thoroughly (all browsers, dark mode, responsive)
4. Update documentation if needed
5. Submit PR with clear description

## 🐛 Known Issues

- [ ] No backend implementation (frontend only)
- [ ] No real authentication (mock login)
- [ ] No data persistence (mock data)
- [ ] No URL routing (state-based)
- [ ] AI endpoints need implementation

See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md#known-limitations) for complete list.

## 🗺️ Roadmap

### Phase 1: Backend Integration (Q2 2026)
- [ ] Authentication API
- [ ] Database integration
- [ ] File upload service
- [ ] Email notifications

### Phase 2: Advanced Features (Q3 2026)
- [ ] Analytics dashboard
- [ ] Export to Excel/PDF
- [ ] Workflow automation
- [ ] Mobile app

### Phase 3: AI Enhancement (Q4 2026)
- [ ] Smart scheduling
- [ ] Predictive analytics
- [ ] NLP search
- [ ] Auto-reports

See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md#future-roadmap) for detailed roadmap.

## 📄 License

[Your License Here] - See LICENSE file for details

## 🙏 Acknowledgments

- **shadcn** - For the amazing UI component library
- **Vercel** - For Tailwind CSS and hosting
- **Radix UI** - For accessible primitives
- **Lucide** - For beautiful icons
- **Anthropic** - For AI capabilities

## 📞 Support

- **Documentation:** Check `/docs` folder and markdown files
- **Issues:** [GitHub Issues](https://github.com/yourusername/compensa-plus/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/compensa-plus/discussions)
- **Email:** your.email@example.com

## 🌟 Screenshots

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### AI Document Converter
![AI Converter](./docs/screenshots/ai-converter.png)

### Calendar View
![Calendar](./docs/screenshots/calendar.png)

### Dark Mode
![Dark Mode](./docs/screenshots/dark-mode.png)

---

**Made with ❤️ for educational institutions**

**Version:** 1.0.0  
**Last Updated:** May 5, 2026  
**Status:** ✅ Active Development
