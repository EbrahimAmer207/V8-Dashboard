# 🚀 V8 Dashboard — Production Deployment Guide

This guide describes how to deploy the V8 Dashboard full-stack system to production.

---

## 🏗️ Production Architecture

```
                 ┌─────────────────────────────┐
                 │       Next.js SPA           │
                 │   (Hosted on Vercel/Netlify)│
                 └──────────────┬──────────────┘
                                │ HTTPS Requests
                                ▼
                 ┌─────────────────────────────┐
                 │       NestJS Server         │
                 │ (Hosted on Render/VPS/PaaS) │
                 └──────────────┬──────────────┘
                                │ SQL Connection (Port 1433)
                                ▼
                 ┌─────────────────────────────┐
                 │       SQL Server DB         │
                 │  (Azure SQL/databaseasp.net)│
                 └─────────────────────────────┘
```

---

## 📂 1. Database Deployment (SQL Server)

The application requires a **Microsoft SQL Server** database instance (SQL Server 2019 or later). 

### Option A: Managed Cloud Database (Azure SQL / databaseasp.net)
1.  Create a SQL Server database in Azure portal or your hosting provider (e.g., `databaseasp.net`).
2.  Obtain the connection endpoint, database name, username, and password.
3.  Ensure firewall rules permit connections from your NestJS backend production servers (whitelist `0.0.0.0/0` if necessary or use specific backend IP blocks).

### Option B: Self-Hosted SQL Server (Windows/Linux VPS)
1.  Install SQL Server on your virtual machine.
2.  Enable TCP/IP connections in the SQL Server Configuration Manager.
3.  Set the default port to `1433`.
4.  Restart SQL Server service and allow port `1433` in the system firewall.

---

## ⚙️ 2. Backend Deployment (NestJS)

The NestJS backend compiles to native JavaScript and can be hosted on any Node.js environment.

### Option A: Deploying to Render / Railway / PaaS
1.  Link your GitHub repository to the hosting service.
2.  Set the **Root Directory** to `backend`.
3.  Specify the build and start commands:
    *   **Build Command:** `npm run build`
    *   **Start Command:** `npm run start:prod`
4.  Configure the environment variables in the provider dashboard (see [Environment Variables](#-environment-variables)).

### Option B: Deploying to VPS (Ubuntu EC2 / DigitalOcean)
1.  SSH into your server and install Node.js (v18+) and Git.
2.  Clone the repository and install dependencies:
    ```bash
    git clone <your-repo-url>
    cd backend
    npm install
    ```
3.  Build the project:
    ```bash
    npm run build
    ```
4.  Use a process manager like **PM2** to run the server in the background:
    ```bash
    npm install -g pm2
    pm2 start dist/main.js --name "v8-backend"
    pm2 startup
    pm2 save
    ```
5.  Set up Nginx as a reverse proxy to forward traffic to port `3001`.

---

## 🎨 3. Frontend Deployment (Next.js)

The Next.js single-page application is optimized for deployment on Vercel.

### Option A: Vercel (Recommended)
1.  Connect your GitHub repository to Vercel.
2.  Create a new project and select the `frontend` folder as the root directory.
3.  Under build settings, Vercel will automatically detect the Next.js presets.
4.  Add the production environment variables:
    *   `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.com/api/v1`
    *   `NEXT_PUBLIC_APP_NAME`: `V8 Dashboard`
5.  Click **Deploy**.

---

## 🔒 4. Production Environment Variables

Ensure the following variables are configured in your production hosting consoles:

### Production Backend (`backend`)
```env
NODE_ENV=production
PORT=3001
APP_NAME=V8 Dashboard

# SQL Server Production Connection String
DATABASE_URL="sqlserver://<production-db-host>:1433;database=<db-name>;user=<db-user>;password=<db-pass>;encrypt=true;trustServerCertificate=false;"

# Generate secure secrets for production (use openssl rand -base64 32)
JWT_SECRET=your_production_secure_access_token_secret
JWT_REFRESH_SECRET=your_production_secure_refresh_token_secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Next.js Application Origin
CORS_ORIGIN=https://your-frontend-domain.com

# Media Configurations
PUBLIC_MEDIA_URL=https://your-backend-domain.com
MEDIA_BASE_URL=https://your-backend-domain.com
```

### Production Frontend (`frontend`)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
NEXT_PUBLIC_APP_NAME="V8 Dashboard"
```

---

## 💾 5. Database Backup & Disaster Recovery

### Manual SQL Server Backups
To create a backup copy of your SQL Server database:
```sql
BACKUP DATABASE [v8_database]
TO DISK = N'/var/opt/mssql/data/v8_database_backup.bak'
WITH NOFORMAT, NOINIT,
NAME = N'v8_database-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10;
```

### Restoring Backups
To restore the database:
```sql
RESTORE DATABASE [v8_database]
FROM DISK = N'/var/opt/mssql/data/v8_database_backup.bak'
WITH FILE = 1, NOUNLOAD, REPLACE, STATS = 5;
```

---

## 📈 6. Scaling & Health Checks

*   **Health Check Endpoint:** The NestJS backend provides a health check route at `https://your-backend-domain.com/api/v1/health` (if configured in app controller).
*   **Database Pooling:** Prisma manages database connections automatically, but you can configure connection pooling flags on the `DATABASE_URL` string if query volume scales up.
