/**
 * دوال البحث الموحدة
 * نظام فهرسة بسيط للبحث في جميع أنواع البيانات
 */

/**
 * دالة مساعدة للبحث في مصفوفة حسب حقول محددة
 * @param {Array} array - المصفوفة للبحث فيها
 * @param {string} query - كلمة البحث
 * @param {Array<string>} fields - الحقول للبحث فيها
 * @returns {Array} النتائج المفلترة
 */
export const searchInArray = (array, query, fields) => {
  if (!query || !array || !Array.isArray(array)) return [];
  
  const searchTerm = query.toLowerCase().trim();
  if (searchTerm === "") return [];
  
  return array.filter(item => {
    if (!item) return false;
    
    return fields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      
      // البحث في النصوص
      const stringValue = String(value).toLowerCase();
      return stringValue.includes(searchTerm);
    });
  });
};

/**
 * البحث في الطلاب
 */
export const searchStudents = (students, query) => {
  return searchInArray(students, query, [
    'first_name',
    'last_name',
    'email',
    'username',
    'student_id',
    'specialization'
  ]);
};

/**
 * البحث في المشرفين
 */
export const searchSupervisors = (supervisors, query) => {
  return searchInArray(supervisors, query, [
    'first_name',
    'last_name',
    'email',
    'username',
    'department',
    'position',
    'license_number'
  ]);
};

/**
 * البحث في الحالات السريرية
 */
export const searchCases = (cases, query) => {
  return searchInArray(cases, query, [
    'title',
    'description',
    'patient_name',
    'student_name',
    'supervisor_name',
    'status',
    'priority'
  ]);
};

/**
 * البحث في المواعيد
 */
export const searchAppointments = (appointments, query) => {
  return searchInArray(appointments, query, [
    'patient_name',
    'student_name',
    'supervisor_name',
    'title',
    'notes',
    'status'
  ]);
};

/**
 * البحث في التقييمات
 */
export const searchEvaluations = (evaluations, query) => {
  return searchInArray(evaluations, query, [
    'title',
    'description',
    'student_name',
    'supervisor_name',
    'status'
  ]);
};

/**
 * البحث الموحد في جميع أنواع البيانات
 * @param {string} query - كلمة البحث
 * @param {Object} data - البيانات من Redux Store
 * @returns {Object} النتائج منظمة حسب النوع
 */
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

  const students = searchStudents(data.students || [], query);
  const supervisors = searchSupervisors(data.supervisors || [], query);
  const cases = searchCases(data.cases || [], query);
  const appointments = searchAppointments(data.appointments || [], query);
  const evaluations = searchEvaluations(data.evaluations || [], query);

  const total = students.length + supervisors.length + cases.length + 
                appointments.length + evaluations.length;

  return {
    students,
    supervisors,
    cases,
    appointments,
    evaluations,
    total
  };
};

/**
 * دالة مساعدة لتحديد ما إذا كانت النتيجة مطابقة
 * تستخدم لتلوين الكلمات المطابقة (Highlight)
 */
export const highlightMatch = (text, query) => {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

