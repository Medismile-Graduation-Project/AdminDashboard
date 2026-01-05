# 🔔 آلية عمل الإشعارات في النظام

## 📋 نظرة عامة

تم ربط نظام الإشعارات مع جميع الوحدات المتعلقة بالجامعة (البرامج الأكاديمية، السنوات الأكاديمية، والمواعيد). يعمل النظام بشكل تلقائي لإنشاء وإدارة الإشعارات عند حدوث أحداث معينة.

---

## 🏗️ البنية المعمارية

### 1. **API Layer** (`src/services/notificationsApi.js`)
- `fetchNotifications()` - GET `/api/notifications/` - جلب Inbox للمستلم
- `createNotification()` - POST `/api/notifications/` - إنشاء إشعار جديد
- `fetchNotificationById()` - GET `/api/notifications/<id>/` - جلب إشعار محدد
- `updateNotification()` - PATCH `/api/notifications/<id>/` - تحديث (mark read/accept/reject)

### 2. **Redux Layer** (`src/redux/features/notifications/notificationsSlice.js`)
- إدارة حالة الإشعارات في التطبيق
- Actions: `fetchNotificationsAsync`, `createNotificationAsync`, `updateNotificationAsync`, `fetchUnreadCountAsync`
- State: `notifications[]`, `unreadCount`, `loading`, `error`

### 3. **UI Components**
- `NotificationBell.jsx` - جرس الإشعارات في Navbar
- `NotificationsList.jsx` - قائمة الإشعارات
- `NotificationItem.jsx` - عنصر إشعار واحد

---

## 🔄 تدفق العمل (Workflow)

### أ) إنشاء إشعار عند إنشاء برنامج أكاديمي

```
1. المستخدم ينشئ برنامج أكاديمي جديد
   ↓
2. createProgram() في universityApi.js
   ↓
3. handleCreateProgram() في academic-structure/page.jsx
   ↓
4. createProgramNotification() في universityApi.js
   ↓
5. createNotification() في notificationsApi.js
   POST /api/notifications/
   Body: {
     notification_type: "program_created",
     priority: "medium",
     recipient_id: userId,
     target_type: "program",
     target_id: program.id,
     title: "تم إنشاء برنامج أكاديمي جديد",
     message: "تم إنشاء البرنامج الأكاديمي '...' (...)"
   }
   ↓
6. Backend يحفظ الإشعار في قاعدة البيانات
   ↓
7. Redux: dispatch(createNotificationAsync(...))
   ↓
8. UI: تحديث NotificationBell (unreadCount++)
```

### ب) إنشاء إشعار عند إنشاء سنة أكاديمية

```
1. المستخدم ينشئ سنة أكاديمية جديدة
   ↓
2. createAcademicYear() في universityApi.js
   ↓
3. handleCreateAcademicYear() في academic-structure/page.jsx
   ↓
4. createAcademicYearNotification() في universityApi.js
   ↓
5. createNotification() في notificationsApi.js
   POST /api/notifications/
   Body: {
     notification_type: "academic_year_created",
     priority: "high",
     recipient_id: userId,
     target_type: "academic_year",
     target_id: academicYear.id,
     title: "تم إنشاء سنة أكاديمية جديدة",
     message: "تم إنشاء السنة الأكاديمية '...' من ... إلى ..."
   }
   ↓
6. Backend يحفظ الإشعار
   ↓
7. Redux: تحديث unreadCount
   ↓
8. UI: عرض الإشعار في NotificationBell
```

### ج) إنشاء إشعار عند إنشاء موعد

```
1. المستخدم ينشئ موعد جديد
   ↓
2. createAppointment() في appointmentsApi.js
   ↓
3. createAppointmentNotification() في appointmentsApi.js
   ↓
4. createNotification() في notificationsApi.js
   POST /api/notifications/
   Body: {
     notification_type: "appointment_request",
     priority: "high",
     recipient_id: supervisorId,
     appointment_id: appointment.id,
     title: "موعد جديد",
     message: "تم إنشاء موعد جديد في ..."
   }
   ↓
5. Backend يحفظ الإشعار
   ↓
6. Redux: تحديث unreadCount
   ↓
7. UI: عرض الإشعار للمشرف
```

### د) قراءة/تحديث إشعار

```
1. المستخدم ينقر على إشعار في NotificationBell
   ↓
2. handleNotificationClick() في NotificationBell.jsx
   ↓
3. updateNotificationAsync() في notificationsSlice.js
   PATCH /api/notifications/<id>/
   Body: { is_read: true }
   ↓
4. Backend يحدث الإشعار
   ↓
5. Redux: تحديث notification.is_read = true
   ↓
6. Redux: unreadCount--
   ↓
7. UI: تحديث NotificationBell (إزالة العداد)
   ↓
8. إذا كان الإشعار متعلق بموعد/برنامج/سنة:
   → router.push() إلى الصفحة المناسبة
```

---

## 📊 أنواع الإشعارات

### 1. **إشعارات البرامج الأكاديمية**
- `program_created` - تم إنشاء برنامج جديد
- `program_updated` - تم تحديث برنامج
- `program_deleted` - تم حذف برنامج

### 2. **إشعارات السنوات الأكاديمية**
- `academic_year_created` - تم إنشاء سنة أكاديمية جديدة
- `academic_year_updated` - تم تحديث سنة أكاديمية
- `academic_year_deleted` - تم حذف سنة أكاديمية

### 3. **إشعارات المواعيد**
- `appointment_request` - طلب موعد جديد
- `appointment_accepted` - تم قبول الموعد
- `appointment_rejected` - تم رفض الموعد
- `appointment_cancelled` - تم إلغاء الموعد

---

## 🎯 حالات الإشعارات (Status)

- `pending` - قيد الانتظار (افتراضي)
- `accepted` - تم القبول
- `rejected` - تم الرفض
- `info` - إشعار معلوماتي (لا يحتاج رد)

---

## 🔔 آلية التحديث التلقائي

### Polling Mechanism
```javascript
// في NotificationBell.jsx
useEffect(() => {
  if (!user?.id) return;

  // جلب الإشعارات كل 30 ثانية
  const interval = setInterval(() => {
    dispatch(fetchUnreadCountAsync({ recipient_id: user.id }));
  }, 30000);

  return () => clearInterval(interval);
}, [dispatch, user?.id]);
```

### عند تسجيل الدخول
```javascript
// في Navbar.jsx أو عند login
useEffect(() => {
  if (user?.id) {
    dispatch(fetchNotificationsAsync({ recipient_id: user.id }));
    dispatch(fetchUnreadCountAsync({ recipient_id: user.id }));
  }
}, [user?.id]);
```

---

## 🎨 واجهة المستخدم

### NotificationBell
- يعرض في Navbar (Desktop & Mobile)
- يظهر عدد الإشعارات غير المقروءة
- عند النقر، يفتح قائمة الإشعارات

### NotificationsList
- قائمة منسدلة تحتوي على جميع الإشعارات
- تفصل بين المقروءة وغير المقروءة
- زر "تعليم الكل كمقروء"

### NotificationItem
- يعرض عنوان الإشعار
- يعرض الرسالة
- يعرض الحالة (pending/accepted/rejected)
- يعرض الوقت النسبي (منذ X دقيقة/ساعة/يوم)
- أيقونة حسب نوع الإشعار

---

## 🔗 الربط مع الصفحات

### عند النقر على إشعار:
- **موعد**: `/appointments?appointment=<id>`
- **برنامج**: `/academic-structure?program=<id>`
- **سنة أكاديمية**: `/academic-structure?year=<id>`

---

## 📝 ملاحظات مهمة

1. **الأمان**: Backend يتحقق من `recipient_id` - لا يمكن للمستخدم رؤية إشعارات الآخرين
2. **الأداء**: يتم استخدام Polling كل 30 ثانية (يمكن تحسينه لاحقاً بـ WebSocket)
3. **التخزين**: الإشعارات محفوظة في Redux state + Backend database
4. **التحديث**: عند إنشاء إشعار جديد، يتم تحديث `unreadCount` تلقائياً

---

## 🚀 الخطوات التالية (اختياري)

1. **WebSocket Integration** - تحديث فوري بدون Polling
2. **Push Notifications** - إشعارات المتصفح (Browser Notifications API)
3. **Email Notifications** - إرسال إشعارات عبر البريد الإلكتروني
4. **Filtering & Search** - فلترة الإشعارات حسب النوع/الحالة
5. **Pagination** - دعم Pagination للإشعارات الكثيرة

---

## 📂 الملفات المعدلة/المضافة

### ملفات جديدة:
- `src/components/notifications/NotificationBell.jsx`
- `src/components/notifications/NotificationsList.jsx`
- `src/components/notifications/NotificationItem.jsx`

### ملفات محدثة:
- `src/services/notificationsApi.js` - تحديث التوثيق
- `src/services/universityApi.js` - إضافة دوال الإشعارات
- `src/services/appointmentsApi.js` - إضافة دوال الإشعارات
- `src/redux/features/notifications/notificationsSlice.js` - تحديث updateNotificationAsync
- `src/app/academic-structure/page.jsx` - ربط الإشعارات عند الإنشاء
- `src/components/Navbar.jsx` - إضافة NotificationBell

---

## ✅ الاختبار

لاختبار النظام:
1. سجل دخول كمسؤول جامعة
2. أنشئ برنامج أكاديمي جديد → يجب أن يظهر إشعار
3. أنشئ سنة أكاديمية جديدة → يجب أن يظهر إشعار
4. انقر على جرس الإشعارات في Navbar
5. انقر على إشعار → يجب أن ينتقل للصفحة المناسبة
6. تحقق من أن العداد غير المقروء يتحدث تلقائياً

---

**تاريخ الإنشاء**: 2025-01-XX
**آخر تحديث**: 2025-01-XX




















