import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service.js';
import { toast } from '../utils/toast.js';

export const useCatalog = () => {
  const queryClient = useQueryClient();

  // Public & Active Categories
  const categoriesQuery = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => catalogService.getCategories(),
  });

  // Admin All Categories
  const adminCategoriesQuery = useQuery({
    queryKey: ['catalog', 'adminCategories'],
    queryFn: () => catalogService.getAdminCategories(),
  });

  // SubCategories
  const subCategoriesQuery = useQuery({
    queryKey: ['catalog', 'subCategories'],
    queryFn: () => catalogService.getSubCategories(),
  });

  // Services
  const servicesQuery = useQuery({
    queryKey: ['catalog', 'services'],
    queryFn: () => catalogService.getServices(),
  });

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data) => catalogService.createCategory(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'Category created successfully');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => catalogService.updateCategory(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'Category updated');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => catalogService.deleteCategory(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'Category deleted');
    },
  });

  // SubCategory Mutations
  const createSubCategoryMutation = useMutation({
    mutationFn: (data) => catalogService.createSubCategory(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'SubCategory created');
    },
  });

  const updateSubCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => catalogService.updateSubCategory(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'SubCategory updated');
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: (id) => catalogService.deleteSubCategory(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'SubCategory deleted');
    },
  });

  // Service Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data) => catalogService.createService(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'Service created');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => catalogService.updateService(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'Service updated');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => catalogService.deleteService(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      toast.success(res.message || 'Service deleted');
    },
  });

  return {
    categories: categoriesQuery.data?.data || [],
    adminCategories: adminCategoriesQuery.data?.data?.categories || adminCategoriesQuery.data?.data || [],
    subCategories: subCategoriesQuery.data?.data?.items || subCategoriesQuery.data?.data || [],
    services: servicesQuery.data?.data?.items || servicesQuery.data?.data || [],
    skills: [],
    isLoading:
      categoriesQuery.isLoading ||
      adminCategoriesQuery.isLoading ||
      subCategoriesQuery.isLoading ||
      servicesQuery.isLoading,
    refetchCatalog: () => {
      categoriesQuery.refetch();
      adminCategoriesQuery.refetch();
      subCategoriesQuery.refetch();
      servicesQuery.refetch();
    },
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    createSubCategory: createSubCategoryMutation.mutateAsync,
    updateSubCategory: updateSubCategoryMutation.mutateAsync,
    deleteSubCategory: deleteSubCategoryMutation.mutateAsync,
    createService: createServiceMutation.mutateAsync,
    updateService: updateServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
  };
};
