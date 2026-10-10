import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { cityAdminService } from '../services/cityAdmin.service.js';
import { toast } from '../utils/toast.js';
import { useAuthContext } from '../contexts/AuthContext.jsx';

export const useCityAdmin = () => {
  const queryClient = useQueryClient();
  const noCityToastShown = useRef(false);

  const { isAuthenticated } = useAuthContext();

  const { currentUser } = useAuthContext();
  const adminId = currentUser?._id || currentUser?.id || '';
  const hasCity = !!(currentUser?.assignedCity || currentUser?.city);

  const handleNoCityError = (err) => {
    const msg = err?.response?.data?.message || err?.message || '';
    if (msg.toLowerCase().includes('no city assigned') && !noCityToastShown.current) {
      noCityToastShown.current = true;
      toast.error('No city assigned to this admin');
    }
  };

  const dashboardQuery = useQuery({
    queryKey: ['cityAdmin', 'dashboard', adminId],
    queryFn: () => cityAdminService.getDashboard(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const partnersQuery = useQuery({
    queryKey: ['cityAdmin', 'partners', adminId],
    queryFn: () => cityAdminService.getPartners(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const customersQuery = useQuery({
    queryKey: ['cityAdmin', 'customers', adminId],
    queryFn: () => cityAdminService.getCustomers(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const bookingsQuery = useQuery({
    queryKey: ['cityAdmin', 'bookings', adminId],
    queryFn: () => cityAdminService.getBookings(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const revenueQuery = useQuery({
    queryKey: ['cityAdmin', 'revenue', adminId],
    queryFn: () => cityAdminService.getRevenue(),
    enabled: isAuthenticated && !!adminId && hasCity,
    retry: false,
    onError: handleNoCityError,
  });

  const approvePartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.approvePartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'customers', adminId] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'dashboard', adminId] });
      toast.success(res.message || 'Partner KYC Approved successfully');
    },
  });

  const rejectPartnerMutation = useMutation({
    mutationFn: ({ id, reason }) => cityAdminService.rejectPartner(id, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId] });
      toast.error(res.message || 'Partner KYC Rejected');
    },
  });

  const updateDocumentStatusMutation = useMutation({
    mutationFn: ({ id, docKey, status, rejectionReason }) => cityAdminService.updateDocumentStatus(id, docKey, status, rejectionReason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId] });
      toast.success(res.message || 'Document status updated');
    },
  });

  const verifyPartnerKycMutation = useMutation({
    mutationFn: (id) => cityAdminService.verifyPartnerKyc(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId] });
      toast.success(res.message || 'Partner KYC Verified');
    },
  });

  const suspendPartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.suspendPartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId] });
      toast.info(res.message || 'Partner Suspended');
    },
  });

  const activatePartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.activatePartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners', adminId] });
      toast.success(res.message || 'Partner Activated');
    },
  });

  const assignBookingMutation = useMutation({
    mutationFn: ({ bookingId, partnerId }) => cityAdminService.assignBooking(bookingId, partnerId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'bookings', adminId] });
      toast.success(res.message || 'Partner assigned to booking successfully');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => cityAdminService.cancelBooking(bookingId, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'bookings', adminId] });
      toast.info(res.message || 'Booking cancelled');
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
