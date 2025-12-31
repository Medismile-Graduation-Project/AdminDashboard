# 📅 ربط المواعيد مع الجامعة

## 📋 نظرة عامة

تم ربط endpoint `GET /api/appointments/` مع نظام الجامعة لتمكين مسؤول الجامعة من جلب جميع المواعيد ضمن جامعته تلقائياً.

---

## 🔗 الربط

### 1. **API Layer** (`src/services/appointmentsApi.js`)

```javascript
/**
 * جلب جميع المواعيد
 * GET /api/appointments/
 * 
 * ملاحظات:
 * - مسؤول الجامعة (university_admin): يجلب جميع المواعيد ضمن جامعته تلقائياً
 *   (Backend يفلتر حسب university_id من Token)
 * - المشرف (supervisor): يجلب مواعيده فقط
 */
export const fetchAppointments = async (params = {}) => {
  // ...
}
```

### 2. **University API Helper** (`src/services/universityApi.js`)

```javascript
/**
 * جلب المواعيد لمسؤول الجامعة (ضمن جامعته)
 * GET /api/appointments/
 * 
 * ملاحظات:
 * - Backend يفلتر تلقائياً حسب university_id من Token
 * - مسؤول الجامعة يرى جميع المواعيد ضمن جامعته
 */
export const fetchUniversityAppointments = async (params = {}) => {
  const appointments = await fetchAppointments(params);
  return appointments;
}
```

### 3. **Redux Layer** (`src/redux/features/appointments/appointmentsSlice.js`)

```javascript
export const fetchAppointmentsAsync = createAsyncThunk(
  "appointments/fetchAppointments",
  async (params = {}, { rejectWithValue }) => {
    const data = await fetchAppointments(params);
    // ...
  }
);
```

### 4. **UI Component** (`src/app/university-appointments/page.jsx`)

```javascript
// جلب المواعيد عند تحميل الصفحة
// الـ backend يفترض أن يفلتر حسب الجامعة تلقائياً للدور university_admin
useEffect(() => {
  const params = {};
  if (statusFilter !== "all") {
    params.status = statusFilter;
  }
  dispatch(fetchAppointmentsAsync(params));
}, [dispatch, statusFilter]);
```

---

## 🔄 آلية العمل

### تدفق جلب المواعيد:

```
1. المستخدم (مسؤول الجامعة) يفتح صفحة المواعيد
   ↓
2. useEffect في university-appointments/page.jsx
   ↓
3. dispatch(fetchAppointmentsAsync(params))
   ↓
4. fetchAppointmentsAsync في appointmentsSlice.js
   ↓
5. fetchAppointments() في appointmentsApi.js
   ↓
6. GET /api/appointments/
   Headers: { Authorization: "Bearer <token>" }
   ↓
7. Backend:
   - يقرأ Token
   - يستخرج university_id من Token
   - يفلتر المواعيد حسب university_id
   - يعيد المواعيد المفلترة
   ↓
8. Frontend:
   - يستقبل المواعيد
   - يعرضها في الجدول
```

---

## 🔐 الأمان

- **Backend يتحقق تلقائياً**: 
  - يقرأ `university_id` من Token
  - يفلتر المواعيد حسب `university_id`
  - لا يمكن لمسؤول جامعة رؤية مواعيد جامعات أخرى

- **لا حاجة لتمرير university_id**:
  - يتم استخراجه تلقائياً من Token
  - لا يمكن التلاعب به من Frontend

---

## 📊 Query Parameters المدعومة

يمكن تمرير معاملات اختيارية للفلترة:

```javascript
const params = {
  status: "scheduled",        // حالة الموعد
  patient_id: 123,            // معرف المريض
  user_id: 456,               // معرف المستخدم (المشرف)
  case_id: 789,               // معرف الحالة السريرية
};

dispatch(fetchAppointmentsAsync(params));
```

---

## 🎯 حالات المواعيد المدعومة

- `scheduled` - مجدول
- `confirmed` - مؤكد
- `in_progress` - قيد التنفيذ
- `completed` - مكتمل
- `cancelled` - ملغي
- `no_show` - عدم الحضور

---

## 📂 الملفات المتعلقة

### ملفات API:
- `src/services/appointmentsApi.js` - API service للمواعيد
- `src/services/universityApi.js` - دالة مساعدة `fetchUniversityAppointments`

### ملفات Redux:
- `src/redux/features/appointments/appointmentsSlice.js` - Redux slice للمواعيد

### ملفات UI:
- `src/app/university-appointments/page.jsx` - صفحة مواعيد الجامعة

---

## ✅ الاختبار

لاختبار الربط:

1. سجل دخول كمسؤول جامعة
2. افتح صفحة `/university-appointments`
3. يجب أن تظهر جميع المواعيد ضمن جامعتك
4. جرب الفلترة حسب الحالة (status)
5. تحقق من أن المواعيد المفلترة صحيحة

---

## 🔍 ملاحظات مهمة

1. **الفلترة التلقائية**: Backend يفلتر تلقائياً حسب `university_id` من Token
2. **لا حاجة لتمرير university_id**: يتم استخراجه تلقائياً
3. **الأمان**: لا يمكن لمسؤول جامعة رؤية مواعيد جامعات أخرى
4. **الأداء**: يمكن إضافة Pagination لاحقاً إذا كانت المواعيد كثيرة

---

**تاريخ الإنشاء**: 2025-01-XX
**آخر تحديث**: 2025-01-XX








