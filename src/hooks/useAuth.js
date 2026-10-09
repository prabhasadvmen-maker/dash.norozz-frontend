import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import { useAuthContext } from '../contexts/AuthContext.jsx';
import { toast } from '../utils/toast.js';

export const useAuth = () => {
  const { login, logout, currentUser, isAuthenticated, role, updateUser } = useAuthContext();
  const navigate = useNavigate();

  const customerLoginMutation = useMutation({
    mutationFn: (data) => authService.customerLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      login(user);
      toast.success(`Welcome back, ${user.name || 'Customer'}!`);
      navigate('/', { replace: true });
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
      const user = res.data?.user;
      const isNewUser = res.data?.isNewUser;
      if (!isNewUser) {
        login(user);
        toast.success(`Welcome back, ${user.name || 'Customer'}!`);
        navigate('/', { replace: true });
      }
    },
  });

  const customerSignupMutation = useMutation({
    mutationFn: (data) => authService.customerSignup(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      login(user);
      toast.success('Customer account created successfully!');
      navigate('/', { replace: true });
    },
  });

  const partnerLoginMutation = useMutation({
    mutationFn: (data) => authService.partnerLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      login(user);
      toast.success(`Welcome back Partner, ${user.name || 'Agency'}!`);
      navigate('/partner/dashboard', { replace: true });
    },
  });

  const partnerSignupMutation = useMutation({
    mutationFn: (data) => authService.partnerSignup(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      login(user);
      toast.success('Partner application submitted successfully!');
      navigate('/partner/dashboard', { replace: true });
    },
  });

  const partnerOtpRequestMutation = useMutation({
    mutationFn: (data) => authService.requestPartnerOtpLogin(data),
    onSuccess: (res) => {
      toast.success(res.message || 'OTP sent successfully!');
    },
  });

  const partnerOtpVerifyMutation = useMutation({
    mutationFn: (data) => authService.verifyPartnerOtpLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      const isProfileCompleted = res.data?.isProfileCompleted;
      if (isProfileCompleted) {
        login(user);
        toast.success(`Welcome back Partner, ${user.name || 'Partner'}!`);
        navigate('/partner/dashboard', { replace: true });
      }
    },
  });

  const partnerProfileUpdateMutation = useMutation({
    mutationFn: (data) => authService.updatePartnerProfile(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Partner profile saved successfully!');
    },
  });

  const partnerKycSubmitMutation = useMutation({
    mutationFn: (data) => authService.submitPartnerKyc(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Partner KYC & Work setup submitted successfully!');
    },
  });

  const saveOnboardingLocationMutation = useMutation({
    mutationFn: (data) => authService.saveOnboardingLocation(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Location access saved!');
    },
  });

  const saveOnboardingDocsMutation = useMutation({
    mutationFn: (data) => authService.saveOnboardingDocuments(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Documents saved!');
    },
  });

  const saveOnboardingCatMutation = useMutation({
    mutationFn: (data) => authService.saveOnboardingCategory(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Service Category saved!');
    },
  });

  const saveOnboardingSkillsMutation = useMutation({
    mutationFn: (data) => authService.saveOnboardingSkills(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Skills & Experience saved!');
    },
  });

  const saveOnboardingAreaMutation = useMutation({
    mutationFn: (data) => authService.saveOnboardingServiceArea(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Service area saved!');
    },
  });

  const saveOnboardingHoursMutation = useMutation({
    mutationFn: (data) => authService.saveOnboardingWorkingHours(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      updateUser(user);
      toast.success('Working hours saved! Application submitted for review.');
    },
  });

  const addCertificationMutation = useMutation({
    mutationFn: (data) => authService.addCertification(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      if (user) updateUser(user);
      toast.success('Certificate uploaded & saved to database!');
    },
  });

  const deleteCertificationMutation = useMutation({
    mutationFn: (certId) => authService.deleteCertification(certId),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      if (user) updateUser(user);
      toast.success('Certificate removed from database!');
    },
  });

  const payOnboardingFeeMutation = useMutation({
    mutationFn: (data) => authService.payOnboardingFee(data),
    onSuccess: (res) => {
      const user = res.data?.user || res.data;
      if (user) updateUser(user);
      toast.success('🎉 One-Time Onboarding Fee paid successfully!');
    },
  });

  const cityAdminLoginMutation = useMutation({
    mutationFn: (data) => authService.cityAdminLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      login(user);
      toast.success(`City Admin Logged In: ${user.assignedCity || 'Delhi NCR'}`);
      navigate('/city-admin/dashboard', { replace: true });
    },
  });

  const superAdminLoginMutation = useMutation({
    mutationFn: (data) => authService.superAdminLogin(data),
    onSuccess: (res) => {
      const user = res.data?.user;
      login(user);
      toast.success('Super Admin Master Portal Access Granted');
      navigate('/super-admin/dashboard', { replace: true });
    },
  });

  return {
    currentUser,
    isAuthenticated,
    role,
    login,
    logout,
    updateUser,
    customerLogin: customerLoginMutation.mutateAsync,
    customerSignup: customerSignupMutation.mutateAsync,
    requestOtpLogin: otpLoginRequestMutation.mutateAsync,
    verifyOtpLogin: otpLoginVerifyMutation.mutateAsync,
    partnerLogin: partnerLoginMutation.mutateAsync,
    partnerSignup: partnerSignupMutation.mutateAsync,
    requestPartnerOtp: partnerOtpRequestMutation.mutateAsync,
    verifyPartnerOtp: partnerOtpVerifyMutation.mutateAsync,
    updatePartnerProfile: partnerProfileUpdateMutation.mutateAsync,
    submitPartnerKyc: partnerKycSubmitMutation.mutateAsync,
    saveOnboardingLocation: saveOnboardingLocationMutation.mutateAsync,
    saveOnboardingDocuments: saveOnboardingDocsMutation.mutateAsync,
    saveOnboardingCategory: saveOnboardingCatMutation.mutateAsync,
    saveOnboardingSkills: saveOnboardingSkillsMutation.mutateAsync,
    saveOnboardingServiceArea: saveOnboardingAreaMutation.mutateAsync,
    saveOnboardingWorkingHours: saveOnboardingHoursMutation.mutateAsync,
    addCertification: addCertificationMutation.mutateAsync,
    deleteCertification: deleteCertificationMutation.mutateAsync,
    payOnboardingFee: payOnboardingFeeMutation.mutateAsync,
    cityAdminLogin: cityAdminLoginMutation.mutateAsync,
    superAdminLogin: superAdminLoginMutation.mutateAsync,
    isLoggingIn:
      customerLoginMutation.isPending ||
      partnerLoginMutation.isPending ||
      partnerOtpRequestMutation.isPending ||
      partnerOtpVerifyMutation.isPending ||
      partnerProfileUpdateMutation.isPending ||
      partnerKycSubmitMutation.isPending ||
      saveOnboardingDocsMutation.isPending ||
      saveOnboardingCatMutation.isPending ||
      saveOnboardingSkillsMutation.isPending ||
      saveOnboardingAreaMutation.isPending ||
      saveOnboardingHoursMutation.isPending ||
      addCertificationMutation.isPending ||
      deleteCertificationMutation.isPending ||
      cityAdminLoginMutation.isPending ||
      superAdminLoginMutation.isPending ||
      otpLoginVerifyMutation.isPending,
  };
};
