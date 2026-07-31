import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customer.service.js';
import { toast } from '../utils/toast.js';

export const useCustomer = () => {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: () => customerService.getDashboard(),
  });

  const categoriesQuery = useQuery({
    queryKey: ['customer', 'categories'],
    queryFn: () => customerService.getCategories(),
  });

  const popularServicesQuery = useQuery({
    queryKey: ['customer', 'popularServices'],
    queryFn: () => customerService.getPopularServices(),
  });

  const offersQuery = useQuery({
    queryKey: ['customer', 'offers'],
    queryFn: () => customerService.getOffers(),
  });

  const addressesQuery = useQuery({
    queryKey: ['customer', 'addresses'],
    queryFn: () => customerService.getAddresses(),
  });

  const favoritesQuery = useQuery({
    queryKey: ['customer', 'favorites'],
    queryFn: () => customerService.getFavorites(),
  });

  const profileQuery = useQuery({
    queryKey: ['customer', 'profile'],
    queryFn: () => customerService.getProfile(),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (serviceName) => customerService.toggleFavorite(serviceName),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast.success(res.message || 'Favorites updated');
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (data) => customerService.addAddress(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'profile'] });
      toast.success(res.message || 'Address saved successfully');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => customerService.deleteAddress(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'profile'] });
      toast.success(res.message || 'Address deleted');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => customerService.updateProfile(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'profile'] });
      toast.success(res.message || 'Profile updated successfully');
    },
  });

  return {
    dashboard: dashboardQuery.data?.data || null,
    categories: categoriesQuery.data?.data || [],
    popularServices: popularServicesQuery.data?.data || [],
    offers: offersQuery.data?.data || [],
    addresses: addressesQuery.data?.data || profileQuery.data?.data?.addresses || [],
    favorites: favoritesQuery.data?.data || [],
    profile: profileQuery.data?.data || null,
    isLoading:
      dashboardQuery.isLoading ||
      categoriesQuery.isLoading ||
      popularServicesQuery.isLoading ||
      addressesQuery.isLoading,
    refetch: () => {
      dashboardQuery.refetch();
      categoriesQuery.refetch();
      popularServicesQuery.refetch();
      offersQuery.refetch();
      addressesQuery.refetch();
      favoritesQuery.refetch();
      profileQuery.refetch();
    },
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    addAddress: addAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
  };
};
