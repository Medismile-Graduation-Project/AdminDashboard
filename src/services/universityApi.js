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




