# Deployment Guide

## Deployment Options

### Backend Deployment

#### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Select the `backend` directory as root

3. **Environment Variables**
   - Set all `.env` variables in Vercel dashboard
   - Database connection string
   - JWT secrets

4. **Deploy**
   - Vercel automatically deploys on push

#### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set DATABASE_URL=postgresql://...
   heroku config:set JWT_SECRET=your_secret
   heroku config:set CORS_ORIGIN=https://your-frontend.com
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Option 3: AWS (EC2)

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - Allow ports 3001, 22 in security group

2. **Connect and Setup**
   ```bash
   # SSH into server
   ssh -i key.pem ec2-user@your-ip
   
   # Install Node.js
   curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql
   ```

3. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd backend
   npm install
   npm run build
   npm run start:prod
   ```

4. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name "admin-dashboard-api"
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Deploy**
   - Connect GitHub repository to Vercel
   - Select the `frontend` directory as root
   - Set environment variable `NEXT_PUBLIC_API_URL`
   - Deploy automatically on push

#### Option 2: Netlify

1. **Create netlify.toml**
   ```toml
   [build]
   command = "npm run build"
   publish = ".next"
   
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

2. **Deploy**
   - Connect GitHub to Netlify
   - Set `NEXT_PUBLIC_API_URL` in Netlify dashboard
   - Deploy

#### Option 3: AWS S3 + CloudFront

1. **Build for Production**
   ```bash
   npm run build
   npm run export
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync out/ s3://your-bucket-name
   ```

3. **Set up CloudFront**
   - Create distribution pointing to S3
   - Set caching headers
   - Configure custom domain

## Database Deployment

### Supabase (Managed PostgreSQL)

1. **Create Project**
   - Go to https://supabase.io
   - Create new project
   - Copy database URL

2. **Update Backend**
   ```bash
   # Set DATABASE_URL in .env
   DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
   ```

3. **Run Migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

### Self-Hosted PostgreSQL (AWS RDS)

1. **Create RDS Instance**
   - Engine: PostgreSQL 14
   - Multi-AZ for high availability
   - Automated backups enabled

2. **Connect**
   ```bash
   psql -h your-rds-endpoint.amazonaws.com -U postgres
   CREATE DATABASE admin_dashboard;
   ```

3. **Update Connection String**
   ```
   DATABASE_URL=postgresql://user:password@your-rds-endpoint.amazonaws.com:5432/admin_dashboard
   ```

## SSL/TLS Certificates

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Application-Level CORS Headers

```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
});
```

## Environment Variables

### Production Backend .env

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
JWT_SECRET=<randomkeygenhere>
JWT_REFRESH_SECRET=<randomkeygenhere>
CORS_ORIGIN=https://yourdomain.com
```

### Production Frontend .env.production

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_NAME=Admin Dashboard
```

## Performance Optimization

### Backend
```typescript
// Enable compression
import * as compression from 'compression';
app.use(compression());

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### Frontend
```typescript
// Next.js automatically optimizes:
// - Code splitting
// - Image optimization
// - Static generation
// - API route optimization
```

### Database
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_logs_created_at ON activity_logs(created_at);
```

## Monitoring & Logging

### Backend Logging

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  method() {
    this.logger.log('Important information');
    this.logger.error('Error occurred');
    this.logger.warn('Warning message');
  }
}
```

### Error Tracking (Sentry)

```typescript
// backend/src/main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Monitoring Tools

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Datadog**: Full-stack monitoring
- **New Relic**: Performance monitoring

## Backup Strategy

### Database Backups

```bash
# Daily automated backups (AWS RDS)
# Or Supabase automatic backups

# Manual backup
pg_dump postgresql://user:pass@host/dbname > backup.sql

# Restore
psql postgresql://user:pass@host/dbname < backup.sql
```

### File Backups

```bash
# Backup uploads directory
aws s3 sync ./uploads s3://backup-bucket/uploads --delete

# Backup database dumps
aws s3 cp backup.sql s3://backup-bucket/backups/
```

## CI/CD Pipeline (GitHub Actions)

### Backend Workflow

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
      
      - name: Run tests
        run: npm test
        working-directory: ./backend
      
      - name: Build
        run: npm run build
        working-directory: ./backend
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Frontend Workflow

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
      
      - name: Type check
        run: npm run type-check
        working-directory: ./frontend
      
      - name: Build
        run: npm run build
        working-directory: ./frontend
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

## Scaling Considerations

### Horizontal Scaling

```
Load Balancer (nginx/HAProxy)
    ↓
[Backend 1] [Backend 2] [Backend 3]
    ↓
  (Connection Pool)
    ↓
PostgreSQL (with replicas)
```

### Caching Layer

```typescript
// Add Redis for session/cache
import * as redis from 'redis';

const client = redis.createClient();

// Cache API responses
async getCached(key: string) {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  // Fetch from DB and cache
}
```

## Health Checks

### Backend Health Endpoint

```typescript
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: new Date() };
}
```

### Configure Load Balancer

```nginx
location /health {
    proxy_pass http://backend:3001/api/v1/health;
}
```

## Disaster Recovery

1. **Automated Backups**: Daily database backups
2. **Replication**: Multi-region database replicas
3. **CDN**: Global content delivery
4. **Failover**: Automated traffic rerouting
5. **Documentation**: Runbooks for recovery procedures

---

**Your application is now ready for production!**
