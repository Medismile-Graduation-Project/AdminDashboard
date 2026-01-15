# 🔍 شرح نظام البحث - Search System

## 📋 نظرة عامة

تم تطبيق نظام بحث موحد وشامل في المشروع يدعم البحث في جميع أنواع البيانات: الطلاب، المشرفين، الحالات السريرية، المواعيد، والتقييمات.

---

## 🏗️ البنية المعمارية

### 1. **نظام البحث الموحد (Unified Search)**

#### الملف: `src/lib/searchUtils.js`

هذا هو القلب الأساسي لنظام البحث. يحتوي على:

#### أ) دالة البحث العامة `searchInArray`
```javascript
export const searchInArray = (array, query, fields) => {
  // التحقق من صحة المدخلات
  if (!query || !array || !Array.isArray(array)) return [];
  
  // تحويل كلمة البحث إلى حروف صغيرة
  const searchTerm = query.toLowerCase().trim();
  if (searchTerm === "") return [];
  
  // فلترة المصفوفة
  return array.filter(item => {
    if (!item) return false;
    
    // البحث في أي من الحقول المحددة
    return fields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      
      // تحويل القيمة إلى نص والبحث فيها
      const stringValue = String(value).toLowerCase();
      return stringValue.includes(searchTerm);
    });
  });
};
```

**التقنيات المستخدمة:**
- ✅ **Array.filter()** - لفلترة العناصر
- ✅ **Array.some()** - للتحقق من وجود تطابق في أي حقل
- ✅ **String.toLowerCase()** - للبحث غير الحساس لحالة الأحرف (Case-insensitive)
- ✅ **String.includes()** - للبحث الجزئي (Partial Match)

#### ب) دوال البحث المتخصصة

كل نوع بيانات له دالة بحث خاصة تحدد الحقول التي يتم البحث فيها:

```javascript
// البحث في الطلاب
export const searchStudents = (students, query) => {
  return searchInArray(students, query, [
    'first_name',      // الاسم الأول
    'last_name',       // الاسم الأخير
    'email',           // البريد الإلكتروني
    'username',        // اسم المستخدم
    'student_id',      // رقم الطالب
    'specialization'  // التخصص
  ]);
};

// البحث في المشرفين
export const searchSupervisors = (supervisors, query) => {
  return searchInArray(supervisors, query, [
    'first_name',
    'last_name',
    'email',
    'username',
    'department',      // القسم
    'position',        // المنصب
    'license_number'   // رقم الرخصة
  ]);
};

// البحث في الحالات السريرية
export const searchCases = (cases, query) => {
  return searchInArray(cases, query, [
    'title',           // العنوان
    'description',     // الوصف
    'patient_name',    // اسم المريض
    'student_name',    // اسم الطالب
    'supervisor_name', // اسم المشرف
    'status',          // الحالة
    'priority'         // الأولوية
  ]);
};

// البحث في المواعيد
export const searchAppointments = (appointments, query) => {
  return searchInArray(appointments, query, [
    'patient_name',
    'student_name',
    'supervisor_name',
    'title',
    'notes',          // الملاحظات
    'status'
  ]);
};

// البحث في التقييمات
export const searchEvaluations = (evaluations, query) => {
  return searchInArray(evaluations, query, [
    'title',
    'description',
    'student_name',
    'supervisor_name',
    'status'
  ]);
};
```

#### ج) دالة البحث الموحد `unifiedSearch`

تجمع جميع نتائج البحث من جميع الأنواع:

```javascript
export const unifiedSearch = (query, data) => {
  if (!query || query.trim() === "") {
    return {
      students: [],
      supervisors: [],
      cases: [],
      appointments: [],
      evaluations: [],
      total: 0
    };
  }

  // البحث في كل نوع من البيانات
  const students = searchStudents(data.students || [], query);
  const supervisors = searchSupervisors(data.supervisors || [], query);
  const cases = searchCases(data.cases || [], query);
  const appointments = searchAppointments(data.appointments || [], query);
  const evaluations = searchEvaluations(data.evaluations || [], query);

  // حساب العدد الإجمالي
  const total = students.length + supervisors.length + 
                cases.length + appointments.length + evaluations.length;

  return {
    students,
    supervisors,
    cases,
    appointments,
    evaluations,
    total
  };
};
```

---

### 2. **صفحة البحث الموحد**

#### الملف: `src/app/search/page.jsx`

#### أ) جلب البيانات من Redux

```javascript
// جلب البيانات من Redux Store
const { students } = useSelector((state) => state.students);
const { supervisors } = useSelector((state) => state.supervisors);
const { cases } = useSelector((state) => state.clinicalCases);
const { appointments } = useSelector((state) => state.appointments);
const { evaluations } = useSelector((state) => state.evaluations);

// جلب جميع البيانات عند التحميل
useEffect(() => {
  dispatch(fetchStudentsAsync());
  dispatch(fetchSupervisorsAsync());
  dispatch(fetchCases({}));
  dispatch(fetchAppointmentsAsync({}));
  dispatch(fetchEvaluationsAsync({}));
}, [dispatch]);
```

**التقنيات:**
- ✅ **Redux useSelector** - لجلب البيانات من Store
- ✅ **Redux useDispatch** - لإرسال Actions
- ✅ **useEffect** - لجلب البيانات عند التحميل

#### ب) البحث التلقائي

```javascript
// البحث عند تغيير query
useEffect(() => {
  if (searchQuery.trim()) {
    const searchResults = unifiedSearch(searchQuery, {
      students: students || [],
      supervisors: supervisors || [],
      cases: cases || [],
      appointments: appointments || [],
      evaluations: evaluations || []
    });
    setResults(searchResults);
  } else {
    setResults(null);
  }
}, [searchQuery, students, supervisors, cases, appointments, evaluations]);
```

**التقنيات:**
- ✅ **useEffect** - للبحث التلقائي عند تغيير المدخلات
- ✅ **Dependency Array** - لتحديث النتائج عند تغيير البيانات

#### ج) دعم URL Parameters

```javascript
// جلب query من URL
useEffect(() => {
  const queryFromUrl = searchParams.get('q') || '';
  if (queryFromUrl) {
    setSearchQuery(queryFromUrl);
  }
}, [searchParams]);

// تحديث URL عند البحث
const handleSearch = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }
};
```

**التقنيات:**
- ✅ **Next.js useSearchParams** - لقراءة معاملات URL
- ✅ **Next.js useRouter** - للتنقل وتحديث URL
- ✅ **encodeURIComponent** - لتشفير كلمة البحث في URL

#### د) نظام التبويبات (Tabs)

```javascript
const tabs = [
  { id: "all", label: "الكل", icon: Search, count: results?.total || 0 },
  { id: "students", label: "الطلاب", icon: GraduationCap, count: results?.students.length || 0 },
  { id: "supervisors", label: "المشرفين", icon: Users, count: results?.supervisors.length || 0 },
  { id: "cases", label: "الحالات", icon: FileText, count: results?.cases.length || 0 },
  { id: "appointments", label: "المواعيد", icon: Calendar, count: results?.appointments.length || 0 },
  { id: "evaluations", label: "التقييمات", icon: Star, count: results?.evaluations.length || 0 },
];

// تحديد النتائج المعروضة حسب التبويب
const getDisplayedResults = () => {
  if (!results) return null;
  
  switch (activeTab) {
    case "students":
      return { students: results.students };
    case "supervisors":
      return { supervisors: results.supervisors };
    // ... باقي الحالات
    default:
      return results; // عرض الكل
  }
};
```

---

### 3. **البحث المحلي في الصفحات**

#### مثال: صفحة الحالات السريرية (`src/app/university-cases/page.jsx`)

```javascript
// Filter cases locally by search term
const filteredCases = cases.filter((c) => {
  // فلترة البحث
  if (!filters.search) return true;
  const searchTerm = filters.search.toLowerCase();
  return (
    (c.title && c.title.toLowerCase().includes(searchTerm)) ||
    (c.patient_name && c.patient_name.toLowerCase().includes(searchTerm)) ||
    (c.student_name && c.student_name.toLowerCase().includes(searchTerm)) ||
    (c.supervisor_name && c.supervisor_name.toLowerCase().includes(searchTerm)) ||
    (c.description && c.description.toLowerCase().includes(searchTerm))
  );
});
```

**التقنيات:**
- ✅ **Client-side Filtering** - فلترة محلية بدون طلبات API إضافية
- ✅ **Real-time Search** - تحديث فوري عند الكتابة
- ✅ **Multiple Field Search** - البحث في عدة حقول

#### مثال: صفحة الطلاب (`src/app/users/students/page.jsx`)

```javascript
const filteredStudents = students.filter((student) => {
  if (!searchTerm) return true;
  const searchLower = searchTerm.toLowerCase();
  const name = `${student.first_name || ""} ${student.last_name || ""}`.trim();
  return (
    name.toLowerCase().includes(searchLower) ||
    student.email?.toLowerCase().includes(searchLower) ||
    student.student_id?.toLowerCase().includes(searchLower) ||
    student.specialization?.toLowerCase().includes(searchLower)
  );
});
```

---

### 4. **البحث من Navbar**

#### الملف: `src/components/Navbar.jsx`

```javascript
<form 
  onSubmit={(e) => {
    e.preventDefault();
    const searchInput = e.target.querySelector('input');
    if (searchInput && searchInput.value.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
    }
  }}
  className="relative"
>
  <input
    type="text"
    placeholder="بحث..."
    className="..."
  />
</form>
```

**التقنيات:**
- ✅ **Global Search Access** - البحث متاح من أي صفحة
- ✅ **URL-based Navigation** - التوجيه إلى صفحة البحث مع معاملات URL

---

## 🎯 التقنيات المستخدمة

### 1. **JavaScript Array Methods**
- `Array.filter()` - لفلترة العناصر
- `Array.some()` - للتحقق من وجود تطابق
- `Array.map()` - لعرض النتائج

### 2. **String Methods**
- `String.toLowerCase()` - للبحث غير الحساس لحالة الأحرف
- `String.includes()` - للبحث الجزئي
- `String.trim()` - لإزالة المسافات الزائدة

### 3. **React Hooks**
- `useState` - لإدارة حالة البحث والنتائج
- `useEffect` - للبحث التلقائي وجلب البيانات
- `useSelector` - لجلب البيانات من Redux
- `useDispatch` - لإرسال Actions

### 4. **Next.js Features**
- `useRouter` - للتنقل
- `useSearchParams` - لقراءة معاملات URL
- `Suspense` - لتحميل الصفحة بشكل تدريجي

### 5. **Redux Toolkit**
- `useSelector` - لجلب البيانات
- `useDispatch` - لإرسال Actions
- Async Thunks - لجلب البيانات من API

### 6. **UI/UX Enhancements**
- **Framer Motion** - للحركات والانتقالات
- **Lucide Icons** - للأيقونات
- **Tab System** - لتصنيف النتائج
- **Loading States** - لحالات التحميل
- **Empty States** - عند عدم وجود نتائج

---

## 📊 مزايا النظام

### ✅ **البحث الموحد**
- بحث واحد يغطي جميع أنواع البيانات
- واجهة موحدة وسهلة الاستخدام

### ✅ **البحث السريع**
- فلترة محلية بدون طلبات API إضافية
- نتائج فورية عند الكتابة

### ✅ **البحث الشامل**
- البحث في عدة حقول لكل نوع بيانات
- دعم البحث الجزئي (Partial Match)

### ✅ **البحث غير الحساس لحالة الأحرف**
- لا يهم إذا كانت الأحرف كبيرة أو صغيرة

### ✅ **دعم URL Parameters**
- يمكن مشاركة نتائج البحث عبر URL
- دعم الإشارات المرجعية (Bookmarks)

### ✅ **تصنيف النتائج**
- نظام تبويبات لعرض النتائج حسب النوع
- عداد لكل نوع من النتائج

---

## 🔄 تدفق البحث

```
1. المستخدم يكتب في حقل البحث
   ↓
2. تحديث state (searchQuery)
   ↓
3. useEffect يكتشف التغيير
   ↓
4. استدعاء unifiedSearch()
   ↓
5. unifiedSearch يستدعي:
   - searchStudents()
   - searchSupervisors()
   - searchCases()
   - searchAppointments()
   - searchEvaluations()
   ↓
6. كل دالة تستدعي searchInArray()
   ↓
7. searchInArray() تفلتر المصفوفة
   ↓
8. إرجاع النتائج
   ↓
9. تحديث state (results)
   ↓
10. عرض النتائج في UI
```

---

## 🚀 تحسينات محتملة

### 1. **Debouncing**
```javascript
import { useDebounce } from '@/hooks/useDebounce';

const debouncedSearchQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  if (debouncedSearchQuery.trim()) {
    // البحث
  }
}, [debouncedSearchQuery]);
```

### 2. **Highlighting النتائج**
```javascript
export const highlightMatch = (text, query) => {
  if (!text || !query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
```

### 3. **البحث المتقدم**
- دعم البحث بـ Boolean Operators (AND, OR, NOT)
- دعم البحث بـ Regex
- دعم البحث بـ Fuzzy Matching

### 4. **Caching النتائج**
- حفظ نتائج البحث في localStorage
- تقليل عمليات البحث المتكررة

---

## 📝 الخلاصة

نظام البحث في المشروع مبني على:
- ✅ **معمارية موحدة** - دالة بحث عامة قابلة لإعادة الاستخدام
- ✅ **فلترة محلية** - سريعة وفعالة
- ✅ **دعم متعدد الأنواع** - طلاب، مشرفين، حالات، مواعيد، تقييمات
- ✅ **واجهة مستخدم متقدمة** - تبويبات، عدادات، حركات
- ✅ **تكامل مع Redux** - جلب البيانات من Store
- ✅ **دعم URL Parameters** - للمشاركة والإشارات المرجعية



