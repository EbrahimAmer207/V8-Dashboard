export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  delta: number;
  tone: 'sky' | 'emerald' | 'amber' | 'rose';
  suffix?: string;
  prefix?: string;
  description: string;
}

export interface RequestsTimelineView {
  label: string;
  incoming: number;
  resolved: number;
}

export interface RequestsByCategory {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface PeakActivity {
  label: string;
  requests: number;
  activeAdmins: number;
}

export type HelpRequestType = 'Medical' | 'Psychological' | 'Service';
export type HelpRequestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
export type RequestPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface HelpRequest {
  id: string;
  user: string;
  type: HelpRequestType;
  title: string;
  priority: RequestPriority;
  status: HelpRequestStatus;
  assignedTo?: string;
  submittedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  relativeTime: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  unread: boolean;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
}

export interface SlaAlertItem {
  id: string;
  title: string;
  detail: string;
  severity: 'critical' | 'warning';
  caseIds: string[];
}

export interface ActivityItem {
  id: string;
  actor: string;
  title: string;
  description: string;
  relativeTime: string;
  accent: 'sky' | 'emerald' | 'amber' | 'rose';
}

export interface SocialPost {
  id: number | string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  timeline: RequestsTimelineView[];
  categories: RequestsByCategory[];
  activityPeaks: PeakActivity[];
  requests: HelpRequest[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
  health: ServiceHealth[];
  slaAlerts: SlaAlertItem[];
  posts?: SocialPost[];
  updatedAt: string;
}
