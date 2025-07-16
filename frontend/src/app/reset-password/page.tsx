'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import PasswordInput from '@/components/ui/PasswordInput';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  // Get token from URL params
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.token.trim()) {
      setError('Reset token is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(formData.token, formData.password);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Password Reset', 'Your password has been reset successfully');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          <Card variant="premium" className="backdrop-blur-2xl bg-slate-900/80 border-white/30 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Password Reset Successfully!
            </h1>
            <p className="text-gray-200 mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
              variant="crypto"
            >
              Go to Login
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <Card variant="premium" className="backdrop-blur-2xl bg-slate-900/80 border-white/30">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <Lock className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-200">
              Enter your reset token and new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <Input
                label="Reset Token"
                name="token"
                type="text"
                value={formData.token}
                onChange={handleInputChange}
                placeholder="Enter your reset token"
                disabled={loading}
                className="font-mono text-sm"
              />

              <PasswordInput
                label="New Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                disabled={loading}
                autoComplete="new-password"
              />

              {formData.password && (
                <PasswordStrengthIndicator
                  password={formData.password}
                  className="mt-2"
                />
              )}

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                disabled={loading}
                autoComplete="new-password"
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-100 text-sm backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !formData.token || !formData.password || !formData.confirmPassword}
                className="w-full"
                size="lg"
                variant="crypto"
              >
                Reset Password
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline transition-colors"
            >
              Back to Login
            </button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}