import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../services/partner.service.js';
import { toast } from '../utils/toast.js';

// Caching configuration for high performance and zero duplicate calls
const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes fresh cache time
  gcTime: 10 * 60 * 1000,   // 10 minutes cache retention
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

export const usePartner = (tabOrOptions = 'dashboard') => {
  const queryClient = useQueryClient();

  const activeTab = typeof tabOrOptions === 'string' 
    ? tabOrOptions 
    : (tabOrOptions?.activeTab || tabOrOptions?.tab || 'dashboard');

  // Determine enabled queries on demand based on active tab
  const isDashboard = activeTab === 'dashboard';
  const isBookings = activeTab === 'bookings';
  const isWallet = activeTab === 'wallet';
  const isReviews = activeTab === 'reviews';

  // 1. Dashboard Overview Query (Only active on Dashboard tab)
  const dashboardQuery = useQuery({
    queryKey: ['partner', 'dashboard'],
    queryFn: () => partnerService.getDashboard(),
    enabled: isDashboard,
    ...QUERY_CONFIG,
  });

  // 2. Consolidated Partner's Assigned Bookings Query
  const allBookingsQuery = useQuery({
    queryKey: ['partner', 'bookings', 'all'],
    queryFn: () => partnerService.getAllBookings(),
    enabled: isBookings || isDashboard,
    ...QUERY_CONFIG,
  });

  // 2b. Open Unassigned Pending Job Offers Query (Matching Offered Services & Work Area)
  const pendingBookingsQuery = useQuery({
    queryKey: ['partner', 'bookings', 'pending'],
    queryFn: () => partnerService.getPendingBookings(),
    enabled: isBookings || isDashboard,
    ...QUERY_CONFIG,
  });

  // 3. Wallet Balance Query (Only active on Wallet or Dashboard tab)
  const walletQuery = useQuery({
    queryKey: ['partner', 'wallet'],
    queryFn: () => partnerService.getWallet(),
    enabled: isWallet || isDashboard,
    ...QUERY_CONFIG,
  });

  // 4. Customer Reviews Query (Only active on Reviews tab)
  const reviewsQuery = useQuery({
    queryKey: ['partner', 'reviews'],
    queryFn: () => partnerService.getReviews(),
    enabled: isReviews,
    ...QUERY_CONFIG,
  });

  // 5. Notifications Query (Only active on Dashboard tab)
  const notificationsQuery = useQuery({
    queryKey: ['partner', 'notifications'],
    queryFn: () => partnerService.getNotifications(),
    enabled: isDashboard,
    ...QUERY_CONFIG,
  });

  // Partner's assigned bookings
  const allBookings = allBookingsQuery.data?.data || [];

  // Open unassigned job offers matching partner's offeredServices & work area
  const pendingBookings = pendingBookingsQuery.data?.data || [];

  const todayBookings = useMemo(() => {
    return allBookings.filter((b) =>
      ['Assigned', 'Accepted', 'On The Way', 'Started', 'assigned', 'accepted', 'in_progress'].includes(b.status)
    );
  }, [allBookings]);

  const completedBookings = useMemo(() => {
    return allBookings.filter((b) => ['Completed', 'completed'].includes(b.status));
  }, [allBookings]);

  const cancelledBookings = useMemo(() => {
    return allBookings.filter((b) => ['Cancelled', 'Refunded', 'cancelled'].includes(b.status));
  }, [allBookings]);

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
    allBookings,
    todayBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    wallet: walletQuery.data?.data || null,
    reviews: reviewsQuery.data?.data || [],
    notifications: notificationsQuery.data?.data || [],
    isLoading: isBookings ? allBookingsQuery.isLoading : isWallet ? walletQuery.isLoading : isReviews ? reviewsQuery.isLoading : dashboardQuery.isLoading,
    isKycLocked: dashboardQuery.data?.data?.kycStatus === 'pending' || dashboardQuery.data?.data?.kycStatus === 'rejected',
    refetchBookings: () => allBookingsQuery.refetch(),
    refetchDashboard: () => dashboardQuery.refetch(),
    refetchWallet: () => walletQuery.refetch(),
    refetchAll: () => queryClient.invalidateQueries({ queryKey: ['partner'] }),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['partner'] }),
    updateAvailability: updateAvailabilityMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadDocuments: uploadDocumentsMutation.mutateAsync,
  };
};
