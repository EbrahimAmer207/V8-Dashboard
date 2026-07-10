# Admin Dashboard - Complete Setup Guide

This is a production-ready admin dashboard system built with Next.js, NestJS, and PostgreSQL.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Customization](#customization)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ or Supabase account
- Git
- Code editor (VS Code recommended)

## Project Structure

```
Dash/
├── backend/                 # NestJS Server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── roles/      # Role management
│   │   │   ├── permissions/# Permission management
│   │   │   ├── content/    # Content management
│   │   │   ├── logs/       # Activity logs
│   │   │   └── notifications/
│   │   ├── common/         # Shared utilities
│   │   │   ├── guards/     # Auth guards
│   │   │   ├── filters/    # Exception filters
│   │   │   └── decorators/ # Custom decorators
│   │   ├── config/         # Configuration
│   │   ├── main.ts         # Entry point
│   │   └── app.module.ts   # Root module
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed script
│   └── package.json
│
└── frontend/               # Next.js Application
    ├── app/               # App Router
    │   ├── auth/          # Auth pages
    │   ├── dashboard/     # Dashboard page
    │   ├── users/         # Users management
    │   ├── content/       # Content management
    │   ├── analytics/     # Analytics page
    │   └── settings/      # Settings page
    ├── components/        # Reusable components
    │   ├── layout/        # Layout components
    │   └── common/        # Common components
    ├── services/          # API services
    ├── store/            # Zustand store
    ├── styles/           # SCSS styles
    ├── types/            # TypeScript types
    └── package.json
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Update `.env`:
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/admin_dashboard
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

#### Using Supabase:

1. Create a new Supabase project
2. Get your database URL from project settings
3. Update `DATABASE_URL` in `.env`

#### Using Local PostgreSQL:

```bash
createdb admin_dashboard
```

### 4. Run Migrations

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

This will:
- Generate Prisma client
- Run migrations
- Seed with default data (admin user, roles, permissions)

### 5. Start Backend

```bash
npm run start:dev
```

Backend runs on `http://localhost:3001`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Admin Dashboard
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## Running the Application

### Terminal 1 - Backend

```bash
cd backend
npm install
npm run db:seed
npm run start:dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Login Credentials**:
  - Email: `admin@example.com`
  - Password: `admin123`

## API Documentation

### Authentication Endpoints

#### POST /auth/signup
Register a new user
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /auth/signin
Login with email and password
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "username": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

#### POST /auth/refresh
Refresh access token
```json
{
  "refreshToken": "refresh_token"
}
```

### Users Endpoints

#### GET /users
Get all users (paginated)
- Query: `page`, `limit`, `search`, `role`

#### GET /users/profile
Get current user profile (requires auth)

#### GET /users/:id
Get user by ID (admin only)

#### POST /users
Create new user (admin only)

#### PUT /users/:id
Update user (admin or self)

#### PUT /users/:id/role
Update user role (admin only)

#### DELETE /users/:id
Delete user (soft delete, admin only)

#### GET /users/stats
Get user statistics (admin only)

### Content Endpoints

#### GET /content
Get all content (paginated)
- Query: `page`, `limit`, `search`, `status`, `category`

#### GET /content/:id
Get content by ID

#### POST /content
Create new content (editor+)

#### PUT /content/:id
Update content (editor+)

#### DELETE /content/:id
Delete content (editor+)

#### GET /content/stats
Get content statistics

### Notifications Endpoints

#### GET /notifications
Get user notifications

#### GET /notifications/unread-count
Get unread notification count

#### PUT /notifications/:id/read
Mark notification as read

#### PUT /notifications/mark-all-read
Mark all notifications as read

#### DELETE /notifications/:id
Delete notification

### Logs Endpoints

#### GET /logs
Get activity logs (admin only)
- Query: `page`, `limit`, `userId`, `type`, `resource`

#### GET /logs/stats
Get logs statistics (admin only)

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Refresh token mechanism
- Role-based access control (RBAC)
- Protected routes (frontend & backend)

### 👥 User Management
- Create, read, update, delete users
- Role assignment
- User statistics
- User activity tracking

### 📝 Content Management
- Create, publish, archive content
- Content categorization and tagging
- View count tracking
- Search and filtering

### 📊 Analytics
- User statistics
- Content performance
- Activity logging
- Trend analysis

### 📬 Notifications System
- Real-time notifications
- Read/unread status
- Notification management

### 🎨 UI Features
- Modern Bootstrap 5 customization
- Responsive design
- Dark mode ready
- Smooth animations
- Tables with sorting and filtering
- Modal dialogs
- Toast notifications

## Customization

### Colors and Branding

Edit `frontend/styles/variables.scss`:
```scss
$primary: #4f46e5;  // Change primary color
$secondary: #6b7280;
$success: #10b981;
$danger: #ef4444;
```

### Adding New Modules

#### Backend Module Template

```bash
# Create module structure
src/modules/mymodule/
├── mymodule.controller.ts
├── mymodule.service.ts
├── mymodule.module.ts
└── dto/
    └── index.ts
```

#### Register in app.module.ts

```typescript
import { MymoduleModule } from './modules/mymodule/mymodule.module';

@Module({
  imports: [
    // ... other imports
    MymoduleModule,
  ],
})
export class AppModule {}
```

### Database Changes

1. Update `prisma/schema.prisma`
2. Run migration:
   ```bash
   npm run db:migrate
   ```

## Troubleshooting

### CORS Error
- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Default: `http://localhost:3000`

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### JWT Token Error
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration in `.env`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Use `npm run dev -- -p 3001`

## Deployment

### Backend (Vercel/Heroku)
1. Set environment variables
2. Deploy with `npm run build && npm run start:prod`

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically

## Performance Optimization

- Pagination on all list endpoints
- Lazy loading components
- Image optimization
- Code splitting
- Caching strategies

## Security Best Practices

✅ Implemented:
- JWT authentication
- CORS protection
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS protection

⚠️ Additional for Production:
- Rate limiting
- HTTPS enforcement
- Security headers (Helmet)
- Database encryption
- API key rotation

## Support & License

MIT License - Feel free to use for personal and commercial projects.

---

**Happy coding! 🚀**
