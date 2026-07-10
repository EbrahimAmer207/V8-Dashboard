# خطوات التشغيل الكاملة

## 📋 المتطلبات الأساسية
- ✅ Node.js مثبت
- ✅ npm مثبت
- ✅ Git (اختياري)
- ✅ حساب Supabase

## 🚀 الخطوة 1: إعداد Supabase (مرة واحدة فقط)

### أ. إنشاء حساب وProject
1. اذهب إلى https://supabase.com
2. اضغط **Sign Up** (Gmail أو GitHub)
3. اضغط **New Project**
4. ملء البيانات:
   ```
   Name: admin_dashboard
   Password: كلمة قوية
   Region: أقرب منطقة ليك
   ```

### ب. الحصول على Connection String
1. بعد إنشاء المشروع، اذهب إلى **Settings** → **Database**
2. ابحث عن **Connection string**
3. انسخ الـ string في صيغة Session

### ج. تحديث ملف البيئة
```bash
# افتح backend/.env
# غيّر DATABASE_URL بـ Connection String من Supabase
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

---

## ⚙️ الخطوة 2: التثبيت الأول

### أ. تثبيت Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

cd ..
```

### ب. إعداد قاعدة البيانات
```bash
cd backend

# إنشاء الجداول
npm run db:migrate

# إضافة بيانات اختبارية
npm run db:seed

cd ..
```

---

## ▶️ الخطوة 3: تشغيل المشروع

### 🔧 الطريقة 1: استخدام Terminal منفصلة

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

يجب أن ترى:
```
[NestFactory] Nest application successfully started
Listening on port 3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

يجب أن ترى:
```
▲ Next.js 14.0.0
Local:        http://localhost:3000
```

### 🔧 الطريقة 2: استخدام VS Code Tasks

أو يمكن استخدام VS Code كـ:
- اضغط `Ctrl+Shift+B`
- اختر **Backend** أو **Frontend**

---

## 🔐 تسجيل الدخول

بعد تشغيل كليهما:

1. اذهب إلى http://localhost:3000
2. اضغط **Sign In** (أو **Sign Up** للمرة الأولى)
3. استخدم بيانات الاختبار:
   ```
   Email: admin@example.com
   Password: admin123
   ```

---

## 📱 استكشاف الميزات

### 1. لوحة التحكم
- عرض الإحصائيات (عدد المستخدمين، المحتوى، إلخ)
- آخر الأنشطة

### 2. إدارة المستخدمين
- عرض قائمة المستخدمين
- إضافة مستخدم جديد
- تعديل البيانات
- تغيير الدور (Admin/Editor/User)

### 3. إدارة المحتوى
- إضافة محتوى جديد
- البحث والتصفية
- نشر/استبدال المحتوى

### 4. الإشعارات
- عرض الإشعارات
- تحديد كأنها مقروءة

### 5. التحليلات
- إحصائيات الاستخدام
- الرسوم البيانية

### 6. الإعدادات
- تحديث الملف الشخصي
- تغيير كلمة المرور
- معلومات الحساب

---

## 🐛 استكشاف الأخطاء

### البرنامج لا يبدأ

**خطأ: Connection refused**
```bash
# تأكد من DATABASE_URL صحيح في backend/.env
# وأن Supabase Project مفعّل
```

**خطأ: Module not found**
```bash
# أعد تثبيت Dependencies:
npm install
```

**خطأ: Port already in use**
```bash
# غيّر PORT في backend/.env
PORT=3002
```

### API لا يرد

**تحقق من Console في Browser:**
- اضغط `F12`
- انظر إلى Network tab
- تأكد من الـ requests going إلى http://localhost:3001/api/v1

---

## 📊 عرض البيانات في Supabase

1. اذهب إلى Supabase Dashboard
2. اختر **Editor** → **Tables**
3. اختر جدول (مثل `users`)
4. شاهد جميع البيانات مباشرة
5. يمكنك حتى تعديل البيانات يدوياً

---

## 🔄 الأوامر المفيدة

```bash
# Backend
npm run start:dev      # تشغيل وضع التطوير
npm run build          # بناء المشروع
npm run test           # تشغيل الاختبارات
npm run db:migrate     # تطبيق الـ migrations
npm run db:seed        # إضافة البيانات الأولية

# Frontend
npm run dev            # وضع التطوير
npm run build          # بناء للإنتاج
npm run lint           # فحص الأخطاء
npm run type-check     # فحص أنواع البيانات
```

---

## 📚 الملفات المهمة

| الملف | الغرض |
|-------|--------|
| `backend/.env` | متغيرات البيئة (ضروري!) |
| `backend/prisma/schema.prisma` | هيكل قاعدة البيانات |
| `frontend/.env` | متغيرات Frontend البيئة |
| `backend/src/main.ts` | نقطة دخول Backend |
| `frontend/app/layout.tsx` | Layout الرئيسي للـ Frontend |

---

## ✅ Checklist قبل الإنتاج

- [ ] جميع Variables البيئة مضبوطة
- [ ] قاعدة البيانات متصلة وتعمل
- [ ] جميع الـ APIs تعمل
- [ ] Frontend يفتح بدون أخطاء
- [ ] التسجيل والدخول يعملان
- [ ] جميع الصفحات accessible
- [ ] الأخطاء موجودة في Console

---

## 🎯 الخطوات التالية

1. **التخصيص:**
   - غيّر الألوان في `frontend/styles/variables.scss`
   - غيّر الـ Logo والـ Branding
   - أضف الميزات الخاصة بك

2. **الإنتاج:**
   - اتبع `DEPLOYMENT.md` للنشر
   - استخدم Vercel للـ Frontend
   - استخدم Railway أو Render للـ Backend

3. **الصيانة:**
   - راقب الأخطاء في الـ Logs
   - قم بـ Backups منتظمة
   - حدّث Dependencies بانتظام

---

## 📞 الدعم

إذا واجهت أي مشكلة:

1. اقرأ الأخطاء في Console
2. تحقق من الـ Network tab
3. اطلع على المشاكل الشائعة أعلاه
4. اقرأ التوثيق الكامل في `SETUP.md` و `ARCHITECTURE.md`

---

**مبروك! 🎉 مشروعك جاهز للعمل!**
