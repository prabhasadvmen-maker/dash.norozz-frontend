import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminService } from '../services/superAdmin.service.js';
import { toast } from '../utils/toast.js';
import { useAuthContext } from '../contexts/AuthContext.jsx';

export const useSuperAdmin = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthContext();

  const dashboardQuery = useQuery({
    queryKey: ['superAdmin', 'dashboard'],
    queryFn: () => superAdminService.getDashboard(),
    enabled: isAuthenticated,
  });

  const cityAdminsQuery = useQuery({
    queryKey: ['superAdmin', 'cityAdmins'],
    queryFn: () => superAdminService.getCityAdmins(),
    enabled: isAuthenticated,
  });

  const customersQuery = useQuery({
    queryKey: ['superAdmin', 'customers'],
    queryFn: () => superAdminService.getCustomers(),
    enabled: isAuthenticated,
  });

  const partnersQuery = useQuery({
    queryKey: ['superAdmin', 'partners'],
    queryFn: () => superAdminService.getPartners(),
    enabled: isAuthenticated,
  });

  const bookingsQuery = useQuery({
    queryKey: ['superAdmin', 'bookings'],
    queryFn: () => superAdminService.getBookings(),
    enabled: isAuthenticated,
  });

  const createCityAdminMutation = useMutation({
    mutationFn: (data) => superAdminService.createCityAdmin(data),
    onSuccess: (res) => {
      // Invalidate the specific cityAdmins query to force refetch
      queryClient.invalidateQueries({ queryKey: ['superAdmin', 'cityAdmins'] });
      toast.success(res.message || 'City Admin created successfully');
    },
  });

  const updateCityAdminMutation = useMutation({
    mutationFn: ({ id, data }) => superAdminService.updateCityAdmin(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['superAdmin', 'cityAdmins'] });
      toast.success(res.message || 'City Admin updated successfully');
    },
  });

  const updateCityAdminStatusMutation = useMutation({
    mutationFn: ({ id, status }) => superAdminService.updateCityAdminStatus(id, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['superAdmin', 'cityAdmins'] });
      toast.success(res.message || 'City Admin status updated');
    },
  });

  const deleteCityAdminMutation = useMutation({
    mutationFn: (id) => superAdminService.deleteCityAdmin(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['superAdmin', 'cityAdmins'] });
      toast.success(res.message || 'City Admin deleted');
    },
  });

  const impersonateCityAdminMutation = useMutation({
    mutationFn: (id) => superAdminService.impersonateCityAdmin(id),
  });

  // Normalize response — axiosInstance interceptor returns response.data directly
  // so shape is { statusCode, success, message, data: [...] }
  const normalizeCityAdmins = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    return [];
  };

  const normalizeList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    return [];
  };

  return {
    dashboard: dashboardQuery.data?.data || dashboardQuery.data || null,
    cityAdmins: normalizeCityAdmins(cityAdminsQuery.data),
    customers: normalizeList(customersQuery.data),
    partners: normalizeList(partnersQuery.data),
    bookings: normalizeList(bookingsQuery.data),
    cityAdminsError: cityAdminsQuery.error,
    cityAdminsLoading: cityAdminsQuery.isLoading,
    isLoading:
      dashboardQuery.isLoading ||
      cityAdminsQuery.isLoading ||
      customersQuery.isLoading ||
      partnersQuery.isLoading ||
      bookingsQuery.isLoading,
    refetch: () => {
      dashboardQuery.refetch();
      cityAdminsQuery.refetch();
      customersQuery.refetch();
      partnersQuery.refetch();
      bookingsQuery.refetch();
    },
    createCityAdmin: createCityAdminMutation.mutateAsync,
    updateCityAdmin: updateCityAdminMutation.mutateAsync,
    updateCityAdminStatus: updateCityAdminStatusMutation.mutateAsync,
    deleteCityAdmin: deleteCityAdminMutation.mutateAsync,
    impersonateCityAdmin: impersonateCityAdminMutation.mutateAsync,
  };
};
