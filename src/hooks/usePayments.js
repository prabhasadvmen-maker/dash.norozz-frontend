import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service.js';
import { toast } from '../utils/toast.js';

export const usePayments = () => {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['payments', 'transactions'],
    queryFn: () => paymentService.getHistory('all'),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data) => paymentService.createOrder(data),
    onSuccess: (res) => {
      toast.info(res.message || 'Payment Order Initialized');
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (data) => paymentService.verifyPayment(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast.success(res.message || 'Payment Verified & Completed!');
    },
  });

  const walletPayMutation = useMutation({
    mutationFn: (data) => paymentService.walletPay(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      toast.success(res.message || 'Payment debited from NOROZZ E-Wallet');
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => paymentService.refund(bookingId, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['cityAdmin'] });
      toast.success(res.message || 'Refund processed successfully');
    },
  });

  const getInvoiceMutation = useMutation({
    mutationFn: (bookingId) => paymentService.getInvoice(bookingId),
    onSuccess: (res) => {
      toast.success(res.message || 'Invoice generated');
    },
  });

  return {
    transactions: transactionsQuery.data?.data || [],
    isLoading: transactionsQuery.isLoading,
    refetchTransactions: () => transactionsQuery.refetch(),
    createOrder: createOrderMutation.mutateAsync,
    verifyPayment: verifyPaymentMutation.mutateAsync,
    walletPay: walletPayMutation.mutateAsync,
    refund: refundMutation.mutateAsync,
    getInvoice: getInvoiceMutation.mutateAsync,
  };
};
