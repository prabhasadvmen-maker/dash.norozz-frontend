import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { cityAdminService } from '../services/cityAdmin.service.js';
import { toast } from '../utils/toast.js';
import { useAuthContext } from '../contexts/AuthContext.jsx';

export const useCityAdmin = (cityName = null) => {
  const queryClient = useQueryClient();
  const noCityToastShown = useRef(false);

  const { isAuthenticated } = useAuthContext();
  const { currentUser } = useAuthContext();
  
  // Resolve city from parameter or currentUser
  const resolveCity = () => {
    if (cityName) return cityName;
    const raw = currentUser?.assignedCity || currentUser?.city;
    if (typeof raw === 'object' && raw?.name) return raw.name;
    return String(raw || '');
  };

  const adminCity = resolveCity();
  const adminId = currentUser?._id || currentUser?.id || '';
  const hasCity = !!adminCity;

  const handleNoCityError = (err) => {
    const msg = err?.response?.data?.message || err?.message || '';
    
    if (msg.toLowerCase().includes('no city assigned')) {
      if (!noCityToastShown.current) {
        noCityToastShown.current = true;
        toast.error('No city assigned to this admin');
      }
    } else if (err?.response?.status === 401) {
      toast.error('Unauthorized access');
    } else if (err?.response?.status === 403) {
      toast.error('You do not have permission to access this city');
    } else if (err?.response?.status >= 500) {
      toast.error('Server error. Please try again later');
    }
  };

  const dashboardQuery = useQuery({
    queryKey: ['cityAdmin', 'dashboard', adminId, adminCity],
    queryFn: () => cityAdminService.getDashboard(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const partnersQuery = useQuery({
    queryKey: ['cityAdmin', 'partners', adminId, adminCity],
    queryFn: () => cityAdminService.getPartners(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const customersQuery = useQuery({
    queryKey: ['cityAdmin', 'customers', adminId, adminCity],
    queryFn: () => cityAdminService.getCustomers(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const bookingsQuery = useQuery({
    queryKey: ['cityAdmin', 'bookings', adminId, adminCity],
    queryFn: () => cityAdminService.getBookings(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const revenueQuery = useQuery({
    queryKey: ['cityAdmin', 'revenue', adminId, adminCity],
    queryFn: () => cityAdminService.getRevenue(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const approvePartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.approvePartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId, adminCity] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'dashboard', adminId, adminCity] });
      toast.success(res.data?.message || 'Partner KYC Approved successfully');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to approve partner');
    },
  });

  const rejectPartnerMutation = useMutation({
    mutationFn: ({ id, reason }) => cityAdminService.rejectPartner(id, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId, adminCity] });
      toast.error(res.data?.message || 'Partner KYC Rejected');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to reject partner');
    },
  });

  const updateDocumentStatusMutation = useMutation({
    mutationFn: ({ id, docKey, status, rejectionReason }) => cityAdminService.updateDocumentStatus(id, docKey, status, rejectionReason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId, adminCity] });
      toast.success(res.data?.message || 'Document status updated');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update document');
    },
  });

  const verifyPartnerKycMutation = useMutation({
    mutationFn: (id) => cityAdminService.verifyPartnerKyc(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId, adminCity] });
      toast.success(res.data?.message || 'Partner KYC Verified');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to verify KYC');
    },
  });

  const suspendPartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.suspendPartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId, adminCity] });
      toast.info(res.data?.message || 'Partner Suspended');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to suspend partner');
    },
  });

  const activatePartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.activatePartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId, adminCity] });
      toast.success(res.data?.message || 'Partner Activated');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to activate partner');
    },
  });

  const assignBookingMutation = useMutation({
    mutationFn: ({ bookingId, partnerId }) => cityAdminService.assignBooking(bookingId, partnerId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'bookings', adminId, adminCity] });
      toast.success(res.data?.message || 'Partner assigned to booking successfully');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to assign booking');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => cityAdminService.cancelBooking(bookingId, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'bookings', adminId, adminCity] });
      toast.info(res.data?.message || 'Booking cancelled');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    },
  });

  return {
    dashboard: dashboardQuery.data?.data || null,
    partners: partnersQuery.data?.data || [],
    customers: customersQuery.data?.data || [],
    bookings: bookingsQuery.data?.data || [],
    revenue: revenueQuery.data?.data || null,
    isLoading:
      hasCity && (
        dashboardQuery.isLoading ||
        partnersQuery.isLoading ||
        customersQuery.isLoading ||
        bookingsQuery.isLoading ||
        revenueQuery.isLoading
      ),
    refetch: () => {
      dashboardQuery.refetch();
      partnersQuery.refetch();
      customersQuery.refetch();
      bookingsQuery.refetch();
      revenueQuery.refetch();
    },
    approvePartner: approvePartnerMutation.mutateAsync,
    rejectPartner: rejectPartnerMutation.mutateAsync,
    updateDocumentStatus: updateDocumentStatusMutation.mutateAsync,
    verifyPartnerKyc: verifyPartnerKycMutation.mutateAsync,
    suspendPartner: suspendPartnerMutation.mutateAsync,
    activatePartner: activatePartnerMutation.mutateAsync,
    assignBooking: assignBookingMutation.mutateAsync,
    cancelBooking: cancelBookingMutation.mutateAsync,
  };
};
