import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminService } from '../services/superAdmin.service.js';
import { toast } from '../utils/toast.js';

export const useSuperAdmin = () => {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ['superAdmin', 'dashboard'],
    queryFn: () => superAdminService.getDashboard(),
  });

  const cityAdminsQuery = useQuery({
    queryKey: ['superAdmin', 'cityAdmins'],
    queryFn: () => superAdminService.getCityAdmins(),
  });

  const customersQuery = useQuery({
    queryKey: ['superAdmin', 'customers'],
    queryFn: () => superAdminService.getCustomers(),
  });

  const partnersQuery = useQuery({
    queryKey: ['superAdmin', 'partners'],
    queryFn: () => superAdminService.getPartners(),
  });

  const bookingsQuery = useQuery({
    queryKey: ['superAdmin', 'bookings'],
    queryFn: () => superAdminService.getBookings(),
  });

  const createCityAdminMutation = useMutation({
    mutationFn: (data) => superAdminService.createCityAdmin(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      toast.success(res.message || 'City Admin created successfully');
    },
  });

  const updateCityAdminMutation = useMutation({
    mutationFn: ({ id, data }) => superAdminService.updateCityAdmin(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      toast.success(res.message || 'City Admin updated successfully');
    },
  });

  const updateCityAdminStatusMutation = useMutation({
    mutationFn: ({ id, status }) => superAdminService.updateCityAdminStatus(id, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      toast.success(res.message || 'City Admin status updated');
    },
  });

  const deleteCityAdminMutation = useMutation({
    mutationFn: (id) => superAdminService.deleteCityAdmin(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      toast.success(res.message || 'City Admin deleted');
    },
  });

  return {
    dashboard: dashboardQuery.data?.data || null,
    cityAdmins: cityAdminsQuery.data?.data || [],
    customers: customersQuery.data?.data || [],
    partners: partnersQuery.data?.data || [],
    bookings: bookingsQuery.data?.data || [],
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
  };
};
