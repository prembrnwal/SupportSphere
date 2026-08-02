export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory =
  | 'technical'
  | 'billing'
  | 'account'
  | 'feature_request'
  | 'bug'
  | 'general';

export interface TimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  actor: string;
}

export interface Comment {
  id: string;
  author: string;
  authorRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  comments: Comment[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
