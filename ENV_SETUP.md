# إعداد متغيرات البيئة (Environment Variables)

## ملف .env.local

قم بإنشاء ملف `.env.local` في المجلد الرئيسي للمشروع (`my-next15-project/`) وأضف المتغير التالي:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## الاستخدام

جميع APIs في المشروع تستخدم هذا المتغير من خلال:

1. **ملف الإعدادات الأساسي**: `src/services/api.js`
   - يستخدم `process.env.NEXT_PUBLIC_API_BASE_URL`
   - القيمة الافتراضية: `http://localhost:8000/api`

2. **جميع API Services تستخدم `apiClient`**:
   - ✅ `studentsApi.js` - إدارة الطلاب
   - ✅ `patientsApi.js` - إدارة المرضى
   - ✅ `appointmentsApi.js` - إدارة المواعيد
   - ✅ `casesApi.js` - إدارة الحالات السريرية

## مثال على .env.local

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

أو للإنتاج:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

## ملاحظات مهمة

1. **ملف `.env.local` غير متضمن في Git** (موجود في `.gitignore`)
2. **يجب إعادة تشغيل السيرفر** بعد تغيير متغيرات البيئة
3. **استخدم `NEXT_PUBLIC_`** للوصول إلى المتغيرات في الكود الـ Client-side





















