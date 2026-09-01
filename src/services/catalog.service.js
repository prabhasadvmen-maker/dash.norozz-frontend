import { axiosInstance } from '../api/axiosInstance.js';

export const catalogService = {
  // Categories
  getCategories: () => axiosInstance.get('/categories'),
  getSkillsForCategories: (categories) => {
    const categoriesParam = Array.isArray(categories) ? categories.join(',') : categories;
    return axiosInstance.get('/categories/skills', { params: { categories: categoriesParam } });
  },
  getCategoryBySlug: (slug) => axiosInstance.get(`/categories/slug/${slug}`),
  getAdminCategories: (params) => axiosInstance.get('/categories/admin/all', { params }),
  createCategory: (data) => axiosInstance.post('/categories', data),
  updateCategory: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  deleteCategory: (id) => axiosInstance.delete(`/categories/${id}`),

  // SubCategories
  getSubCategories: () => axiosInstance.get('/sub-categories'),
  getSubCategoriesByCategory: (categoryId) => axiosInstance.get(`/sub-categories/category/${categoryId}`),
  getAdminSubCategories: (params) => axiosInstance.get('/sub-categories/admin/all', { params }),
  createSubCategory: (data) => axiosInstance.post('/sub-categories', data),
  updateSubCategory: (id, data) => axiosInstance.put(`/sub-categories/${id}`, data),
  deleteSubCategory: (id) => axiosInstance.delete(`/sub-categories/${id}`),

  // Services
  getServices: (params) => axiosInstance.get('/services', { params }),
  getServiceBySlug: (slug) => axiosInstance.get(`/services/slug/${slug}`),
  getAdminServices: (params) => axiosInstance.get('/services/admin/all', { params }),
  createService: (data) => axiosInstance.post('/services', data),
  updateService: (id, data) => axiosInstance.put(`/services/${id}`, data),
  deleteService: (id) => axiosInstance.delete(`/services/${id}`),

  // Service Packages
  getServicePackages: (serviceId) => axiosInstance.get(`/packages/service/${serviceId}`),
  createPackage: (serviceId, data) => axiosInstance.post(`/packages/service/${serviceId}`, data),
  updatePackage: (packageId, data) => axiosInstance.put(`/packages/${packageId}`, data),
  deletePackage: (packageId) => axiosInstance.delete(`/packages/${packageId}`),
  updatePackageStatus: (packageId, status) => axiosInstance.patch(`/packages/${packageId}/status`, { status }),
  togglePackagePopular: (packageId) => axiosInstance.patch(`/packages/${packageId}/popular`),
  togglePackageRecommended: (packageId) => axiosInstance.patch(`/packages/${packageId}/recommended`),
};

