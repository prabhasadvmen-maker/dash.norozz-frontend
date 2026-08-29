import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cityAdminService } from '../services/cityAdmin.service.js';
import { toast } from '../utils/toast.js';

export const useCityAdmin = () => {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ['cityAdmin', 'dashboard'],
    queryFn: () => cityAdminService.getDashboard(),
  });

  const partnersQuery = useQuery({
    queryKey: ['cityAdmin', 'partners'],
    queryFn: () => cityAdminService.getPartners(),
  });

  const bookingsQuery = useQuery({
    queryKey: ['cityAdmin', 'bookings'],
    queryFn: () => cityAdminService.getBookings(),
  });

  const revenueQuery = useQuery({
    queryKey: ['cityAdmin', 'revenue'],
    queryFn: () => cityAdminService.getRevenue(),
  });

  const approvePartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.approvePartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.success(res.message || 'Partner KYC Approved successfully');
    },
  });

  const rejectPartnerMutation = useMutation({
    mutationFn: ({ id, reason }) => cityAdminService.rejectPartner(id, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.error(res.message || 'Partner KYC Rejected');
    },
  });

  const updateDocumentStatusMutation = useMutation({
    mutationFn: ({ id, docKey, status, rejectionReason }) => cityAdminService.updateDocumentStatus(id, docKey, status, rejectionReason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.success(res.message || 'Document status updated');
    },
  });

  const verifyPartnerKycMutation = useMutation({
    mutationFn: (id) => cityAdminService.verifyPartnerKyc(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.success(res.message || 'Partner KYC Verified');
    },
  });

  const suspendPartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.suspendPartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.info(res.message || 'Partner Suspended');
    },
  });

  const activatePartnerMutation = useMutation({
    mutationFn: (id) => cityAdminService.activatePartner(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.success(res.message || 'Partner Activated');
    },
  });

  const assignBookingMutation = useMutation({
    mutationFn: ({ bookingId, partnerId }) => cityAdminService.assignBooking(bookingId, partnerId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.success(res.message || 'Partner assigned to booking successfully');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => cityAdminService.cancelBooking(bookingId, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.info(res.message || 'Booking cancelled');
    },
  });

  return {
    dashboard: dashboardQuery.data?.data || null,
    partners: partnersQuery.data?.data || [],
    bookings: bookingsQuery.data?.data || [],
    revenue: revenueQuery.data?.data || null,
    isLoading:
      dashboardQuery.isLoading ||
      partnersQuery.isLoading ||
      bookingsQuery.isLoading ||
      revenueQuery.isLoading,
    refetch: () => {
      dashboardQuery.refetch();
      partnersQuery.refetch();
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
