import apiClient from "./api";

// جلب تفاصيل الجامعة الحالية
export const fetchUniversityDetails = async (universityId) => {
  const response = await apiClient.get(`/universities/${universityId}/`);
  return response.data?.data || response.data;
};

// تحديث بيانات الجامعة
export const updateUniversityDetails = async (universityId, payload) => {
  const response = await apiClient.patch(
    `/universities/${universityId}/update/`,
    payload
  );
  return response.data?.data || response.data;
};

// الكليات
export const fetchFaculties = async (universityId) => {
  const response = await apiClient.get(
    `/universities/${universityId}/faculties/`
  );
  return response.data?.data || response.data;
};

export const createFaculty = async (universityId, payload) => {
  const response = await apiClient.post(
    `/universities/${universityId}/faculties/`,
    payload
  );
  return response.data?.data || response.data;
};

/**
 * تحديث كلية
 * PATCH /api/universities/<university_id>/faculties/<faculty_id>/update/
 * الصلاحيات: IsAuthenticated + IsUniversityAdmin
 */
export const updateFaculty = async (universityId, facultyId, payload) => {
  const response = await apiClient.patch(
    `/universities/${universityId}/faculties/${facultyId}/update/`,
    payload
  );
  return response.data?.data || response.data;
};

/**
 * حذف/تعطيل كلية
 * DELETE /api/universities/<university_id>/faculties/<faculty_id>/delete/
 * الصلاحيات: IsAuthenticated + IsUniversityAdmin
 * ملاحظة: Soft Delete (تعطيل فقط)
 */
export const deleteFaculty = async (universityId, facultyId) => {
  const response = await apiClient.delete(
    `/universities/${universityId}/faculties/${facultyId}/delete/`
  );
  return response.data?.data || response.data;
};

// البرامج الأكاديمية
export const fetchPrograms = async (universityId) => {
  const response = await apiClient.get(
    `/universities/${universityId}/programs/`
  );
  return response.data?.data || response.data;
};

export const createProgram = async (universityId, payload) => {
  const response = await apiClient.post(
    `/universities/${universityId}/programs/`,
    payload
  );
  return response.data?.data || response.data;
};

/**
 * تحديث برنامج أكاديمي
 * PATCH /api/universities/<university_id>/programs/<program_id>/update/
 * الصلاحيات: IsAuthenticated + IsUniversityAdmin
 */
export const updateProgram = async (universityId, programId, payload) => {
  const response = await apiClient.patch(
    `/universities/${universityId}/programs/${programId}/update/`,
    payload
  );
  return response.data?.data || response.data;
};

/**
 * حذف/تعطيل برنامج أكاديمي
 * DELETE /api/universities/<university_id>/programs/<program_id>/delete/
 * الصلاحيات: IsAuthenticated + IsUniversityAdmin
 * ملاحظة: Soft Delete (تعطيل فقط)
 */
export const deleteProgram = async (universityId, programId) => {
  const response = await apiClient.delete(
    `/universities/${universityId}/programs/${programId}/delete/`
  );
  return response.data?.data || response.data;
};

// السنوات الأكاديمية
export const fetchAcademicYears = async (universityId) => {
  const response = await apiClient.get(
    `/universities/${universityId}/academic-years/`
  );
  return response.data?.data || response.data;
};

export const createAcademicYear = async (universityId, payload) => {
  const response = await apiClient.post(
    `/universities/${universityId}/academic-years/`,
    payload
  );
  return response.data?.data || response.data;
};

/**
 * تحديث سنة أكاديمية
 * PATCH /api/universities/<university_id>/academic-years/<year_id>/update/
 * الصلاحيات: IsAuthenticated + IsUniversityAdmin
 */
export const updateAcademicYear = async (universityId, yearId, payload) => {
  const response = await apiClient.patch(
    `/universities/${universityId}/academic-years/${yearId}/update/`,
    payload
  );
  return response.data?.data || response.data;
};

/**
 * حذف/تعطيل سنة أكاديمية
 * DELETE /api/universities/<university_id>/academic-years/<year_id>/delete/
 * الصلاحيات: IsAuthenticated + IsUniversityAdmin
 * ملاحظة: Soft Delete (تعطيل فقط)
 */
export const deleteAcademicYear = async (universityId, yearId) => {
  const response = await apiClient.delete(
    `/universities/${universityId}/academic-years/${yearId}/delete/`
  );
  return response.data?.data || response.data;
};







