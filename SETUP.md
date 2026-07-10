# 🛠️ V8 Dashboard — Complete Setup Guide

This guide describes how to configure and run the V8 Dashboard full-stack system locally or in development.

## 📋 Table of Contents
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Running the Application](#-running-the-application)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Troubleshooting](#-troubleshooting)

---

## 📋 Prerequisites

Before setting up, ensure you have the following installed:
*   **Node.js**: `v18.x` or `v20.x` (LTS recommended)
*   **npm**: `v9.x` or higher
*   **SQL Server**: Local SQL Server Instance (Express/Developer Edition) or access to a Remote SQL Server Instance (configured on port `1433`).
*   **Git**: For version control.

---

## 📂 Project Structure

```
V8-Dashboard/
├── backend/                 # NestJS Application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # JWT Auth (Bcrypt, AspNetUsers mapping)
│   │   │   ├── admin-compat/# Compatibility controllers for ASP.NET tables
│   │   │   ├── chat/       # Bot Sessions & Messages
│   │   │   ├── dashboard/   # Summary statistics & logs metrics
│   │   │   ├── doctors/    # Therapists/Doctors administration
│   │   │   ├── resources/  # Library content and file uploads
│   │   │   └── ...
│   │   ├── prisma/
│   │   │   └── schema.prisma # SQL Server Prisma Schema
│   │   └── main.ts         # NestJS App Entry Point
│   └── .env.example
│
└── frontend/               # Next.js Application
    ├── app/               # App Router Pages
    │   ├── clinical/      # Medical clinical dashboard
    │   ├── therapists/    # Therapist management UI
    │   ├── chat/          # Real-time AI Therapist Chat UI
    │   ├── social/        # Social feed (Posts, Likes, Comments)
    │   └── ...
    └── .env.example
```

---

## ⚙️ Backend Setup

### 1. Install Dependencies
Navigate to the `backend` directory and install the packages:
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the template `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and configure your **SQL Server** connection string and secrets:
```env
# App Configuration
NODE_ENV=development
PORT=3001
APP_NAME=Admin Dashboard

# SQL Server Database URL
DATABASE_URL="sqlserver://<host>:<port>;database=<database_name>;user=<username>;password=<password>;encrypt=false;trustServerCertificate=true;"

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_REFRESH_EXPIRATION=7d

# CORS Origin (Points to Next.js dev server)
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
PUBLIC_MEDIA_URL=http://localhost:3001
MEDIA_BASE_URL=http://localhost:3001
```

### 3. Generate Prisma Client
Prisma needs to read your SQL Server schema definitions to compile the type-safe client:
```bash
npm run db:generate
```
*(This maps the ASP.NET Identity tables like `AspNetUsers`, `SupportTickets`, etc.)*

### 4. Start NestJS Dev Server
```bash
npm run start:dev
```
The NestJS backend will start listening on `http://localhost:3001`.

---

## 🎨 Frontend Setup

### 1. Install Dependencies
Navigate to the `frontend` directory and install the node modules:
```bash
cd ../frontend
npm install
```

### 2. Environment Configuration
Copy the template `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure the Next.js environment:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME="V8 Dashboard"
```

### 3. Start Next.js Dev Server
```bash
npm run dev
```
The Next.js client will start running at `http://localhost:3000`.

---

## 🚀 Running the Application

For full-stack local development:

### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Open your browser to `http://localhost:3000` to access the Dashboard.
*   **Default Admin Credentials** (or bypass mode if configured):
    *   *Email:* `admin@example.com`
    *   *Password:* `admin123`

---

## 🗄️ Database Schema & Migrations

Because this project utilizes **SQL Server** tables compatible with an ASP.NET Core identity system (e.g. `AspNetUsers`, `AspNetUserRoles`, `AspNetRoles`), the database schema is managed accordingly:

*   **View Schema:** You can inspect the data model under `backend/prisma/schema.prisma`.
*   **Database Synchronization:** If the remote SQL Server schema changes, use:
    ```bash
    npx prisma db pull
    npx prisma generate
    ```
*   **Direct Access:** To explore the database contents directly from VS Code or a terminal, run:
    ```bash
    npx prisma studio
    ```

---

## 🔍 Troubleshooting

### SQL Server Connection Error
*   Ensure SQL Server is running and allows remote connections over TCP/IP.
*   Make sure port `1433` is open.
*   Verify credentials and configuration flags (`encrypt=false;trustServerCertificate=true;` are often required for local development/remote staging).

### Next.js Build Fails
*   If Next.js complains about types, run `npm run build` locally in the frontend directory to verify and update the `.next` artifacts.

### CORS Blocked
*   Ensure the backend `.env` file contains `CORS_ORIGIN=http://localhost:3000` to allow the frontend Next.js app to make API calls.
