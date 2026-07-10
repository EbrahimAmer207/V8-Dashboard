# ضع Connection String من Supabase هنا:
# 
# اذهب إلى: Supabase Dashboard → Settings → Database → Connection Strings
# 
# مثال:
# DATABASE_URL="postgresql://postgres.ucwzngzosqfufejhqqzw:PASSWORD@aws-0-eu-central-1.pooler.supabase.co:5432/postgres?schema=public"

# app
NODE_ENV=development
PORT=3001
APP_NAME=Admin Dashboard

# Database - استبدل بـ Connection String من Supabase!
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-password
