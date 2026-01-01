# 📋 متطلبات وحدة الجامعات (Universities)

## 🎯 الهدف
بناء واجهة كاملة لإدارة البنية الأكاديمية لمسؤول الجامعة مع صلاحيات:
- ✅ **إضافة** (Create)
- ✅ **تعديل** (Update)
- ✅ **حذف** (Delete)
- ✅ **عرض** (Read)

---

## 📚 ما نحتاج لتنفيذه

### 1️⃣ **الجامعات (Universities)**

#### APIs المطلوبة:
- ✅ `GET /api/universities/<university_id>/` - عرض تفاصيل الجامعة
- ✅ `PATCH /api/universities/<university_id>/update/` - تحديث بيانات الجامعة
- ❌ `DELETE /api/universities/<university_id>/delete/` - حذف/تعطيل (غير مطلوب - مسؤول الجامعة لا يحذف جامعته)

#### الحقول القابلة للتعديل:
- `name` - اسم الجامعة
- `short_name` - الاسم المختصر
- `description` - الوصف
- `address` - العنوان
- `city` - المدينة
- `country` - الدولة
- `website` - الموقع الإلكتروني
- `email` - البريد الإلكتروني
- `phone` - رقم الهاتف
- `logo` - الشعار (صورة)

---

### 2️⃣ **الكليات (Faculties)**

#### APIs المطلوبة:
- ✅ `GET /api/universities/<university_id>/faculties/` - قائمة الكليات
- ✅ `POST /api/universities/<university_id>/faculties/` - إنشاء كلية
- ❌ `PATCH /api/universities/<university_id>/faculties/<faculty_id>/update/` - **مفقود في الكود الحالي**
- ❌ `DELETE /api/universities/<university_id>/faculties/<faculty_id>/delete/` - **مفقود في الكود الحالي**

#### الحقول:
- `name` - اسم الكلية (مطلوب)
- `description` - الوصف (اختياري)
- `code` - رمز الكلية (اختياري - غير موجود في التوثيق لكن موجود في الكود)

---

### 3️⃣ **البرامج الأكاديمية (Academic Programs)**

#### APIs المطلوبة:
- ✅ `GET /api/universities/<university_id>/programs/` - قائمة البرامج
- ✅ `POST /api/universities/<university_id>/programs/` - إنشاء برنامج
- ❌ `PATCH /api/universities/<university_id>/programs/<program_id>/update/` - **مفقود في الكود الحالي**
- ❌ `DELETE /api/universities/<university_id>/programs/<program_id>/delete/` - **مفقود في الكود الحالي**

#### الحقول:
- `name` - اسم البرنامج (مطلوب)
- `code` - رمز البرنامج (مطلوب، فريد داخل الجامعة)
- `faculty` - الكلية (اختياري - UUID)
- `level` - المستوى الأكاديمي (مطلوب: `bachelor`, `master`, `doctorate`, `diploma`, `certificate`)
- `duration_years` - مدة البرنامج بالسنوات (اختياري)
- `description` - الوصف (اختياري)

---

### 4️⃣ **السنوات الأكاديمية (Academic Years)**

#### APIs المطلوبة:
- ✅ `GET /api/universities/<university_id>/academic-years/` - قائمة السنوات
- ✅ `POST /api/universities/<university_id>/academic-years/` - إنشاء سنة أكاديمية
- ❌ `PATCH /api/universities/<university_id>/academic-years/<year_id>/update/` - **مفقود في الكود الحالي**
- ❌ `DELETE /api/universities/<university_id>/academic-years/<year_id>/delete/` - **مفقود في الكود الحالي**

#### الحقول:
- `name` - اسم السنة (مطلوب، فريد داخل الجامعة)
- `start_date` - تاريخ البداية (مطلوب)
- `end_date` - تاريخ النهاية (مطلوب)
- `is_active` - السنة النشطة (اختياري - boolean)
- `description` - الوصف (اختياري - غير موجود في التوثيق لكن موجود في الكود)

---

## 🔍 ما هو موجود حالياً

### ✅ موجود:
1. **universityApi.js** - يحتوي على:
   - `fetchUniversityDetails()` - ✅
   - `updateUniversityDetails()` - ✅
   - `fetchFaculties()` - ✅
   - `createFaculty()` - ✅
   - `fetchPrograms()` - ✅
   - `createProgram()` - ✅
   - `fetchAcademicYears()` - ✅
   - `createAcademicYear()` - ✅

2. **universitySlice.js** - Redux slice مع:
   - جميع الـ async thunks للقراءة والإنشاء
   - ❌ **لا يوجد async thunks للتعديل والحذف**

3. **academic-structure/page.jsx** - صفحة الواجهة:
   - عرض البيانات ✅
   - إنشاء كليات/برامج/سنوات ✅
   - تحديث بيانات الجامعة ✅
   - ❌ **لا يوجد واجهة للتعديل والحذف للكليات/البرامج/السنوات**

---

## ❌ ما هو مفقود

### 1. APIs للتعديل والحذف:
- ❌ `updateFaculty()` - تحديث كلية
- ❌ `deleteFaculty()` - حذف كلية
- ❌ `updateProgram()` - تحديث برنامج
- ❌ `deleteProgram()` - حذف برنامج
- ❌ `updateAcademicYear()` - تحديث سنة أكاديمية
- ❌ `deleteAcademicYear()` - حذف سنة أكاديمية

### 2. Redux Actions:
- ❌ `updateFacultyAsync`
- ❌ `deleteFacultyAsync`
- ❌ `updateProgramAsync`
- ❌ `deleteProgramAsync`
- ❌ `updateAcademicYearAsync`
- ❌ `deleteAcademicYearAsync`

### 3. واجهة المستخدم:
- ❌ أزرار/أيقونات التعديل والحذف في القوائم
- ❌ نماذج (Modals) للتعديل
- ❌ تأكيد الحذف (Confirmation Dialog)
- ❌ معالجة الأخطاء والنجاح

---

## 📝 خطة التنفيذ

### المرحلة 1: إضافة APIs المفقودة
1. إضافة دوال التعديل والحذف في `universityApi.js`
2. التحقق من صيغة الاستجابة حسب التوثيق

### المرحلة 2: إضافة Redux Actions
1. إضافة async thunks في `universitySlice.js`
2. إضافة reducers لمعالجة الحالات

### المرحلة 3: تحديث الواجهة
1. إضافة أزرار التعديل والحذف في القوائم
2. إنشاء نماذج التعديل
3. إضافة تأكيد الحذف
4. إضافة معالجة الأخطاء والنجاح

### المرحلة 4: التحقق والاختبار
1. التحقق من أن جميع الـ APIs تعمل بشكل صحيح
2. التحقق من معالجة الأخطاء
3. التحقق من تحديث البيانات في الواجهة

---

## ⚠️ ملاحظات مهمة

1. **الصلاحيات**: جميع العمليات تتطلب `IsAuthenticated + IsUniversityAdmin`
2. **نطاق الوصول**: مسؤول الجامعة يرى فقط بيانات جامعته (يتم الفلترة تلقائياً من Backend)
3. **الحذف**: قد يكون Soft Delete (تعطيل) وليس Hard Delete
4. **التحقق**: يجب التحقق من صيغة الاستجابة حسب التوثيق
5. **الأخطاء**: معالجة شاملة لجميع أنواع الأخطاء (400, 403, 404)

---

## ✅ الخطوة التالية

بعد الموافقة، سأبدأ بتنفيذ:
1. إضافة APIs المفقودة في `universityApi.js`
2. إضافة Redux actions في `universitySlice.js`
3. تحديث الواجهة في `academic-structure/page.jsx`

























