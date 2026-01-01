# 🔍 فحص شامل للـ APIs

## ✅ 1. Login API
**Endpoint:** `POST /api/accounts/auth/login/`
**Status:** ✅ جاهز
**التحقق:**
- [x] Endpoint صحيح
- [x] حفظ tokens في localStorage
- [x] حفظ user في localStorage
- [x] معالجة الأخطاء

---

## ✅ 2. Dashboard API
**Endpoints:**
- `GET /api/accounts/students/` - جلب الطلاب
- `GET /api/accounts/supervisors/` - جلب المشرفين
- `GET /api/audit/statistics/` - إحصائيات Audit
- `GET /api/evaluations/` - التقييمات
- `GET /api/cases/` - الحالات
- `GET /api/reports/` - التقارير
- `GET /api/community/moderation/pending/` - المحتوى المعلق

**Status:** ⚠️ يحتاج فحص

---

## ✅ 3. Academic Structure API
**Endpoints:**
- `GET /api/universities/<university_id>/` - تفاصيل الجامعة
- `PATCH /api/universities/<university_id>/update/` - تحديث الجامعة
- `GET /api/universities/<university_id>/faculties/` - الكليات
- `POST /api/universities/<university_id>/faculties/` - إنشاء كلية
- `PATCH /api/universities/<university_id>/faculties/<faculty_id>/update/` - تحديث كلية
- `DELETE /api/universities/<university_id>/faculties/<faculty_id>/delete/` - حذف كلية
- `GET /api/universities/<university_id>/programs/` - البرامج
- `POST /api/universities/<university_id>/programs/` - إنشاء برنامج
- `PATCH /api/universities/<university_id>/programs/<program_id>/update/` - تحديث برنامج
- `DELETE /api/universities/<university_id>/programs/<program_id>/delete/` - حذف برنامج
- `GET /api/universities/<university_id>/academic-years/` - السنوات الأكاديمية
- `POST /api/universities/<university_id>/academic-years/` - إنشاء سنة
- `PATCH /api/universities/<university_id>/academic-years/<year_id>/update/` - تحديث سنة
- `DELETE /api/universities/<university_id>/academic-years/<year_id>/delete/` - حذف سنة

**Status:** ⚠️ يحتاج فحص - المشكلة: جلب university_id

---

## ✅ 4. Clinical Cases API
**Endpoints:**
- `GET /api/cases/` - قائمة الحالات
- `GET /api/cases/<case_id>/` - تفاصيل حالة

**Status:** ⚠️ يحتاج فحص

---

## ✅ 5. Evaluations API
**Endpoints:**
- `GET /api/evaluations/` - قائمة التقييمات
- `GET /api/evaluations/<evaluation_id>/` - تفاصيل تقييم
- `POST /api/evaluations/` - إنشاء تقييم
- `PATCH /api/evaluations/<evaluation_id>/` - تحديث تقييم
- `POST /api/evaluations/<evaluation_id>/submit/` - تقديم تقييم
- `POST /api/evaluations/<evaluation_id>/finalize/` - تثبيت تقييم

**Status:** ⚠️ يحتاج فحص

---

## ✅ 6. Appointments API
**Endpoints:**
- `GET /api/appointments/` - قائمة المواعيد
- `GET /api/appointments/<appointment_id>/` - تفاصيل موعد

**Status:** ⚠️ يحتاج فحص

---

## ✅ 7. Supervisors API
**Endpoints:**
- `GET /api/accounts/supervisors/` - قائمة المشرفين
- `GET /api/accounts/supervisors/<supervisor_id>/` - تفاصيل مشرف
- `POST /api/accounts/supervisors/create/` - إنشاء مشرف
- `PATCH /api/accounts/supervisors/<supervisor_id>/update/` - تحديث مشرف
- `DELETE /api/accounts/supervisors/<supervisor_id>/delete/` - حذف مشرف

**Status:** ⚠️ يحتاج فحص

---

## ✅ 8. Students API
**Endpoints:**
- `GET /api/accounts/students/` - قائمة الطلاب
- `GET /api/accounts/students/<student_id>/` - تفاصيل طالب
- `POST /api/accounts/students/create/` - إنشاء طالب
- `PATCH /api/accounts/students/<student_id>/update/` - تحديث طالب
- `DELETE /api/accounts/students/<student_id>/delete/` - حذف طالب

**Status:** ⚠️ يحتاج فحص

---

## ✅ 9. Reports API
**Endpoints:**
- `GET /api/reports/` - قائمة التقارير
- `GET /api/reports/<report_id>/` - تفاصيل تقرير
- `POST /api/reports/` - إنشاء تقرير
- `PATCH /api/reports/<report_id>/` - تحديث تقرير
- `DELETE /api/reports/<report_id>/` - حذف تقرير

**Status:** ⚠️ يحتاج فحص

---

## ✅ 10. Community Content API
**Endpoints:**
- `GET /api/community/` - قائمة المحتوى
- `GET /api/community/<content_id>/` - تفاصيل محتوى
- `POST /api/community/` - إنشاء محتوى
- `PATCH /api/community/<content_id>/` - تحديث محتوى
- `DELETE /api/community/<content_id>/` - حذف محتوى
- `POST /api/community/<content_id>/approve/` - الموافقة على محتوى
- `POST /api/community/<content_id>/reject/` - رفض محتوى
- `GET /api/community/moderation/pending/` - المحتوى المعلق

**Status:** ⚠️ يحتاج فحص

---

## 🎯 خطة الفحص:
1. ✅ Login - جاهز
2. ⏭️ Dashboard - التالي
3. ⏭️ Academic Structure
4. ⏭️ Clinical Cases
5. ⏭️ Evaluations
6. ⏭️ Appointments
7. ⏭️ Supervisors
8. ⏭️ Students
9. ⏭️ Reports
10. ⏭️ Community Content





















