# Architecture & Technical Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│                   Next.js SPA (React)                       │
│              (TypeScript + Bootstrap 5 + Zustand)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST
                     │ (Axios)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Backend)                        │
│                   NestJS REST Server                        │
│              (TypeScript + Node.js + Express)               │
│                    (Port: 3001)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL
                     │ (Prisma ORM)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
│              PostgreSQL (Supabase/Local)                    │
│                                                              │
│  ┌─────────────┐ ┌──────────┐ ┌────────────┐              │
│  │    Users    │ │  Content │ │ Activity   │              │
│  │  Roles/     │ │ Notif    │ │ Logs       │              │
│  │ Permissions │ │ Analytics│ │            │              │
│  └─────────────┘ └──────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Rationale

### Backend: NestJS
- **Why**: Enterprise-grade framework with built-in patterns
- **Benefits**: 
  - Modular architecture
  - Dependency injection
  - Decorators for clean code
  - Built-in validation & guards
  - TypeScript support

### Frontend: Next.js
- **Why**: React framework optimized for production
- **Benefits**:
  - App Router for modern routing
  - Server-side rendering (optional)
  - Built-in optimization
  - API route support
  - TypeScript support

### Database: PostgreSQL
- **Why**: Reliable, open-source RDBMS
- **Benefits**:
  - ACID compliance
  - Complex queries support
  - Scalability
  - JSON support for flexible data

### ORM: Prisma
- **Why**: Type-safe modern ORM
- **Benefits**:
  - Type-safe queries
  - Auto-generated client
  - Migration system
  - Excellent DX

## Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend sends POST /auth/signin
   ↓
3. Backend verifies credentials (bcryptjs)
   ↓
4. If valid, generate JWT tokens:
   - Access Token (15 min) - for API calls
   - Refresh Token (7 days) - for refresh
   ↓
5. Store in localStorage (frontend)
   ↓
6. On each API call, send Access Token in Authorization header
   ↓
7. If Access Token expires, use Refresh Token to get new one
   ↓
8. If Refresh Token invalid, redirect to login
```

## Authorization Strategy

### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────┐
│  User                                   │
├─────────────────────────────────────────┤
│ id: string (PK)                        │
│ email: string                          │
│ role: 'ADMIN' | 'EDITOR' | 'USER'     │
│ password: string (hashed)              │
│ permissions: Permission[]              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Role                                   │
├─────────────────────────────────────────┤
│ id: string (PK)                        │
│ name: string                           │
│ permissions: Permission[]              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Permission                             │
├─────────────────────────────────────────┤
│ id: string (PK)                        │
│ resource: string (users, content, etc) │
│ action: string (create, read, etc)     │
│ roles: Role[]                          │
│ users: User[]                          │
└─────────────────────────────────────────┘
```

### Permission Levels

- **ADMIN**: All permissions
- **EDITOR**: Create/Edit/Delete content, View analytics
- **USER**: View-only access

## State Management (Zustand)

### Auth Store
```typescript
{
  user: User | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  setAuth(response): void,
  logout(): void,
  setUser(user): void
}
```

### UI Store
```typescript
{
  isDarkMode: boolean,
  toggleDarkMode(): void,
  sidebarOpen: boolean,
  setSidebarOpen(open): void
}
```

## API Request/Response Pattern

### Standard Request
```typescript
POST /api/v1/auth/signin
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Standard Response (Success)
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt...",
    "user": { }
  }
}
```

### Standard Response (Error)
```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "Invalid email or password",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Pagination Response
```json
{
  "statusCode": 200,
  "data": [...items],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## Backend Module Structure

### Service Layer
```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  // Business logic here
  async findAll() { }
  async findOne(id: string) { }
  async create(data: CreateUserDto) { }
  async update(id: string, data: UpdateUserDto) { }
  async delete(id: string) { }
}
```

### Controller Layer
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Get()
  @Roles('ADMIN')
  async findAll() { }
  
  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) { }
}
```

### Guards & Decorators
```typescript
@UseGuards(JwtAuthGuard)  // Requires valid JWT
@UseGuards(RolesGuard)    // Checks role
@Roles('ADMIN')           // Specifies required role
@Permissions('users:create')  // Check specific permission
async methodName(@CurrentUser() user: User) {}
```

## Database Schema Highlights

### Key Design Decisions

1. **Soft Deletes**: Users have `isActive` flag instead of hard delete
2. **Audit Trail**: `ActivityLog` tracks all changes
3. **Permissions Model**: Flexible RBAC with junction tables
4. **JSON Fields**: `tags` and `changedData` for flexibility

### Indexes
- `users.email` - for authentication
- `users.role` - for filtering
- `content.status` - for status filtering
- `activityLog.createdAt` - for sorting

## Security Implementation

### Backend Security
1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Signing**: HS256 with strong secrets
3. **Input Validation**: class-validators
4. **SQL Injection Prevention**: Prisma ORM
5. **CORS**: Limited to configured origin
6. **Helmet**: Security headers

### Frontend Security
1. **Token Storage**: localStorage (consider httpOnly in future)
2. **XSS Protection**: React's built-in escaping
3. **CSRF Protection**: Built into axios
4. **Route Protection**: ProtectedRoute component

## Performance Optimizations

### Backend
- Pagination (default 10 items)
- Database indexing
- Lazy loading relations
- Query optimization

### Frontend
- Code splitting per route
- Image optimization
- Component memoization
- Zustand for efficient state

## Error Handling

### Backend Exception Filter
```typescript
@Catch()
export class AllExceptionsFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Normalize all exceptions
    // Log errors
    // Return consistent format
  }
}
```

### Frontend Error Handling
```typescript
try {
  const response = await apiService.get('/endpoint');
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized
  } else if (error.response?.status === 403) {
    // Forbidden
  } else {
    // Generic error
  }
}
```

## Testing Strategy (Recommended)

### Unit Tests
```typescript
// tests/auth.service.spec.ts
describe('AuthService', () => {
  it('should hash password with bcrypt', async () => {
    const result = await authService.signUp(dto);
    expect(result.accessToken).toBeDefined();
  });
});
```

### Integration Tests
- Test full request/response cycle
- Use test database
- Mock external services

## Monitoring & Logging

### Implemented
- Winston logger in backend
- API request/response logging
- Error tracking

### Recommended for Production
- Sentry for error tracking
- Datadog for monitoring
- LogRocket for frontend monitoring

## Scaling Considerations

### Horizontal Scaling
1. Load balancer (nginx, HAProxy)
2. Multiple backend instances
3. Connection pooling
4. Redis for caching

### Database Scaling
1. Read replicas
2. Sharding
3. Connection pools
4. Query optimization

### Frontend Caching
1. Service Worker for offline
2. API response caching
3. Static asset caching

---

**This architecture ensures scalability, security, and maintainability.**
