'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  Clock,
  CheckCircle,
  Calculator
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import WarningAlert from '@/components/ui/WarningAlert';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/hooks/useToast';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawalInitiated?: (amount: number, address: string) => void;
}

const WITHDRAWAL_FEE = 1; // 1 USDT fee
const MIN_WITHDRAWAL = 10; // Minimum withdrawal amount

export default function WithdrawalModal({ 
  isOpen, 
  onClose, 
  availableBalance,
  onWithdrawalInitiated 
}: WithdrawalModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'processing'>('form');
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [addressVerified, setAddressVerified] = useState(false);
  const [lastDigits, setLastDigits] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const { toast } = useToast();

  const numericAmount = parseFloat(amount) || 0;
  const netAmount = numericAmount - WITHDRAWAL_FEE;
  const maxWithdrawal = availableBalance - WITHDRAWAL_FEE;

  useEffect(() => {
    if (!isOpen) {
      setStep('form');
      setAmount('');
      setAddress('');
      setAddressVerified(false);
      setLastDigits('');
      setAgreedToTerms(false);
      setWithdrawalStatus('idle');
    }
  }, [isOpen]);

  const isValidTRC20Address = (addr: string) => {
    return addr.startsWith('T') && addr.length === 34;
  };

  const handleAddressVerification = () => {
    if (!address) {
      toast.error('Enter Address', 'Please enter a withdrawal address first');
      return;
    }

    if (!isValidTRC20Address(address)) {
      toast.error('Invalid Address', 'Please enter a valid TRC20 address');
      return;
    }

    const addressLastSix = address.slice(-6);
    if (lastDigits.toLowerCase() === addressLastSix.toLowerCase()) {
      setAddressVerified(true);
      toast.success('Address Verified', 'Withdrawal address has been verified');
    } else {
      toast.error('Verification Failed', 'The last 6 digits do not match. Please check and try again.');
    }
  };

  const handleMaxAmount = () => {
    if (maxWithdrawal > 0) {
      setAmount(maxWithdrawal.toFixed(2));
    }
  };

  const validateForm = () => {
    if (!amount || numericAmount < MIN_WITHDRAWAL) {
      toast.error('Invalid Amount', `Minimum withdrawal is $${MIN_WITHDRAWAL} USDT`);
      return false;
    }

    if (numericAmount > maxWithdrawal) {
      toast.error('Insufficient Balance', `Maximum withdrawal is $${maxWithdrawal.toFixed(2)} USDT`);
      return false;
    }

    if (!address || !isValidTRC20Address(address)) {
      toast.error('Invalid Address', 'Please enter a valid TRC20 address');
      return false;
    }

    if (!addressVerified) {
      toast.error('Address Not Verified', 'Please verify the withdrawal address');
      return false;
    }

    if (!agreedToTerms) {
      toast.error('Terms Required', 'Please agree to the withdrawal terms');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setStep('confirm');
  };

  const handleConfirmWithdrawal = () => {
    setStep('processing');
    setWithdrawalStatus('pending');

    onWithdrawalInitiated?.(numericAmount, address);

    // Simulate processing
    setTimeout(() => {
      setWithdrawalStatus('success');
      toast.success('Withdrawal Initiated', 'Your withdrawal has been submitted for processing');
    }, 3000);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Withdraw USDT"
      size="lg"
    >
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Balance Info */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${availableBalance.toLocaleString()} USDT
                  </p>
                </div>
                <StatusBadge status="success" text="TRC20 Network" />
              </div>
            </div>

            {/* Withdrawal Amount */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Withdrawal Amount</label>
                <button
                  onClick={handleMaxAmount}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Max: ${maxWithdrawal.toFixed(2)}
                </button>
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min={MIN_WITHDRAWAL}
                max={maxWithdrawal}
                icon={<DollarSign className="h-4 w-4" />}
              />
            </div>

            {/* Withdrawal Address */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white">TRC20 Withdrawal Address</label>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter TRC20 address (starts with T)"
                className="font-mono text-sm"
              />
              {address && !isValidTRC20Address(address) && (
                <p className="text-red-400 text-sm">Invalid TRC20 address format</p>
              )}
            </div>

            {/* Address Verification */}
            {address && isValidTRC20Address(address) && (
              <WarningAlert
                type="warning"
                title="Verify Withdrawal Address"
                message="Please confirm the last 6 digits of your withdrawal address to prevent errors."
              >
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Last 6 digits:</span>
                    <code className="text-sm font-mono text-white bg-black/20 px-2 py-1 rounded">
                      ...{address.slice(-6)}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={lastDigits}
                      onChange={(e) => setLastDigits(e.target.value)}
                      placeholder="Enter last 6 digits"
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddressVerification}
                      disabled={lastDigits.length !== 6}
                      variant={addressVerified ? 'secondary' : 'primary'}
                    >
                      {addressVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                </div>
              </WarningAlert>
            )}

            {/* Fee Calculation */}
            {numericAmount > 0 && (
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Withdrawal Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-blue-200">
                    <span>Withdrawal Amount:</span>
                    <span>${numericAmount.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>Network Fee:</span>
                    <span>-${WITHDRAWAL_FEE} USDT</span>
                  </div>
                  <div className="border-t border-blue-500/20 pt-2">
                    <div className="flex justify-between font-semibold text-blue-100">
                      <span>You Will Receive:</span>
                      <span>${netAmount.toFixed(2)} USDT</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                I understand that withdrawals are irreversible and confirm that the address is correct. 
                I agree to the withdrawal terms and acknowledge the network fee.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              variant="crypto"
              size="lg"
              onClick={handleSubmit}
              disabled={!amount || !address || !addressVerified || !agreedToTerms}
              className="w-full"
            >
              Continue to Confirmation
            </Button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Confirm Withdrawal</h3>
              <p className="text-gray-300">Please review your withdrawal details carefully</p>
            </div>

            {/* Withdrawal Details */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-semibold">${numericAmount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee:</span>
                <span className="text-white">-${WITHDRAWAL_FEE} USDT</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-gray-400">You Will Receive:</span>
                <span className="text-white font-bold">${netAmount.toFixed(2)} USDT</span>
              </div>
              <div className="border-t border-white/10 pt-2">
                <span className="text-gray-400">To Address:</span>
                <div className="mt-1 break-all">
                  <code className="text-sm text-white bg-black/20 px-2 py-1 rounded">
                    {address}
                  </code>
                </div>
              </div>
            </div>

            {/* Final Warning */}
            <WarningAlert
              type="warning"
              title="Final Confirmation"
              message="This withdrawal cannot be reversed. Please ensure all details are correct before proceeding."
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep('form')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmWithdrawal}
                className="flex-1"
              >
                Confirm Withdrawal
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Send className="h-8 w-8 text-white" />
            </motion.div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Withdrawal</h3>
              <p className="text-gray-300">
                {withdrawalStatus === 'pending' && 'Your withdrawal is being processed...'}
                {withdrawalStatus === 'success' && 'Withdrawal submitted successfully!'}
              </p>
            </div>

            {withdrawalStatus === 'success' && (
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 text-green-300 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Withdrawal Initiated</span>
                </div>
                <p className="text-sm text-green-200">
                  Your withdrawal of ${netAmount.toFixed(2)} USDT has been submitted. 
                  It will be processed within 24 hours.
                </p>
              </div>
            )}

            {withdrawalStatus === 'success' && (
              <Button
                variant="primary"
                onClick={onClose}
                className="w-full"
              >
                Close
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}