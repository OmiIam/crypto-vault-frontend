'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useToast } from '@/hooks/useToast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendReset?: (email: string) => Promise<{ success: boolean; message: string; token?: string }>;
}

export default function ForgotPasswordModal({ 
  isOpen, 
  onClose, 
  onSendReset 
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const { toast } = useToast();

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setError('');
    setResetToken('');
    onClose();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (onSendReset) {
        const result = await onSendReset(email);
        if (result.success) {
          setStep('sent');
          setResetToken(result.token || ''); // Store token for testing
          toast.success('Reset Email Sent', 'Check your inbox for password reset instructions');
        } else {
          setError(result.message || 'Failed to send reset email');
        }
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep('sent');
        toast.success('Reset Email Sent', 'Check your inbox for password reset instructions');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step === 'email') {
      handleSendReset();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      closeOnBackdrop={true}
    >
      <div className="p-6">
        {step === 'email' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-300 text-sm">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email address"
                error={error}
                disabled={loading}
                className="w-full"
                autoFocus
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  onClick={handleSendReset}
                  loading={loading}
                  disabled={!email.trim()}
                  className="flex-1"
                  variant="crypto"
                >
                  Send Reset Link
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Success State */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-300 text-sm mb-6">
                We've sent a password reset link to:
              </p>
              
              <div className="bg-white/10 rounded-lg p-3 mb-6">
                <p className="text-white font-medium">{email}</p>
              </div>
              
              {/* Testing: Show reset token */}
              {resetToken && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-6">
                  <p className="text-yellow-200 text-sm font-medium mb-2">Testing Mode - Reset Token:</p>
                  <p className="text-yellow-100 text-xs font-mono break-all">{resetToken}</p>
                  <p className="text-yellow-200 text-xs mt-2">Use this token to reset your password</p>
                </div>
              )}
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <span>Link expires in 1 hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <span>Check your spam folder if you don't see it</span>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="flex-1"
                >
                  Try Another Email
                </Button>
                
                <Button
                  onClick={handleClose}
                  className="flex-1"
                  variant="crypto"
                >
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}