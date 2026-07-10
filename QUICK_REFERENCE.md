# Developer Quick Reference

## Project Structure at a Glance

```
Dash/
├── backend/
│   ├── src/
│   │   ├── modules/           # Business logic modules
│   │   │   ├── auth/auth.{controller,service,module,strategy}.ts
│   │   │   ├── users/users.{controller,service,module}.ts
│   │   │   ├── content/content.{controller,service,module}.ts
│   │   │   └── ... more modules
│   │   ├── common/
│   │   │   ├── guards/        # JwtAuthGuard, RolesGuard, PermissionsGuard
│   │   │   ├── decorators/    # @Roles, @Permissions, @CurrentUser
│   │   │   └── filters/       # AllExceptionsFilter
│   │   ├── main.ts            # Entry point
│   │   └── app.module.ts      # Root module
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Test data
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── app/                   # Next.js pages/routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── content/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── components/            # Reusable React components
│   │   ├── layout/MainLayout.tsx
│   │   ├── common/            # Shared UI components
│   │   └── ProtectedRoute.tsx
│   ├── services/              # API client
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── ... more services
│   ├── store/                 # Zustand stores
│   │   └── index.ts           # Auth & UI stores
│   ├── types/                 # TypeScript interfaces
│   │   └── index.ts
│   ├── styles/                # SCSS styling
│   │   ├── globals.scss       # Bootstrap + custom
│   │   ├── variables.scss     # Color variables
│   │   └── custom.scss        # Custom component styles
│   ├── package.json
│   └── .env.example
│
├── Documentation files (README, SETUP, API_REFERENCE, etc.)
└── .gitignore
```

## Common Development Tasks

### Add a New Endpoint (Backend)

1. **Create DTO** (`src/modules/mymodule/dto/index.ts`)
   ```typescript
   export class CreateMyEntityDto {
     @IsString()
     name: string;
   }
   ```

2. **Add Service Method** (`src/modules/mymodule/mymodule.service.ts`)
   ```typescript
   async create(data: CreateMyEntityDto) {
     return this.prisma.myEntity.create({ data });
   }
   ```

3. **Add Controller Method** (`src/modules/mymodule/mymodule.controller.ts`)
   ```typescript
   @Post()
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('ADMIN')
   async create(@Body() dto: CreateMyEntityDto) {
     return this.myModuleService.create(dto);
   }
   ```

### Add a New Page (Frontend)

1. **Create Page** (`app/mypage/page.tsx`)
   ```typescript
   'use client';

   import { MainLayout } from '@/components/layout/MainLayout';
   import { ProtectedRoute } from '@/components/ProtectedRoute';

   export default function MyPage() {
     return (
       <ProtectedRoute>
         <MainLayout>
           <div>Your page content</div>
         </MainLayout>
       </ProtectedRoute>
     );
   }
   ```

2. **Add to Sidebar** (`components/layout/MainLayout.tsx`)
   ```typescript
   const menuItems = [
     // ... existing items
     { href: '/mypage', label: 'My Page', icon: FiIcon },
   ];
   ```

### Add Database Migration

1. **Update Schema** (`prisma/schema.prisma`)
   ```typescript
   model MyEntity {
     id    String  @id @default(cuid())
     name  String
   }
   ```

2. **Create Migration**
   ```bash
   cd backend
   npm run db:migrate
   ```

### Add API Call (Frontend)

1. **Create Service** (`services/mymodule.service.ts`)
   ```typescript
   import { apiService } from '@/services/api.service';

   export const myService = {
     getAll: () => apiService.get('/mymodule'),
     create: (data: any) => apiService.post('/mymodule', data),
   };
   ```

2. **Use in Component**
   ```typescript
   import { myService } from '@/services/mymodule.service';

   const data = await myService.getAll();
   ```

## Common Commands

### Backend
```bash
cd backend

# Development
npm install                 # Install dependencies
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations
npm run db:seed           # Seed test data
npm run start:dev         # Start dev server
npm run lint              # Run linter
npm test                  # Run tests

# Production
npm run build             # Build project
npm run start:prod        # Start production
```

### Frontend
```bash
cd frontend

# Development
npm install               # Install dependencies
npm run dev              # Start dev server
npm run lint             # Run linter
npm run type-check       # Check types

# Production
npm run build            # Build for production
npm start                # Start production server
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `backend/src/app.module.ts` | Root module, imports all features |
| `backend/prisma/schema.prisma` | Database schema definition |
| `backend/src/main.ts` | Backend entry point |
| `frontend/app/layout.tsx` | Root layout, imports styles |
| `frontend/store/index.ts` | Global state management |
| `frontend/services/api.service.ts` | HTTP client setup |
| `frontend/styles/globals.scss` | Global styles |

## Authentication Flow Reference

```
Frontend                    Backend
  │                           │
  ├─ POST /auth/signin ────→  │ (validate credentials)
  │                           │
  │  ←─ tokens + user ────────┤
  │                           │
  ├─ GET /users (w/ token) ──→│ (verify JWT)
  │                           │ (check roles/permissions)
  │                           │
  │  ←─ data ─────────────────┤
  │                           │
  └─ If 401: POST /auth/refresh
                              │ (issue new access token)
```

## API Response Pattern

All API responses follow this pattern:

```typescript
interface ApiResponse<T> {
  statusCode: number;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
```

## State Management Pattern

Auth store example:
```typescript
// Get user
const { user } = useAuthStore();

// Set authentication
const { setAuth } = useAuthStore();
setAuth(response.data);

// Logout
const { logout } = useAuthStore();
logout();
```

## Component Patterns

### Protected Page
```typescript
<ProtectedRoute requiredRole="ADMIN">
  <MainLayout>
    {/* Content */}
  </MainLayout>
</ProtectedRoute>
```

### With API Data
```typescript
const [data, setData] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      const response = await apiService.get('/endpoint');
      setData(response.data);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

if (loading) return <Loading />;
return <div>{...}</div>;
```

## Styling Guide

### Using Bootstrap Classes
```typescript
<div className="container-fluid px-4 py-5">
  <div className="row g-4">
    <div className="col-md-6 col-lg-3">
      <Card className="border-0 shadow-sm">
        Content
      </Card>
    </div>
  </div>
</div>
```

### Custom Colors (from variables.scss)
```scss
$primary: #4f46e5;      // Use for actions
$secondary: #6b7280;    // Use for secondary
$success: #10b981;      // Use for positive
$danger: #ef4444;       // Use for destructive
```

### Using Zustand
```typescript
// In your component
import { useAuthStore } from '@/store';
import { useUIStore } from '@/store';

export function MyComponent() {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useUIStore();
  
  return <div>{user?.email}</div>;
}
```

## Error Handling Pattern

Backend:
```typescript
if (!found) {
  throw new NotFoundException('Resource not found');
}
```

Frontend:
```typescript
try {
  await apiService.get('/endpoint');
} catch (error: any) {
  const message = error.response?.data?.message || 'Error';
  setError(message);
}
```

## Debugging Tips

### Backend
```typescript
// Add logging
this.logger.log('Message');
this.logger.error('Error', error.stack);
this.logger.warn('Warning');

// In main.ts, see all registered routes
console.log(app._router.stack);
```

### Frontend
```typescript
// React DevTools Chrome extension
// Check Zustand store in browser console
console.log(useAuthStore.getState());

// Network tab in DevTools to inspect API calls
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

## Performance Tips

### Backend
- Add pagination to all list endpoints
- Create database indexes for frequently queried columns
- Use `select` in Prisma to only fetch needed fields

### Frontend
- Wrap components in `React.memo` if they re-render unnecessarily
- Use `useCallback` for event handlers
- Lazy load images with Next.js `Image` component
- Code splitting happens automatically with Next.js

## Testing Commands

```bash
# Backend unit tests
npm test

# Backend with coverage
npm run test:cov

# Frontend type checking
npm run type-check
```

## Useful Resources

- NestJS Docs: https://docs.nestjs.com
- Next.js Docs: https://nextjs.org/docs
- Bootstrap Docs: https://getbootstrap.com
- Prisma Docs: https://www.prisma.io/docs
- Zustand: https://github.com/pmndrs/zustand

---

**Keep this reference handy while developing!**
