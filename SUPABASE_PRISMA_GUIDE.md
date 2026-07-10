# Supabase + Prisma Integration Guide

## ملخص
المشروع الحالي يستخدم:
- **Backend:** NestJS + Prisma ORM
- **Frontend:** Next.js
- **Database:** Supabase (PostgreSQL)

## المميزات

✅ **Database Migrations** - تابعها تلقائياً مع Prisma
✅ **Type Safety** - جميع الأنواع محددة نوعاً ما من قبل
✅ **Real-time Sync** - يمكن إضافة Real-time بسهولة
✅ **User Authentication** - مدمج في Supabase
✅ **Automatic Backups** - Supabase توفرها
✅ **Scaling** - قابل للتوسع بسهولة

## خطوات الاتصال بـ Supabase

### الخطوة 1: إنشاء Database على Supabase

```bash
# 1. اذهب إلى https://supabase.com
# 2. اضغط "New Project"
# 3. أدخل:
#    - Name: admin_dashboard
#    - Password: كلمة قوية
#    - Region: اختر الأقرب
```

### الخطوة 2: الحصول على Connection String

```bash
# في Supabase Dashboard:
# 1. اذهب إلى Settings → Database
# 2. انسخ Connection String تحت "Connection parameters"
# 3. واختر Mode: "Session"
```

### الخطوة 3: تحديث backend/.env

```bash
# افتح backend/.env
# غيّر السطر:

DATABASE_URL="postgresql://postgres.xxxxx@xxxxx.supabase.co:5432/postgres?schema=public"
```

استبدل:
- `xxxxx` بـ بيانات project الخاص بك من Supabase
- تأكد من وجود `?schema=public` في نهاية الـ URL

### الخطوة 4: تطبيق الـ Migrations

```bash
cd backend

# تحديث قاعدة البيانات
npx prisma migrate deploy

# إضافة البيانات الأولية
npm run db:seed
```

## التحقق من الاتصال

### 1️⃣ عبر Prisma
```bash
cd backend

# فتح Prisma Studio (واجهة عرض البيانات)
npx prisma studio
```

سيفتح http://localhost:5555 حيث تقدر تشوف وتعدّل البيانات مباشرة

### 2️⃣ عبر Supabase Dashboard
```
Supabase → Editor → اختر جدول → شاهد البيانات
```

### 3️⃣ عبر التطبيق
```bash
# ابدأ Backend
npm run start:dev

# افتح http://localhost:3001/api/v1/health
# يجب ترى: { "status": "ok" }
```

## بنية البيانات

### الجداول الموجودة:

```
┌─────────────────────────────────┐
│         users                   │
├─────────────────────────────────┤
│ id, email, password, firstName  │
│ lastName, role, isActive        │
└─────────────────────────────────┘
           ↓ (has many)
┌─────────────────────────────────┐
│         roles                   │
├─────────────────────────────────┤
│ id, name, description           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      permissions                │
├─────────────────────────────────┤
│ id, resource, action            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│       content                   │
├─────────────────────────────────┤
│ id, title, description, status  │
│ views, authorId, createdAt      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│     notifications               │
├─────────────────────────────────┤
│ id, title, message, userId      │
│ isRead, createdAt               │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      activity_logs              │
├─────────────────────────────────┤
│ id, userId, action, resource    │
│ details, createdAt              │
└─────────────────────────────────┘
```

## الملفات المهمة

```
backend/
├── .env                          # ← ضع DATABASE_URL هنا
├── src/
│   ├── main.ts                   # نقطة الدخول
│   ├── app.module.ts             # الـ Root Module
│   └── modules/                  # الـ Features
│       ├── auth/
│       ├── users/
│       ├── content/
│       ├── roles/
│       ├── permissions/
│       ├── notifications/
│       └── logs/
└── prisma/
    ├── schema.prisma             # ← التعريف الكامل للـ Schema
    └── migrations/               # ← سجل التغييرات
```

## الأوامر الأساسية

```bash
# في مجلد backend

# عرض البيانات في واجهة رسومية
npx prisma studio

# تطبيق التغييرات على قاعدة البيانات
npx prisma migrate deploy

# إنشاء client جديد (بعد تعديل schema)
npx prisma generate

# إضافة بيانات اختبارية
npm run db:seed

# عرض الـ Migrations
npx prisma migrate status

# إرجاع آخر تغيير (للتطوير فقط)
npx prisma migrate resolve
```

## مثال: إضافة جدول جديد

### 1. تعديل schema.prisma

```prisma
// في backend/prisma/schema.prisma
model Blog {
  id    String  @id @default(cuid())
  title String
  content String @db.Text
  authorId String
  author User @relation(fields: [authorId], references: [id])
  
  @@index([authorId])
}

// تحديث User model
model User {
  // ... fields الموجودة
  blogs Blog[]  // العلاقة الجديدة
}
```

### 2. تطبيق المغيّر

```bash
npx prisma migrate dev --name add_blog_table
```

### 3. الآن الجدول موجود على Supabase! ✅

## الأمان

⚠️ **نصائح مهمة:**

1. **لا ترفع .env على GitHub:**
   ```bash
   # تأكد من .gitignore يحتوي:
   .env
   .env.local
   ```

2. **استخدم متغيرات آمنة:**
   ```bash
   # في production استخدم:
   DATABASE_URL=<from-supabase-dashboard>
   JWT_SECRET=<generate-strong-random-string>
   ```

3. **Row Level Security (RLS):**
   - يمكن تفعيل في Supabase للتحكم من يرى إيه
   - اقرأ Supabase docs لزيادة الأمان

## Troubleshooting

### ❌ خطأ: "relation \"users\" does not exist"
```bash
# الحل: تطبيق الـ migrations
npx prisma migrate deploy
```

### ❌ خطأ: "FATAL: invalid username/password"
```bash
# الحل: التحقق من DATABASE_URL في .env
# تأكد من نسخ الـ string كاملاً من Supabase
```

### ❌ Prisma Studio لا يفتح
```bash
# جرب:
npx prisma studio --browser=none
# ثم افتح http://localhost:5555 يدوياً
```

### ❌ البيانات لا تظهر في Supabase Dashboard
```bash
# قد تكون مختفية بسبب:
# 1. Schema publish ما تم
# 2. الجدول فارغ فعلاً
# جرب اضافة بيانات يدوياً عبر Prisma Studio
```

## الخطوات التالية

1. ✅ ربط Supabase
2. ✅ تطبيق الـ Migrations
3. ✅ إضافة البيانات الأساسية
4. ⬜ (الاختياري) إضافة جداول جديدة
5. ⬜ (الاختياري) تفعيل RLS للأمان الإضافي

---

## مراجع إضافية

- Prisma + Supabase: https://supabase.com/partners/integrations/prisma
- Prisma Docs: https://www.prisma.io/docs/
- Supabase Database: https://supabase.com/docs/guides/database
- Prisma Studio: https://www.prisma.io/studio

---

**هل تحتاج مساعدة في أي خطوة؟ قول لي! 🚀**
