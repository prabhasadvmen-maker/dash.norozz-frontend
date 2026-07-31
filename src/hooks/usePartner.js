import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../services/partner.service.js';
import { toast } from '../utils/toast.js';

export const usePartner = () => {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ['partner', 'dashboard'],
    queryFn: () => partnerService.getDashboard(),
  });

  const todayBookingsQuery = useQuery({
    queryKey: ['partner', 'bookings', 'today'],
    queryFn: () => partnerService.getTodayBookings(),
  });

  const pendingBookingsQuery = useQuery({
    queryKey: ['partner', 'bookings', 'pending'],
    queryFn: () => partnerService.getPendingBookings(),
  });

  const completedBookingsQuery = useQuery({
    queryKey: ['partner', 'bookings', 'completed'],
    queryFn: () => partnerService.getCompletedBookings(),
  });

  const walletQuery = useQuery({
    queryKey: ['partner', 'wallet'],
    queryFn: () => partnerService.getWallet(),
  });

  const reviewsQuery = useQuery({
    queryKey: ['partner', 'reviews'],
    queryFn: () => partnerService.getReviews(),
  });

  const notificationsQuery = useQuery({
    queryKey: ['partner', 'notifications'],
    queryFn: () => partnerService.getNotifications(),
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: (data) => partnerService.updateAvailability(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      toast.success(res.message || 'Availability updated successfully');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => partnerService.updateProfile(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      toast.success(res.message || 'Profile updated successfully');
    },
  });

  const uploadDocumentsMutation = useMutation({
    mutationFn: (formData) => partnerService.uploadDocuments(formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      toast.success(res.message || 'KYC Documents uploaded successfully for verification!');
    },
  });

  return {
    dashboard: dashboardQuery.data?.data || null,
    todayBookings: todayBookingsQuery.data?.data || [],
    pendingBookings: pendingBookingsQuery.data?.data || [],
    completedBookings: completedBookingsQuery.data?.data || [],
    wallet: walletQuery.data?.data || null,
    reviews: reviewsQuery.data?.data || [],
    notifications: notificationsQuery.data?.data || [],
    isLoading:
      dashboardQuery.isLoading ||
      todayBookingsQuery.isLoading ||
      pendingBookingsQuery.isLoading ||
      completedBookingsQuery.isLoading ||
      walletQuery.isLoading,
    isKycLocked: dashboardQuery.data?.data?.kycStatus === 'pending' || dashboardQuery.data?.data?.kycStatus === 'rejected',
    refetch: () => {
      dashboardQuery.refetch();
      todayBookingsQuery.refetch();
      pendingBookingsQuery.refetch();
      completedBookingsQuery.refetch();
      walletQuery.refetch();
      reviewsQuery.refetch();
      notificationsQuery.refetch();
    },
    updateAvailability: updateAvailabilityMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadDocuments: uploadDocumentsMutation.mutateAsync,
  };
};
