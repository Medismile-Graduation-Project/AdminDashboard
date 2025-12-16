# ملخص ربط API - Community و Reports

## ✅ ما تم ربطه

### 1. Community API (المجتمع) ✅

#### ملفات تم إنشاؤها/تحديثها:
- ✅ `src/services/communityApi.js` - جميع endpoints الخاصة بـ Community
- ✅ `src/redux/features/mediContent/mediContentSlice.js` - Redux slice مع async thunks

#### Endpoints المربوطة:

##### المحتوى الأساسي:
- ✅ `GET /api/v1/community/` - جلب قائمة المحتوى (مع فلاتر)
- ✅ `GET /api/v1/community/<id>/` - جلب محتوى محدد
- ✅ `POST /api/v1/community/` - إنشاء محتوى جديد (يدعم ملفات)
- ✅ `PATCH /api/v1/community/<id>/` - تحديث محتوى
- ✅ `DELETE /api/v1/community/<id>/` - حذف محتوى

##### نظام الموافقة:
- ✅ `GET /api/v1/community/pending/` - جلب المنشورات المعلقة
- ✅ `POST /api/v1/community/<content_id>/approve/` - الموافقة على منشور
- ✅ `POST /api/v1/community/<content_id>/reject/` - رفض منشور

##### التعليقات:
- ✅ `GET /api/v1/community/<content_id>/comments/` - جلب تعليقات محتوى
- ✅ `POST /api/v1/community/<content_id>/comments/` - إضافة تعليق

##### الإعجابات:
- ✅ `POST /api/v1/community/<content_id>/like/` - إعجاب/إلغاء إعجاب

##### المحتوى الرائج:
- ✅ `GET /api/v1/community/trending/` - جلب أفضل 10 محتويات

#### Redux Actions المتاحة:

```javascript
// جلب المحتوى
dispatch(fetchCommunityContentAsync(params))
dispatch(fetchCommunityContentByIdAsync(id))
dispatch(fetchTrendingContentAsync())

// إدارة المحتوى
dispatch(createCommunityContentAsync(data))
dispatch(updateCommunityContentAsync({ id, data }))
dispatch(deleteCommunityContentAsync(id))

// نظام الموافقة
dispatch(fetchPendingContentAsync(userId))
dispatch(approveContentAsync({ contentId, userId }))
dispatch(rejectContentAsync({ contentId, userId, rejectionReason }))

// التعليقات
dispatch(fetchContentCommentsAsync(contentId))
dispatch(addCommentAsync({ contentId, commentData }))

// الإعجابات
dispatch(toggleLikeAsync({ contentId, userId }))

// Actions أخرى
dispatch(clearError())
dispatch(clearSelectedContent())
dispatch(setFilters(filters))
dispatch(clearFilters())
```

#### State Structure:

```javascript
{
  content: [],              // قائمة المحتوى
  selectedContent: null,    // المحتوى المحدد
  pendingContent: [],        // المنشورات المعلقة
  trendingContent: [],      // المحتوى الرائج
  comments: {},             // التعليقات (مخزنة حسب contentId)
  loading: false,           // حالة التحميل
  loadingSelected: false,   // حالة التحميل للمحتوى المحدد
  loadingPending: false,    // حالة التحميل للمحتوى المعلق
  error: null,              // الأخطاء
  filters: {                 // معاملات البحث
    type: null,
    category: null,
    university: null,
    featured: null,
    status: null,
    order_by: null,
  }
}
```

---

### 2. Reports API (التقارير) ✅

#### ملفات تم إنشاؤها/تحديثها:
- ✅ `src/services/reportsApi.js` - جميع endpoints الخاصة بـ Reports
- ✅ `src/redux/features/reports/reportsSlice.js` - Redux slice مع async thunks

#### Endpoints المربوطة:

##### التقارير الأساسية:
- ✅ `GET /api/v1/reports/` - جلب قائمة التقارير (مع فلاتر)
- ✅ `GET /api/v1/reports/<id>/` - جلب تقرير محدد
- ✅ `POST /api/v1/reports/` - إنشاء تقرير جديد
- ✅ `PATCH /api/v1/reports/<id>/` - تحديث تقرير
- ✅ `DELETE /api/v1/reports/<id>/` - حذف تقرير

##### التقارير المخصصة:
- ✅ `GET /api/v1/reports/student/<student_id>/` - جلب تقارير طالب محدد
- ✅ `GET /api/v1/reports/university/<university_id>/` - جلب تقارير جامعة محددة

#### Redux Actions المتاحة:

```javascript
// جلب التقارير
dispatch(fetchReportsAsync(params))
dispatch(fetchReportByIdAsync(id))
dispatch(fetchStudentReportsAsync(studentId))
dispatch(fetchUniversityReportsAsync(universityId))

// إدارة التقارير
dispatch(createReportAsync(reportData))
dispatch(updateReportAsync({ id, data }))
dispatch(deleteReportAsync(id))

// Actions أخرى
dispatch(clearError())
dispatch(clearSelectedReport())
dispatch(setFilters(filters))
dispatch(clearFilters())

// Actions للتوافق مع الكود القديم (إحصائيات الطلاب وتقارير المشرفين)
dispatch(addStudent(data))
dispatch(updateStudent({ id, data }))
dispatch(deleteStudent(id))
dispatch(updateMonthlyPerformance(data))
dispatch(updateQualityTrend(data))
dispatch(addSupervisorReport({ supervisorName, newCase }))
dispatch(updateSupervisorNote({ supervisorName, caseId, newNote }))
dispatch(deleteSupervisorCase({ supervisorName, caseId }))
```

#### State Structure:

```javascript
{
  reports: [],              // قائمة التقارير
  selectedReport: null,    // التقرير المحدد
  studentReports: {},       // تقارير الطلاب (مخزنة حسب studentId)
  universityReports: {},    // تقارير الجامعات (مخزنة حسب universityId)
  loading: false,           // حالة التحميل
  loadingSelected: false,   // حالة التحميل للتقرير المحدد
  error: null,              // الأخطاء
  filters: {                // معاملات البحث
    student_id: null,
    university_id: null,
    report_type: null,
    is_active: null,
  },
  // البيانات القديمة (للتوافق)
  studentsStats: [...],
  monthlyPerformance: [...],
  qualityTrend: [...],
  supervisorsReports: [...],
}
```

---

## 📝 ملاحظات مهمة

### 1. Community API:
- ✅ يدعم رفع الملفات (FormData) عند إنشاء/تحديث محتوى
- ✅ يدعم جميع أنواع المحتوى: article, video, document, image, link
- ✅ يدعم نظام الموافقة للمنشورات (للطلاب)
- ✅ يدعم التعليقات والإعجابات
- ✅ يدعم الفلاتر والبحث المتقدم

### 2. Reports API:
- ✅ يدعم جميع أنواع التقارير: academic, clinical, attendance, evaluation, progress, statistical, other
- ✅ يدعم فلترة حسب الطالب والجامعة
- ✅ يحتفظ بالبيانات القديمة للتوافق مع الكود الموجود

### 3. Redux Store:
- ✅ `mediContent` reducer موجود في store
- ✅ `reports` reducer موجود في store
- ✅ جميع async thunks جاهزة للاستخدام

---

## 🚀 كيفية الاستخدام

### مثال: جلب قائمة المحتوى

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunityContentAsync } from '@/redux/features/mediContent/mediContentSlice';

function CommunityPage() {
  const dispatch = useDispatch();
  const { content, loading, error } = useSelector((state) => state.mediContent);

  useEffect(() => {
    dispatch(fetchCommunityContentAsync({
      type: 'article',
      category: 'medical',
      featured: true
    }));
  }, [dispatch]);

  // استخدام البيانات...
}
```

### مثال: إنشاء محتوى جديد

```javascript
import { createCommunityContentAsync } from '@/redux/features/mediContent/mediContentSlice';

const handleCreate = async () => {
  await dispatch(createCommunityContentAsync({
    title: "مقال جديد",
    description: "وصف المقال",
    content_type: "article",
    category: "medical",
    url: "https://example.com/article",
    is_public: true
  }));
};
```

### مثال: جلب تقارير طالب

```javascript
import { fetchStudentReportsAsync } from '@/redux/features/reports/reportsSlice';

const handleFetchStudentReports = async (studentId) => {
  await dispatch(fetchStudentReportsAsync(studentId));
  const reports = useSelector((state) => state.reports.studentReports[studentId]);
};
```

---

## ✅ الحالة النهائية

- ✅ جميع endpoints مربوطة
- ✅ Redux slices محدثة مع async thunks
- ✅ معالجة الأخطاء متوفرة
- ✅ حالات التحميل متوفرة
- ✅ الفلاتر والبحث مدعومة
- ✅ التوافق مع الكود القديم محفوظ (للـ Reports)

---

**تاريخ الإكمال:** 2025-01-XX
**الحالة:** ✅ مكتمل وجاهز للاستخدام















