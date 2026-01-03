# 🔍 خطة فحص APIs - University Admin

## ✅ 1. Login API
**Status:** ✅ جاهز ومربوط
**التحقق:**
- [x] Endpoint: `POST /api/accounts/auth/login/`
- [x] حفظ tokens في localStorage
- [x] حفظ user في localStorage
- [x] معالجة الأخطاء
- [x] Token refresh mechanism

**الملفات:**
- `src/redux/features/auth/authSlice.js` - Login logic
- `src/services/api.js` - Axios interceptors
- `src/components/login.jsx` - UI

---

## ⏭️ 2. Dashboard API
**Status:** ✅ جاهز - يحتاج فحص
**Endpoints:**
- `GET /api/accounts/students/` ✅
- `GET /api/accounts/supervisors/` ✅
- `GET /api/audit/statistics/` ⚠️ (قد يعيد 500)
- `GET /api/evaluations/` ✅
- `GET /api/cases/` ✅
- `GET /api/reports/` ✅
- `GET /api/community/moderation/pending/` ⚠️ (قد يعيد 500)

**الملفات:**
- `src/services/dashboardApi.js` - جميع APIs
- `src/components/dashboard/UniversityAdminDashboard.jsx` - UI

**التحقق المطلوب:**
- [ ] فحص كل endpoint يعمل بشكل صحيح
- [ ] التحقق من معالجة الأخطاء (500 errors)

---

## ⏭️ 3. Academic Structure API
**Status:** ⚠️ يحتاج فحص - المشكلة: جلب university_id
**Endpoints:**
- `GET /api/universities/<university_id>/` ⚠️
- `PATCH /api/universities/<university_id>/update/` ⚠️
- `GET /api/universities/<university_id>/faculties/` ⚠️
- `POST /api/universities/<university_id>/faculties/` ⚠️ (الحقول: name, description)
- `PATCH /api/universities/<university_id>/faculties/<faculty_id>/update/` ⚠️
- `DELETE /api/universities/<university_id>/faculties/<faculty_id>/delete/` ⚠️
- `GET /api/universities/<university_id>/programs/` ⚠️
- `POST /api/universities/<university_id>/programs/` ⚠️
- `PATCH /api/universities/<university_id>/programs/<program_id>/update/` ⚠️
- `DELETE /api/universities/<university_id>/programs/<program_id>/delete/` ⚠️
- `GET /api/universities/<university_id>/academic-years/` ⚠️
- `POST /api/universities/<university_id>/academic-years/` ⚠️
- `PATCH /api/universities/<university_id>/academic-years/<year_id>/update/` ⚠️
- `DELETE /api/universities/<university_id>/academic-years/<year_id>/delete/` ⚠️

**الملفات:**
- `src/services/universityApi.js` - جميع APIs
- `src/app/academic-structure/page.jsx` - UI

**المشكلة الحالية:**
- ❌ لا يمكن جلب `university_id` من `user` object
- ⚠️ يحاول جلب `university_id` من عدة مصادر

**التحقق المطلوب:**
- [ ] التحقق من كيفية جلب `university_id` من API
- [ ] فحص إنشاء كلية (name, description فقط)
- [ ] فحص جميع CRUD operations

---

## ⏭️ 4. Clinical Cases API
**Status:** ⚠️ يحتاج فحص
**Endpoints:**
- `GET /api/cases/` - قائمة الحالات (read-only)
- `GET /api/cases/<case_id>/` - تفاصيل حالة

**الملفات:**
- `src/services/casesApi.js`
- `src/app/university-cases/page.jsx`
- `src/app/university-cases/[id]/page.jsx`

**التحقق المطلوب:**
- [ ] فحص جلب قائمة الحالات
- [ ] فحص جلب تفاصيل حالة
- [ ] التحقق من الفلترة حسب university_id (Backend)

---

## ⏭️ 5. Evaluations API
**Status:** ⚠️ يحتاج فحص
**Endpoints:**
- `GET /api/evaluations/` - قائمة التقييمات
- `GET /api/evaluations/<evaluation_id>/` - تفاصيل تقييم
- `POST /api/evaluations/` - إنشاء تقييم
- `PATCH /api/evaluations/<evaluation_id>/` - تحديث تقييم
- `POST /api/evaluations/<evaluation_id>/submit/` - تقديم تقييم
- `POST /api/evaluations/<evaluation_id>/finalize/` - تثبيت تقييم

**الملفات:**
- `src/services/evaluationsApi.js`
- `src/redux/features/evaluations/evaluationsSlice.js`
- `src/app/evaluations/page.jsx`

**التحقق المطلوب:**
- [ ] فحص جميع CRUD operations
- [ ] فحص submit و finalize
- [ ] التحقق من الحقول المرسلة

---

## ⏭️ 6. Appointments API
**Status:** ⚠️ يحتاج فحص
**Endpoints:**
- `GET /api/appointments/` - قائمة المواعيد (read-only)
- `GET /api/appointments/<appointment_id>/` - تفاصيل موعد

**الملفات:**
- `src/services/appointmentsApi.js`
- `src/redux/features/appointments/appointmentsSlice.js`
- `src/app/university-appointments/page.jsx`

**التحقق المطلوب:**
- [ ] فحص جلب قائمة المواعيد
- [ ] فحص جلب تفاصيل موعد
- [ ] التحقق من الفلترة حسب university_id (Backend)

---

## ⏭️ 7. Supervisors API
**Status:** ⚠️ يحتاج فحص
**Endpoints:**
- `GET /api/accounts/supervisors/` - قائمة المشرفين
- `GET /api/accounts/supervisors/<supervisor_id>/` - تفاصيل مشرف
- `POST /api/accounts/supervisors/create/` - إنشاء مشرف
- `PATCH /api/accounts/supervisors/<supervisor_id>/update/` - تحديث مشرف
- `DELETE /api/accounts/supervisors/<supervisor_id>/delete/` - حذف مشرف

**الملفات:**
- `src/services/supervisorsApi.js`
- `src/redux/features/supervisors/supervisorsSlice.js`
- `src/app/users/supervisors/page.jsx`

**التحقق المطلوب:**
- [ ] فحص جميع CRUD operations
- [ ] التحقق من الحقول المرسلة

---

## ⏭️ 8. Students API
**Status:** ⚠️ يحتاج فحص
**Endpoints:**
- `GET /api/accounts/students/` - قائمة الطلاب
- `GET /api/accounts/students/<student_id>/` - تفاصيل طالب
- `POST /api/accounts/students/create/` - إنشاء طالب
- `PATCH /api/accounts/students/<student_id>/update/` - تحديث طالب
- `DELETE /api/accounts/students/<student_id>/delete/` - حذف طالب

**الملفات:**
- `src/services/studentsApi.js`
- `src/redux/features/students/studentsSlice.js`
- `src/app/users/students/page.jsx`

**التحقق المطلوب:**
- [ ] فحص جميع CRUD operations
- [ ] التحقق من الحقول المرسلة

---

## ⏭️ 9. Reports API
**Status:** ⚠️ يحتاج فحص
**Endpoints:**
- `GET /api/reports/` - قائمة التقارير
- `GET /api/reports/<report_id>/` - تفاصيل تقرير
- `POST /api/reports/` - إنشاء تقرير
- `PATCH /api/reports/<report_id>/` - تحديث تقرير
- `DELETE /api/reports/<report_id>/` - حذف تقرير

**الملفات:**
- `src/services/reportsApi.js`
- `src/redux/features/reports/reportsSlice.js`
- `src/app/reports/page.jsx`

**التحقق المطلوب:**
- [ ] فحص جميع CRUD operations
- [ ] التحقق من الحقول المرسلة

---

## ⏭️ 10. Community Content API
**Status:** ⚠️ يحتاج فحص
**Endpoints:**
- `GET /api/community/` - قائمة المحتوى
- `GET /api/community/<content_id>/` - تفاصيل محتوى
- `POST /api/community/<content_id>/approve/` - الموافقة على محتوى
- `POST /api/community/<content_id>/reject/` - رفض محتوى
- `GET /api/community/moderation/pending/` - المحتوى المعلق

**الملفات:**
- `src/services/communityApi.js`
- `src/redux/features/mediContent/mediContentSlice.js`
- `src/app/community/page.jsx` (مفقود - تم حذفه)

**التحقق المطلوب:**
- [ ] فحص جلب المحتوى
- [ ] فحص approve/reject
- [ ] إعادة إنشاء صفحة Community Content

---

## 🎯 خطة العمل:

### المرحلة 1: الأساسيات ✅
1. ✅ Login API - جاهز
2. ⏭️ Dashboard API - فحص سريع

### المرحلة 2: المشكلة الأساسية ⚠️
3. ⚠️ Academic Structure - حل مشكلة `university_id`

### المرحلة 3: باقي الـ Modules
4. ⏭️ Clinical Cases
5. ⏭️ Evaluations
6. ⏭️ Appointments
7. ⏭️ Supervisors
8. ⏭️ Students
9. ⏭️ Reports
10. ⏭️ Community Content

---

## 📝 ملاحظات:
- جميع الـ APIs تستخدم `apiClient` من `src/services/api.js`
- Token يتم إضافته تلقائياً عبر interceptors
- Backend يفلتر تلقائياً حسب `university_id` من Token
- معالجة الأخطاء موجودة في معظم الـ APIs


























