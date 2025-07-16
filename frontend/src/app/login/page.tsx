'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Card from '@/components/ui/Card';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import ForgotPasswordModal from '@/components/ui/ForgotPasswordModal';
import RememberMeCheckbox from '@/components/ui/RememberMeCheckbox';
import { useAuth } from '@/hooks/useAuth';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { useToast } from '@/hooks/useToast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { login, register, sendPasswordReset, isLoading, error, clearError } = useAuth();
  const { toast } = useToast();
  
  // Email validation
  const emailValidation = useEmailValidation(formData.email);
  
  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!isLogin && !formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailValidation.isValid && emailValidation.error) {
      errors.email = emailValidation.error;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      let result;
      
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password,
          rememberMe
        });
      } else {
        result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        toast.success(
          isLogin ? 'Welcome back!' : 'Account created!',
          isLogin ? 'You have been logged in successfully' : 'Welcome to CryptoVault'
        );
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleModeToggle = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
    clearError();
  };
  
  const handleForgotPasswordSubmit = async (email: string) => {
    return await sendPasswordReset(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md sm:max-w-lg"
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
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-gray-200">
              {isLogin ? 'Sign in to your trading account' : 'Create your trading account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {!isLogin && (
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  error={formErrors.username}
                  icon={<User className="h-5 w-5" />}
                  disabled={isLoading}
                  autoComplete="username"
                />
              )}

              <div className="space-y-2">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  error={formErrors.email}
                  icon={<Mail className="h-5 w-5" />}
                  disabled={isLoading}
                  autoComplete="email"
                />
                
                {/* Email suggestions */}
                {emailValidation.suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-400"
                  >
                    Did you mean:{' '}
                    {emailValidation.suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, email: suggestion }))}
                        className="text-blue-400 hover:text-blue-300 underline ml-1"
                      >
                        {suggestion}
                        {index < emailValidation.suggestions.length - 1 && ', '}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <PasswordInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  error={formErrors.password}
                  disabled={isLoading}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                
                {/* Password strength indicator for registration */}
                {!isLogin && formData.password && (
                  <PasswordStrengthIndicator
                    password={formData.password}
                    className="mt-2"
                  />
                )}
              </div>
              
              {/* Remember Me and Forgot Password */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <RememberMeCheckbox
                    checked={rememberMe}
                    onChange={setRememberMe}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-100 text-sm backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
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
                loading={isLoading}
                className="w-full"
                size="lg"
                variant="crypto"
                disabled={isLoading || emailValidation.isValidating}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 space-y-4"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-900/80 px-4 text-gray-400">Or</span>
              </div>
            </div>
            
            <div className="text-center relative z-10">
              <button
                type="button"
                onClick={handleModeToggle}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline transition-colors font-semibold disabled:opacity-50"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </motion.div>

        </Card>
      </motion.div>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSendReset={handleForgotPasswordSubmit}
      />
    </div>
  );
}