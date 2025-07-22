import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/sonner";

export const VerifyEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        const { success, message } = await apiService.verifyEmail(token);
        console.log('success', success, 'message', message, 'from VerifyEmail.tsx');

        if (!success) throw new Error(message || 'Email verification failed');

        setStatus('success');
        toast.success('Email verified! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setStatus('error');
        toast.error('Email verification failed. Redirecting...');
        setTimeout(() => navigate('/resend-verification'), 3000);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="animate-spin w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your verification token.</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="text-green-500 w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Email Verified!</h2>
            <p className="text-gray-500 mt-2">You're being redirected to login...</p>
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="text-red-500 w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold text-red-600">Verification Failed</h2>
            <p className="text-gray-500 mt-2">Invalid or expired token. Redirecting...</p>
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};
