// ─── "We Are With You" — Support Platform Backend DTO ──────────────────────

export type RequestCategory = 'Medical' | 'Psychological' | 'Service';
export type RequestStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'In Progress';
export type RequestPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type CaseStatus = 'Pending' | 'In Progress' | 'Completed' | 'Escalated';
export type UserType = 'Seeker' | 'Provider' | 'Admin';
export type NotificationPriority = 'critical' | 'high' | 'normal';
export type HealthStatus = 'operational' | 'watching' | 'degraded';

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  prefix?: string;
  suffix?: string;
  delta: number;
  description: string;
  tone: 'sky' | 'emerald' | 'amber' | 'rose';
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  user: string;
  userId: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  submittedAt: string;
  assignedTo?: string;
  region: string;
}

export interface SupportCase {
  id: string;
  caseNumber: string;
  title: string;
  requestId: string;
  status: CaseStatus;
  assignedAdmin: string;
  category: RequestCategory;
  priority: RequestPriority;
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  slaRemainingHours: number;
  progress: number;
  notes: string;
}

export interface SupportUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  status: 'Active' | 'Inactive' | 'Banned';
  lastActive: string;
  requestCount: number;
  caseCount: number;
  joinedAt: string;
  region: string;
}

export interface RequestsOverTimePoint {
  label: string;
  medical: number;
  psychological: number;
  service: number;
  total: number;
}

export interface CategoryShare {
  label: string;
  value: number;
  color: string;
}

export interface ResolutionPoint {
  label: string;
  resolved: number;
  escalated: number;
  avgHours: number;
}

export interface PeakActivityPoint {
  hour: string;
  Mon: number;
  Tue: number;
  Wed: number;
  Thu: number;
  Fri: number;
}

export interface ActivityItem {
  id: string;
  actor: string;
  title: string;
  description: string;
  relativeTime: string;
  accent: 'sky' | 'emerald' | 'amber' | 'rose';
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  relativeTime: string;
  priority: NotificationPriority;
  unread: boolean;
}

export interface HealthCard {
  id: string;
  label: string;
  status: HealthStatus;
  latency: string;
  uptime: string;
  throughput: string;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  requestsOverTime: RequestsOverTimePoint[];
  categoryShares: CategoryShare[];
  resolution: ResolutionPoint[];
  peak: PeakActivityPoint[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  health: HealthCard[];
  requests: HelpRequest[];
  cases: SupportCase[];
  users: SupportUser[];
}
