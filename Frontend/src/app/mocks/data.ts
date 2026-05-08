
export type UserRole = 'teacher' | 'coordinator' | 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  avatarUrl?: string;
}

export const mockTeachers: User[] = [
  { id: 't1', name: 'Dr. Ana Silva', email: 'ana@uni.edu', role: 'teacher', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 't2', name: 'Prof. Carlos Santos', email: 'carlos@uni.edu', role: 'teacher', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 't3', name: 'Dr. Maria Costa', email: 'maria@uni.edu', role: 'teacher', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 't4', name: 'Eng. Joao Pereira', email: 'joao@uni.edu', role: 'teacher', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 't5', name: 'Dr. Sofia Martins', email: 'sofia@uni.edu', role: 'teacher', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
];

export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type ComponentType = 'theoretical' | 'practical' | 'all';

export interface Comment {
  id: string;
  authorName: string;
  role: UserRole;
  text: string;
  createdAt: string;
}

export interface ClassRequest {
  id: string;
  course: string;
  unit: string;
  yearGroups: string[];
  componentType: ComponentType;
  originalDate: string;
  originalTime: string;
  originalRoom: string;
  newDate: string;
  newTime: string;
  newRoom: string;
  reason: string;
  status: RequestStatus;
  teacherName: string;
  submittedAt: string;
  hasConflict?: boolean;
  rejectionReason?: string;
  comments: Comment[];
}

// --- Mock Data for Calendar Modes ---

export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  unit: string;
  type: 'theoretical' | 'practical';
  room: string;
  course: string;
  yearGroup: string; // "LEI-1", "LEI-2"
  classGroup: string; // "A", "B", "PL1"
}

export const mockTimetable: TimeSlot[] = [
  { id: 't1', dayOfWeek: 1, startTime: '09:00', endTime: '11:00', unit: 'Software Architecture', type: 'theoretical', room: 'C1.01', course: 'Computer Science', yearGroup: 'Year 2', classGroup: 'A' },
  { id: 't2', dayOfWeek: 1, startTime: '11:00', endTime: '13:00', unit: 'Web Development', type: 'practical', room: 'Lab 3', course: 'Computer Science', yearGroup: 'Year 2', classGroup: 'PL1' },
  { id: 't3', dayOfWeek: 2, startTime: '14:00', endTime: '16:00', unit: 'Database Systems', type: 'theoretical', room: 'C1.02', course: 'Computer Science', yearGroup: 'Year 2', classGroup: 'A' },
  { id: 't4', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', unit: 'Design Patterns', type: 'practical', room: 'Lab 1', course: 'Design', yearGroup: 'Year 3', classGroup: 'B' },
  { id: 't5', dayOfWeek: 4, startTime: '10:00', endTime: '12:00', unit: 'Project Management', type: 'theoretical', room: 'C1.01', course: 'Management', yearGroup: 'Year 1', classGroup: 'A' },
  { id: 't6', dayOfWeek: 5, startTime: '09:00', endTime: '11:00', unit: 'Software Architecture', type: 'practical', room: 'Lab 4', course: 'Computer Science', yearGroup: 'Year 2', classGroup: 'PL2' },
];

export interface Room {
  id: string;
  name: string;
  type: 'Amphitheater' | 'Standard' | 'PC Lab' | 'Mac Lab';
  capacity: number;
  features: string[];
}

export const mockRooms: Room[] = [
  { id: 'C1.01', name: 'C1.01', type: 'Amphitheater', capacity: 120, features: ['Projector', 'Microphone'] },
  { id: 'C1.02', name: 'C1.02', type: 'Standard', capacity: 40, features: ['Projector', 'Whiteboard'] },
  { id: 'C2.05', name: 'C2.05', type: 'Standard', capacity: 35, features: ['TV', 'Whiteboard'] },
  { id: 'Lab 1', name: 'Lab 1', type: 'PC Lab', capacity: 25, features: ['25 PCs', 'Projector'] },
  { id: 'Lab 3', name: 'Lab 3', type: 'PC Lab', capacity: 30, features: ['30 PCs', 'Projector'] },
  { id: 'Lab 4', name: 'Lab 4', type: 'Mac Lab', capacity: 20, features: ['20 iMacs', 'Projector'] },
];

// --- Courses & Curriculum Data ---

export interface Course {
  id: string;
  name: string;
  abbreviation: string; // e.g., "LEI"
  description: string;
  type: 'Licenciatura' | 'Mestrado' | 'CTeSP';
  durationYears: number;
  totalCredits: number; // ECTS
  coordinatorId: string; // User ID of coordinator
  image: string; // Placeholder for UI
}

export interface CurricularUnit {
  id: string;
  name: string;
  courseId: string;
  year: number; // 1, 2, 3
  semester: 1 | 2;
  ects: number;
  teacherIds: string[]; // IDs of teachers involved (Union of regent and component teachers)
  regentId?: string;
  theoreticalTeacherId?: string;
  practicalTeacherId?: string;
  component: 'Theoretical' | 'Practical' | 'All';
}

export interface ClassGroup {
  id: string;
  name: string; // "A", "B", "PL1"
  unitId: string;
  teacherId: string; // Specific teacher for this class
}

// Mocks
export const mockCourses: Course[] = [
  {
    id: 'lei',
    name: 'Computer Science Engineering',
    abbreviation: 'LEI',
    description: 'A comprehensive degree focused on software engineering, algorithms, and systems architecture.',
    type: 'Licenciatura',
    durationYears: 3,
    totalCredits: 180,
    coordinatorId: 'user-coord-1',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'ld',
    name: 'Digital Design',
    abbreviation: 'LD',
    description: 'Focuses on user interface design, user experience, and visual communication.',
    type: 'Licenciatura',
    durationYears: 3,
    totalCredits: 180,
    coordinatorId: 'user-coord-2',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop'
  }
];

export const mockUnits: CurricularUnit[] = [
  // LEI Year 1
  { 
    id: 'u1', name: 'Programming Fundamentals', courseId: 'lei', year: 1, semester: 1, ects: 6, 
    teacherIds: ['t1', 't2', 'u1'], component: 'All', // Added u1 (Dr. Ana Silva)
    regentId: 't1', theoreticalTeacherId: 't1', practicalTeacherId: 'u1' // Ana Silva is Practical Teacher
  },
  { 
    id: 'u2', name: 'Mathematics I', courseId: 'lei', year: 1, semester: 1, ects: 6, 
    teacherIds: ['t3', 'u1'], component: 'All', // Added u1
    regentId: 't3', theoreticalTeacherId: 't3', practicalTeacherId: 'u1' // Ana Silva is Practical Teacher
  },
  // LEI Year 2
  { 
    id: 'u3', name: 'Software Architecture', courseId: 'lei', year: 2, semester: 1, ects: 6, 
    teacherIds: ['t1'], component: 'All',
    regentId: 't1', theoreticalTeacherId: 't1', practicalTeacherId: 't1'
  },
  { 
    id: 'u4', name: 'Web Development', courseId: 'lei', year: 2, semester: 2, ects: 6, 
    teacherIds: ['t1', 't4'], component: 'All',
    regentId: 't4', theoreticalTeacherId: 't4', practicalTeacherId: 't1'
  },
  // LEI Year 3
  { 
    id: 'u5', name: 'Final Project', courseId: 'lei', year: 3, semester: 2, ects: 15, 
    teacherIds: ['t1', 't2', 't5'], component: 'All',
    regentId: 't5', theoreticalTeacherId: 't5', practicalTeacherId: 't2'
  },
  
  // LD Year 1
  { 
    id: 'u6', name: 'Design Principles', courseId: 'ld', year: 1, semester: 1, ects: 6, 
    teacherIds: ['t5'], component: 'All',
    regentId: 't5', theoreticalTeacherId: 't5', practicalTeacherId: 't5'
  },
];

export const mockClasses: ClassGroup[] = [
  { id: 'c1', name: 'Class A', unitId: 'u3', teacherId: 'u1' }, // Ana Silva
  { id: 'c2', name: 'PL1', unitId: 'u3', teacherId: 'u1' }, // Ana Silva
  { id: 'c3', name: 'PL2', unitId: 'u3', teacherId: 't5' }, // Different teacher
];

export const holidays = [
  { date: '2023-10-05', name: 'Republic Day' },
  { date: '2023-11-01', name: 'All Saints Day' },
  { date: '2023-12-01', name: 'Restoration of Independence' },
  { date: '2023-12-08', name: 'Immaculate Conception' },
  { date: '2023-12-25', name: 'Christmas Day' },
  { date: '2024-01-01', name: 'New Year\'s Day' },
  { date: '2024-02-13', name: 'Carnival' },
  { date: '2024-03-29', name: 'Good Friday' },
  { date: '2024-03-31', name: 'Easter Sunday' },
  { date: '2024-04-25', name: 'Freedom Day' },
  { date: '2024-05-01', name: 'Labour Day' },
];

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const mockUser: User = {
  id: 'u1',
  name: 'Dr. Ana Silva',
  email: 'ana.silva@uni.edu',
  role: 'teacher',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Request Approved',
    message: 'Your request for Software Engineering has been approved by the coordinator.',
    date: '2h ago',
    read: false,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'New Conflict Detected',
    message: 'Room 204 is now occupied on Jan 17th. Please review your pending request.',
    date: '5h ago',
    read: false,
    type: 'warning',
  },
];

export const kpiData = {
    totalRequests: 24,
    pending: 8,
    approved: 12,
    rejected: 4,
    avgResponseTime: '1.5 days',
    conflictRate: '12%',
};

// --- DATA GENERATION ---
const units = [
    { name: 'Software Engineering', course: 'Computer Science', defaultRoom: 'Lab 3' },
    { name: 'Databases I', course: 'Computer Science', defaultRoom: 'Room 204' },
    { name: 'Web Development', course: 'Information Systems', defaultRoom: 'Lab 1' },
    { name: 'Algorithms', course: 'Computer Science', defaultRoom: 'Room 101' },
    { name: 'UX/UI Design', course: 'Design', defaultRoom: 'Studio A' },
    { name: 'Data Science', course: 'Information Systems', defaultRoom: 'Lab 4' },
    { name: 'Mobile Dev', course: 'Computer Science', defaultRoom: 'Lab 2' },
    { name: 'Network Security', course: 'Computer Science', defaultRoom: 'Room 202' },
];

const reasons = [
    'Medical appointment', 'Conference attendance', 'Personal emergency', 
    'Research meeting', 'Department meeting', 'Sick leave', 'Flight delay', 
    'Family emergency', 'Car trouble', 'Jury duty'
];

const generateMockRequests = (count: number): ClassRequest[] => {
    const requests: ClassRequest[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const unit = units[Math.floor(Math.random() * units.length)];
        const isFuture = Math.random() > 0.3; // 70% future requests
        const dateOffset = Math.floor(Math.random() * 20) * (Math.random() > 0.5 ? 1 : -1);
        
        const date = new Date(now);
        date.setDate(date.getDate() + (isFuture ? Math.abs(dateOffset) : -Math.abs(dateOffset)));
        const dateStr = date.toISOString().split('T')[0];

        const status: RequestStatus = isFuture 
            ? (Math.random() > 0.6 ? 'pending' : (Math.random() > 0.5 ? 'approved' : 'rejected'))
            : (Math.random() > 0.1 ? 'approved' : 'rejected');

        const componentType: ComponentType = Math.random() > 0.6 ? 'all' : (Math.random() > 0.5 ? 'practical' : 'theoretical');

        const rejectionReasons = [
            "Conflict with department meeting",
            "Room capacity insufficient for combined classes",
            "Please propose a different time slot",
            "Too many schedule changes this semester",
            "Administrative policy violation"
        ];

        const comments: Comment[] = [];
        if (Math.random() > 0.7) {
             comments.push({
                 id: `c_${i}_1`,
                 authorName: 'Coord. Mario',
                 role: 'coordinator',
                 text: 'Please confirm if the software is installed in the new room.',
                 createdAt: new Date().toISOString()
             });
        }

        requests.push({
            id: `req_${i}`,
            course: unit.course,
            unit: unit.name,
            yearGroups: Math.random() > 0.5 ? ['2nd Year - Class A'] : ['3rd Year', '2nd Year - Class B'],
            componentType: componentType,
            originalDate: dateStr,
            originalTime: '09:00 - 11:00',
            originalRoom: unit.defaultRoom,
            newDate: dateStr, // Simplified for mock
            newTime: '14:00 - 16:00',
            newRoom: Math.random() > 0.5 ? 'Lab 5' : 'Room 205',
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            status: status,
            teacherName: 'Dr. Ana Silva',
            submittedAt: new Date(date.setDate(date.getDate() - 5)).toISOString().split('T')[0],
            hasConflict: status === 'pending' && Math.random() > 0.8,
            rejectionReason: status === 'rejected' ? rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)] : undefined,
            comments: comments
        });
    }
    return requests;
};

export const mockRequests: ClassRequest[] = generateMockRequests(35);
