# 🚨 المشكلة الأساسية

## المشكلة الرئيسية:

### ❌ **Login API لا يعيد `university_id` في `user` object**

**استجابة Login حسب التوثيق:**
```json
{
  "status": "success",
  "data": {
    "tokens": {...},
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "first_name": "الاسم",
      "last_name": "العائلة",
      "role": "university_admin",
      "is_active": true,
      "date_joined": "2025-01-01T00:00:00Z",
      "last_login": "2025-01-01T00:00:00Z"
      // ❌ لا يوجد university_id هنا!
    }
  }
}
```

### ✅ **`university_id` موجود في `UniversityAdminProfile`**

**حسب التوثيق:**
- `UniversityAdminProfile` يحتوي على `university` (علاقة مع الجامعة)
- Profile منفصل عن User object
- نحتاج لجلب Profile من API للحصول على `university_id`

---

## 🔍 التأثير على باقي الـ Modules:

### 1. ❌ Academic Structure
- **المشكلة:** لا يمكن جلب `university_id` من `user` object
- **التأثير:** لا يمكن الوصول للصفحة أو جلب البيانات
- **الحل المطلوب:** جلب Profile من API

### 2. ⚠️ باقي الـ Modules
- **الحالة:** تعمل لأن Backend يفلتر تلقائياً حسب Token
- **لكن:** قد تحتاج `university_id` في المستقبل

---

## 💡 الحل:

### الحل 1: جلب Profile بعد Login (الأفضل)
```javascript
// بعد Login ناجح
const user = result.user;

// جلب Profile للحصول على university_id
const profileResponse = await apiClient.get(`/accounts/university-admins/${user.id}/`);
const profile = profileResponse.data?.data || profileResponse.data;
const universityId = profile?.university || profile?.university_id;

// حفظ university_id في user object
user.university_id = universityId;
localStorage.setItem("user", JSON.stringify(user));
```

### الحل 2: جلب Profile عند الحاجة (الحالي - غير فعال)
```javascript
// في كل صفحة تحتاج university_id
if (!user.university_id) {
  const profileResponse = await apiClient.get(`/accounts/university-admins/${user.id}/`);
  // ...
}
```

### الحل 3: Backend يضيف university_id في Login response (الأفضل - لكن يحتاج تعديل Backend)
```json
{
  "user": {
    "id": "uuid",
    "university_id": "uuid", // ✅ يضاف من Backend
    ...
  }
}
```

---

## 🎯 التوصية:

**الحل الأفضل:** جلب Profile بعد Login مباشرة وحفظ `university_id` في `user` object في localStorage.

**الخطوات:**
1. بعد Login ناجح، جلب Profile
2. استخراج `university_id` من Profile
3. إضافة `university_id` إلى `user` object
4. حفظ `user` المحدث في localStorage

---

## 📝 ملاحظات:

- Backend يفلتر تلقائياً حسب `university_id` من Token
- لكن Frontend يحتاج `university_id` لبعض العمليات (مثل Academic Structure)
- الحل الحالي (جلب Profile عند الحاجة) يعمل لكنه غير فعال













