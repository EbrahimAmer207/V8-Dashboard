export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'ADMIN' | 'MODERATOR' | 'SUPPORT' | 'EDITOR' | 'USER' | 'PROVIDER';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  tags: string[];
  authorId: string;
  author?: User;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  userId: string;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

export interface ActivityLog {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW';
  description: string;
  resource: string;
  resourceId?: string;
  userId: string;
  user?: User;
  ipAddress?: string;
  userAgent?: string;
  changedData?: Record<string, any>;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  statusCode: number;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}
