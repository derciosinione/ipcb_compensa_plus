# Compensa+ - Project Overview

## Executive Summary

**Compensa+** is a comprehensive educational compensation management system designed to streamline teacher compensation requests, class scheduling, and administrative workflows for educational institutions. Built with modern web technologies, it provides an intuitive interface for teachers, coordinators, and administrators to manage workload compensation efficiently.

## Product Vision

Transform the way educational institutions handle teacher compensation by providing:
- **Transparency** - Clear visibility into compensation requests and approvals
- **Efficiency** - Streamlined workflows replacing manual processes
- **Intelligence** - AI-powered document processing for data extraction
- **Accessibility** - Multi-language support and responsive design

## Target Users

### 1. Teachers
- Submit compensation requests for extra classes
- Track request status (pending, approved, rejected)
- View their teaching schedule and calendar
- Manage assigned courses and classrooms

### 2. Coordinators
- Review and approve/reject compensation requests
- Manage department schedules and resources
- Assign teachers to courses and classes
- Monitor departmental metrics

### 3. Administrators
- Full system access and configuration
- User management (create, edit, delete users)
- System-wide calendar and holiday management
- Analytics and reporting

## Core Features

### 📋 Request Management
- Create compensation requests with detailed information
- Attach supporting documents
- Real-time status tracking
- Bulk request processing
- Approval workflows with notifications

### 📅 Calendar & Scheduling
- Personal calendar view for teachers
- Department-wide calendar for coordinators
- System calendar with holidays and events
- Conflict detection for class scheduling
- Export calendar events

### 🎓 Course & Classroom Management
- Course catalog with curricular units
- Classroom inventory and availability
- Teacher assignment to courses
- Class capacity and resource tracking
- Course details and prerequisites

### 👥 User Management
- Role-based access control (Teacher, Coordinator, Admin)
- User profiles with contact information
- Bulk user import from Excel/CSV
- User activity tracking
- Department organization

### 📊 Dashboard & Analytics
- KPI cards (Total Requests, Pending, Compensated, etc.)
- Compensation trends chart by month/year
- Weekly calendar overview
- Upcoming events and deadlines
- Quick stats and metrics

### 🤖 AI Document Converter
**The star feature** - Powered by AI to revolutionize document processing:

#### Upload Mode
- Drag-and-drop document upload
- AI instruction input (natural language)
- Real-time processing with AI
- Table preview of extracted data
- Save to database with one click

#### Chat Mode
- Conversational AI interface
- Multi-turn conversations
- File attachments in chat
- Inline data previews
- Context-aware responses

#### Floating AI Assistant
- Global access from any page
- Floating action button (bottom-right)
- Modal dialog interface
- Persistent across navigation
- Quick access to AI features

**Supported Document Types:**
- PDF, Word (DOC/DOCX)
- Excel (XLSX), CSV
- Text files (TXT)

**Use Cases:**
- Extract student rosters from PDFs
- Parse attendance records
- Convert spreadsheets to database entries
- Extract financial data from reports
- Process enrollment documents

### 🌐 Internationalization
Fully translated interface supporting:
- 🇺🇸 English
- 🇵🇹 Portuguese
- 🇪🇸 Spanish
- 🇫🇷 French

Language switcher in user dropdown menu.

### 🎨 Theme System
- Light mode (default)
- Dark mode
- System preference detection
- Persistent theme selection
- Smooth transitions

## Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite 6.3.5** - Build tool
- **Motion (Framer Motion)** - Animations

### UI Components
- **shadcn/ui** - Accessible component library
- **Radix UI** - Headless primitives
- **Lucide Icons** - Icon system
- **Recharts** - Data visualization

### Key Libraries
- **date-fns** - Date manipulation
- **React Hook Form** - Form handling
- **Sonner** - Toast notifications
- **next-themes** - Theme management
- **react-dnd** - Drag and drop

### Backend Integration (User-Implemented)
- **AI Processing Endpoint** - Document → structured data
- **Database API** - CRUD operations
- **Authentication** - User management
- **File Storage** - Document uploads

## Architecture

### Component Structure

```
┌─────────────────────────────────────────┐
│           App.tsx (Router)              │
│  ┌───────────────────────────────────┐  │
│  │  ThemeProvider                    │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  LanguageProvider           │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Layout (Sidebar)     │  │  │  │
│  │  │  │  ┌─────────────────┐  │  │  │  │
│  │  │  │  │  Current View   │  │  │  │  │
│  │  │  │  │  - Overview     │  │  │  │  │
│  │  │  │  │  - Requests     │  │  │  │  │
│  │  │  │  │  - Calendar     │  │  │  │  │
│  │  │  │  │  - etc.         │  │  │  │  │
│  │  │  │  └─────────────────┘  │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  FloatingAIChat (Global)          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### State Management
- **Component State** - `useState`, `useReducer`
- **Context API** - Theme, Language, User
- **No Redux/Zustand** - Keeping it simple

### Routing
- **Internal State-Based** - No React Router
- `currentView` state determines active component
- URL-based routing not implemented (by design)

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Call (Backend) ←→ AI Service (External)
    ↓
State Update
    ↓
UI Re-render
    ↓
Toast Notification
```

## Design System

### Color Palette
**Primary:** Blue gradient (from-blue-500 to-purple-600)
**Semantic Colors:**
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)
- Info: Blue (#3b82f6)

### Typography
- **Headings:** Bold, slate-900 (dark: slate-100)
- **Body:** Regular, slate-600 (dark: slate-400)
- **Captions:** Small, slate-500 (dark: slate-500)

### Spacing Scale
- XS: 0.5rem (2px)
- SM: 0.75rem (3px)
- Base: 1rem (4px)
- MD: 1.5rem (6px)
- LG: 2rem (8px)
- XL: 3rem (12px)

### Components
All components follow these principles:
1. **Composable** - Built from smaller pieces
2. **Accessible** - ARIA labels, keyboard navigation
3. **Responsive** - Mobile-first design
4. **Themeable** - Support light/dark modes
5. **Reusable** - See `/components/common/`

## User Workflows

### Teacher: Submit Compensation Request
1. Navigate to "My Requests"
2. Click "New Request"
3. Fill form (date, reason, hours, class details)
4. Attach supporting documents (optional)
5. Submit for approval
6. Track status in requests list
7. Receive notification on status change

### Coordinator: Approve Requests
1. Navigate to "Requests" (see all departmental requests)
2. Filter by status (pending, approved, rejected)
3. Review request details
4. Approve or reject with notes
5. Teacher receives notification
6. Request appears in dashboard metrics

### Admin: Manage Users
1. Navigate to "Users"
2. View all system users
3. Create new user (form or bulk import)
4. Edit user details (role, department, contact)
5. Deactivate/delete users
6. Export user list

### AI Document Processing
1. Click floating AI button (or go to AI Converter)
2. Upload document
3. Provide instructions ("Extract student names and grades")
4. AI processes document
5. Review extracted table
6. Confirm and save to database
7. Data available in system immediately

## Security Considerations

### Authentication (To Be Implemented)
- User login with email/password
- Session management
- Password reset flow
- Multi-factor authentication (optional)

### Authorization
- Role-based access control (RBAC)
- Teachers: Own requests only
- Coordinators: Department data
- Admins: Full system access

### Data Protection
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure API communication (HTTPS)
- File upload validation

### Best Practices
- No sensitive data in frontend state
- API keys stored in backend only
- Audit logging for critical actions
- Regular security updates

## Performance

### Current Optimizations
- Code splitting potential (not implemented)
- Image optimization via `ImageWithFallback`
- Lazy loading for heavy components
- Debounced search inputs
- Memoized callbacks and values

### Metrics
- **Initial Load:** < 2s (estimated)
- **Time to Interactive:** < 3s (estimated)
- **Bundle Size:** ~500KB (gzipped, estimated)

### Opportunities
- Implement React.lazy for route-based code splitting
- Add service worker for offline support
- Implement virtualization for long lists
- Add request caching layer

## Deployment

### Build Process
```bash
pnpm install
pnpm run build
```

Generates optimized production build in `/dist`

### Environment Variables
None currently required (frontend-only)

Backend URL configured in code:
```typescript
const API_BASE_URL = 'YOUR_BACKEND_URL';
```

### Hosting Options
- **Vercel** - Recommended for React apps
- **Netlify** - Good alternative
- **AWS S3 + CloudFront** - Scalable
- **Traditional hosting** - Apache/Nginx

## Browser Support

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Not Supported
- Internet Explorer (deprecated)
- Opera Mini
- UC Browser

## Accessibility (a11y)

### WCAG 2.1 Compliance
- Level AA target
- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast
- Focus indicators
- ARIA labels where needed

### Features
- Semantic HTML
- Skip navigation links
- Alt text for images
- Form labels and hints
- Error messages
- Toast notifications with proper roles

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2026)
- [ ] Backend API implementation
- [ ] Real authentication system
- [ ] Database integration
- [ ] File upload to cloud storage
- [ ] Email notifications

### Phase 2: Advanced Features (Q3 2026)
- [ ] Advanced analytics dashboard
- [ ] Export to Excel/PDF
- [ ] Automated approval workflows
- [ ] Integration with university systems
- [ ] Mobile app (React Native)

### Phase 3: AI & Automation (Q4 2026)
- [ ] Smart scheduling suggestions
- [ ] Conflict detection AI
- [ ] Predictive analytics
- [ ] Natural language search
- [ ] Automated report generation

### Phase 4: Enterprise (2027)
- [ ] Multi-tenant support
- [ ] Advanced permissions system
- [ ] API for third-party integrations
- [ ] Audit logging and compliance
- [ ] White-label customization

## Known Limitations

### Current Constraints
1. **No Backend** - Frontend only, requires backend implementation
2. **Mock Data** - All data is hardcoded/mocked
3. **No Persistence** - Data doesn't save between sessions
4. **No URL Routing** - Internal state-based routing only
5. **No Real AI** - AI endpoints need implementation
6. **No Authentication** - Mock login system

### Technical Debt
1. Extract more reusable patterns
2. Add comprehensive testing
3. Implement proper error boundaries
4. Add loading states for all async operations
5. Improve TypeScript strictness

## Success Metrics (Proposed)

### User Adoption
- Daily active users
- Feature usage rates
- Time spent in application
- User satisfaction score (NPS)

### Efficiency
- Average request processing time
- Reduction in manual data entry
- AI accuracy for document processing
- Calendar conflict reduction

### System Health
- Uptime percentage
- Average response time
- Error rate
- User support tickets

## Contributing Guidelines

### Code Standards
- Follow ESLint/Prettier configuration
- Use TypeScript strictly
- Write semantic HTML
- Follow component guidelines in CLAUDE.md
- Add JSDoc comments for complex logic

### Pull Request Process
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Update documentation
5. Submit PR with clear description
6. Address review feedback
7. Merge when approved

### Code Review Checklist
- [ ] TypeScript compiles without errors
- [ ] No console errors/warnings
- [ ] Dark mode works
- [ ] i18n keys used
- [ ] Reusable components used
- [ ] Accessible
- [ ] Responsive
- [ ] Documented

## Support & Documentation

### Available Documentation
- `CLAUDE.md` - AI agent instructions
- `PROJECT_OVERVIEW.md` - This file
- `COMPONENTIZATION_GUIDE.md` - Component reusability guide
- `AI_BACKEND_IMPLEMENTATION.md` - Backend API specs
- Component JSDoc comments
- Inline code comments

### Getting Help
1. Check documentation first
2. Search existing code for examples
3. Review common patterns in CLAUDE.md
4. Ask in team chat/discussions

## License

[To be determined - Add your license here]

## Contact

**Project Maintainer:** [Your Name/Team]
**Email:** [Your Email]
**Repository:** [GitHub/GitLab URL]

---

**Version:** 1.0.0  
**Last Updated:** May 5, 2026  
**Status:** Active Development
