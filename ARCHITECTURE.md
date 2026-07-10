# 🏗️ V8 Dashboard — Architecture & Technical Design

This document details the architectural patterns, technology stack rationale, security parameters, and data models of the V8 Dashboard project.

---

## 🗺️ System Overview

The system is designed as a decoupled, multi-tier application connecting a modern Next.js single-page client to a NestJS API backend, communicating with a remote **SQL Server** database that contains schema definitions shared with an ASP.NET Core identity system.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│             Next.js SPA (React 18 + Next.js 14)             │
│   (TypeScript + Radix UI + TailwindCSS + Framer Motion)     │
│                     [Port: 3000]                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP / REST APIs
                     │ (Axios Interceptors)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Backend)                        │
│                   NestJS REST Server                        │
│             (TypeScript + Node.js + Express)                │
│                     [Port: 3001]                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL Dialect
                     │ (Prisma Client JS)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
│              Microsoft SQL Server (Remote)                  │
│                     [Port: 1433]                            │
│                                                             │
│  ┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │   AspNetUsers   │ │ BotMessages  │ │  SupportTickets  │  │
│  │   AspNetRoles   │ │ ChatSessions │ │  Notifications   │  │
│  │ AspNetUserRoles │ │ Podcasts     │ │  Resources       │  │
│  └─────────────────┘ └──────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Rationale

### ⚡ Frontend: Next.js 14 (App Router)
*   **Why:** High-performance React framework for enterprise-ready applications.
*   **Benefits:**
    *   Flexible routing via App Router.
    *   Optimized styling using **TailwindCSS** and **Radix UI** primitives for accessibility.
    *   Micro-animations powered by **Framer Motion** for a premium user experience.
    *   Lightweight global state management with **Zustand**.

### 🚀 Backend: NestJS 10
*   **Why:** Modular, structured Node.js framework offering architecture-by-default.
*   **Benefits:**
    *   Type-safe dependency injection.
    *   Modular encapsulation (e.g. `auth`, `users`, `chat`, `admin-compat`, `resources`).
    *   Guards and interceptors for clean request lifecycle management.

### 🗄️ Database & ORM: SQL Server + Prisma
*   **Why:** Enterprise RDBMS compliance coupled with developer-friendly client generation.
*   **Benefits:**
    *   Allows schema parity with ASP.NET Core backend endpoints (sharing tables such as `AspNetUsers` and `AspNetUserRoles`).
    *   Prisma translates complex JS queries into native SQL Server transactions.

---

## 🔑 Authentication & Authorization Flow

The system integrates a JWT-based authentication system mapping directly to ASP.NET Identity password hashes:

```
1. User enters login details (Email / Password)
   │
   ▼
2. Next.js Client sends POST /auth/signin
   │
   ▼
3. NestJS Backend verifies password hash (Bcrypt comparison) against AspNetUsers table
   │
   ▼
4. If valid, NestJS signs:
   ├── Access Token (short-lived, 15 min) -> holds role permissions
   └── Refresh Token (long-lived, 7 days) -> for sliding sessions
   │
   ▼
5. Tokens are returned to client & stored in local storage / memory
   │
   ▼
6. Next.js Axios interceptor attaches the Authorization header to all requests
   │
   ▼
7. If Access Token expires (401), the client requests a token refresh using the Refresh Token
```

---

## 🛠️ Admin Compatibility Layer (`admin-compat`)

Since the database uses an ASP.NET Identity schema, the NestJS backend implements a **compatibility layer** to map standard dashboard REST resource interfaces into ASP.NET database tables:

*   **Support Tickets (`SupportTickets`):** Maps `Open`, `Accepted`, `Closed` tickets to `Pending`, `In Progress`, and `Completed` cases on the Admin UI.
*   **Roles & Permissions (`AspNetRoles`):** Direct queries to ASP.NET role tables, establishing role levels (`ADMIN`, `EDITOR`, `MODERATOR`, `SUPPORT`) inside NestJS guards.
*   **Content Library (`Knowledge`):** Bridges Next.js content management widgets to resources stored inside the database tables.

---

## 🔒 Security Implementations

*   **Password Storage:** Bcrypt hashing.
*   **CORS Protection:** Configurable whitelist checks (via `CORS_ORIGIN` env).
*   **SQL Injection Prevention:** Prisma automatically parameterizes all queries.
*   **Route Guards:** NestJS `RolesGuard` and `JwtAuthGuard` protect controllers at controller/method level.
