import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service.js';
import { useAuthContext } from '../contexts/AuthContext.jsx';
import { toast } from '../utils/toast.js';

export const useAuth = () => {
  const { login, logout, currentUser, isAuthenticated, role } = useAuthContext();

  const customerLoginMutation = useMutation({
    mutationFn: (data) => authService.customerLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      const token = res.data?.accessToken;
      login(user, token);
      toast.success(`Welcome back, ${user.name || 'Customer'}!`);
    },
  });

  const otpLoginRequestMutation = useMutation({
    mutationFn: (data) => authService.requestOtpLogin(data),
    onSuccess: (res) => {
      toast.success(res.message || 'OTP sent successfully!');
    },
  });

  const otpLoginVerifyMutation = useMutation({
    mutationFn: (data) => authService.verifyOtpLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      const token = res.data?.accessToken;
      login(user, token);
      toast.success(`Welcome back, ${user.name || 'Customer'}!`);
    },
  });

  const customerSignupMutation = useMutation({
    mutationFn: (data) => authService.customerSignup(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      const token = res.data?.accessToken;
      login(user, token);
      toast.success('Customer account created successfully!');
    },
  });

  const partnerLoginMutation = useMutation({
    mutationFn: (data) => authService.partnerLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      const token = res.data?.accessToken;
      login(user, token);
      toast.success(`Welcome back Partner, ${user.name || 'Agency'}!`);
    },
  });

  const partnerSignupMutation = useMutation({
    mutationFn: (data) => authService.partnerSignup(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      const token = res.data?.accessToken;
      login(user, token);
      toast.success('Partner application submitted successfully!');
    },
  });

  const cityAdminLoginMutation = useMutation({
    mutationFn: (data) => authService.cityAdminLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      const token = res.data?.accessToken;
      login(user, token);
      toast.success(`City Admin Logged In: ${user.assignedCity || 'Delhi NCR'}`);
    },
  });

  const superAdminLoginMutation = useMutation({
    mutationFn: (data) => authService.superAdminLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      const token = res.data?.accessToken;
      login(user, token);
      toast.success('Super Admin Master Portal Access Granted');
    },
  });

  return {
    currentUser,
    isAuthenticated,
    role,
    login,
    logout,
    customerLogin: customerLoginMutation.mutateAsync,
    customerSignup: customerSignupMutation.mutateAsync,
    requestOtpLogin: otpLoginRequestMutation.mutateAsync,
    verifyOtpLogin: otpLoginVerifyMutation.mutateAsync,
    partnerLogin: partnerLoginMutation.mutateAsync,
    partnerSignup: partnerSignupMutation.mutateAsync,
    cityAdminLogin: cityAdminLoginMutation.mutateAsync,
    superAdminLogin: superAdminLoginMutation.mutateAsync,
    isLoggingIn:
      customerLoginMutation.isPending ||
      partnerLoginMutation.isPending ||
      cityAdminLoginMutation.isPending ||
      superAdminLoginMutation.isPending ||
      otpLoginVerifyMutation.isPending,
  };
};
