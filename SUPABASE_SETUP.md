# ربط المشروع مع Supabase

## خطوات الإعداد

### 1️⃣ إنشاء حساب Supabase
1. اذهب إلى https://supabase.com
2. اضغط **Sign Up** 
3. استخدم GitHub أو البريد الإلكتروني

### 2️⃣ إنشاء Project
1. بعد تسجيل الدخول، اضغط **New Project**
2. اختر **Organization** الجديدة (أو الموجودة)
3. أدخل:
   - **Name:** `admin_dashboard`
   - **Password:** كلمة مرور قوية (احفظها)
   - **Region:** اختر الأقرب (مثلاً Europe)
4. انتظر إنشاء المشروع (2-3 دقائق)

### 3️⃣ الحصول على Connection String
1. بعد إنشاء المشروع، اذهب إلى **Settings** → **Database**
2. ستجد **Connection string** تحت **Connection parameters**
3. اختر **Mode: Session** وانسخ الـ Connection String:
   ```
   postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### 4️⃣ تحديث Backend .env
افتح `backend/.env` وا محل:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

بـ Connection String من Supabase

### 5️⃣ تطبيق الـ Migrations
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 6️⃣ إضافة Parameters لـ Supabase Dashboard

بعد تطبيق الـ Migrations، ستظهر الـ Tables في:
- **Supabase Dashboard** → **Editor** → **Tables**

يمكنك:
- عرض الـ Data مباشرة
- إدارة الـ Structure
- إضافة صفوف تجريبية يدوياً

## أهم الجداول في Supabase

بعد تطبيق الـ Migrations ستجد:

| الجدول | الوصف |
|--------|--------|
| `users` | بيانات المستخدمين |
| `roles` | الأدوار (Admin, Editor, User) |
| `permissions` | الصلاحيات |
| `content` | المحتوى |
| `activity_logs` | سجل النشاطات |
| `notifications` | الإشعارات |

## الميزات الإضافية (اختيارية)

### Row Level Security (RLS)
لتحديد من يمكنه الوصول للـ Data:

```sql
-- السماح للمستخدم برؤية بيانته فقط
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
```

### Backup التلقائي
Supabase تقدم backups تلقائية كل يوم (في خطة الـ Pro)

### Real-time Subscriptions (اختياري)
يمكن إضافة تحديثات فورية:

```typescript
// في Frontend
const subscription = supabase
  .from('notifications')
  .on('INSERT', payload => {
    console.log('New notification:', payload.new)
  })
  .subscribe()
```

## Troubleshooting

### مشكلة: Connection Refused
✅ **الحل:** تأكد أن Supabase project يعمل ولم ينقطع

### مشكلة: Auth Errors
✅ **الحل:** تحقق من JWT_SECRET والـ JWT_EXPIRATION

### مشكلة: الجداول غير موجودة
✅ **الحل:** نفذ:
```bash
npm run db:migrate
npm run db:seed
```

## الخطوات التالية

بعد الاتصال بـ Supabase:

1. ابدأ الـ Backend:
   ```bash
   cd backend
   npm run start:dev
   ```

2. ابدأ الـ Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. زر http://localhost:3000 وسجل الدخول بـ:
   - Email: `admin@example.com`
   - Password: `admin123`

## موارد مساعدة

- Supabase Docs: https://supabase.com/docs
- Database Connection: https://supabase.com/docs/guides/database/connecting-to-postgres
- Prisma + Supabase: https://supabase.com/docs/guides/getting-started/frameworks/prisma

---

**اذا احتجت مساعدة في أي خطوة، قول لي!** 🚀
