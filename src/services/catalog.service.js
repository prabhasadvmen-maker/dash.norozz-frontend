import { axiosInstance } from '../api/axiosInstance.js';

export const catalogService = {
  // Categories
  getCategories: () => axiosInstance.get('/categories'),
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
};

