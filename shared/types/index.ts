export type UserRole = 'admin' | 'manager' | 'teacher' | 'sales';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';
export type LeadSource = 'website' | 'referral' | 'social' | 'call' | 'other';

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled';

export type GroupStatus = 'active' | 'completed' | 'archived';

export type EnrollmentStatus = 'active' | 'dropped' | 'completed';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  assignedTo?: string;
  assigned?: User;
  branchId?: string;
  branch?: Branch;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  duration: number;
  teacherId?: string;
  teacher?: User;
  groupId?: string;
  group?: Group;
  branchId?: string;
  branch?: Branch;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  course?: string;
  level?: string;
  branchId?: string;
  branch?: Branch;
  teacherId?: string;
  teacher?: User;
  schedule?: string;
  capacity: number;
  enrolledCount: number;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId?: string;
  user?: User;
  groupId?: string;
  group?: Group;
  status: EnrollmentStatus;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  user?: User;
  action: string;
  details?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}
