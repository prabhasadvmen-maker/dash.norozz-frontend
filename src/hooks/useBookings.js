import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/booking.service.js';
import { toast } from '../utils/toast.js';
import { useAuthContext } from '../contexts/AuthContext.jsx';

export const useBookings = (enabled = true) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthContext();

  const myBookingsQuery = useQuery({
    queryKey: ['bookings', 'myBookings'],
    queryFn: () => bookingService.getMyBookings(),
    enabled: isAuthenticated && !!enabled,
    staleTime: 60 * 1000,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => bookingService.createBooking(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      toast.success(res.message || 'Booking created successfully!');
    },
  });

  const payBookingMutation = useMutation({
    mutationFn: ({ id, paymentMethod }) => bookingService.payBooking(id, paymentMethod),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast.success(res.message || 'Payment processed successfully');
    },
  });

  const acceptBookingMutation = useMutation({
    mutationFn: (id) => bookingService.acceptBooking(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.success(res.message || 'Job accepted by partner!');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => {
      if (status === 'On The Way') return bookingService.onTheWayBooking(id);
      if (status === 'Started') return bookingService.startBooking(id);
      if (status === 'Completed') return bookingService.completeBooking(id);
      return bookingService.onTheWayBooking(id);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.info(res.message || 'Booking status updated');
    },
  });

  const completeBookingMutation = useMutation({
    mutationFn: (payload) => {
      if (typeof payload === 'object' && payload !== null) {
        return bookingService.completeBooking(payload.id || payload.bookingId, payload.paymentMethod || 'UPI');
      }
      return bookingService.completeBooking(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      toast.success(res.message || 'Job completed successfully!');
    },
  });

  const rateBookingMutation = useMutation({
    mutationFn: ({ id, rating, reviewComment }) => bookingService.rateBooking(id, { rating, reviewComment }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast.success(res.message || 'Thank you for rating the service!');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingService.cancelBooking(id, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.info(res.message || 'Booking cancelled');
    },
  });

  return {
    myBookings: myBookingsQuery.data?.data || [],
    isLoading: myBookingsQuery.isLoading,
    refetch: () => myBookingsQuery.refetch(),
    createBooking: createBookingMutation.mutateAsync,
    payBooking: payBookingMutation.mutateAsync,
    acceptBooking: acceptBookingMutation.mutateAsync,
    updateBookingStatus: updateStatusMutation.mutateAsync,
    completeBooking: completeBookingMutation.mutateAsync,
    rateBooking: rateBookingMutation.mutateAsync,
    cancelBooking: cancelBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
  };
};
