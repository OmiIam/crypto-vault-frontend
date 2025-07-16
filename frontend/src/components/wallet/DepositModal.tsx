'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import WarningAlert from '@/components/ui/WarningAlert';
import StatusBadge from '@/components/ui/StatusBadge';
import AddressDisplay from '@/components/ui/AddressDisplay';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import PaymentTierCards from './PaymentTierCards';
import { useToast } from '@/hooks/useToast';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositInitiated?: (amount: number, tier: string) => void;
}

const USDT_ADDRESS = 'TMY6h2UWSrbxfSG4q3WenDe6CV9bRhZuNY';
const NETWORK = 'TRC20';
const MIN_DEPOSIT = 500;

export default function DepositModal({ isOpen, onClose, onDepositInitiated }: DepositModalProps) {
  const [step, setStep] = useState<'select' | 'deposit' | 'confirm'>('select');
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'professional' | 'custom'>('starter');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [addressVerified, setAddressVerified] = useState(false);
  const [lastDigits, setLastDigits] = useState('');
  const [depositStatus, setDepositStatus] = useState<'idle' | 'pending' | 'confirmed'>('idle');
  const [showQRFullscreen, setShowQRFullscreen] = useState(false);
  const { toast } = useToast();

  const lastSixDigits = USDT_ADDRESS.slice(-6);

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setSelectedAmount(500);
      setCustomAmount('');
      setAddressVerified(false);
      setLastDigits('');
      setDepositStatus('idle');
    }
  }, [isOpen]);

  const handleTierSelect = (amount: number, tier: 'starter' | 'professional' | 'custom') => {
    try {
      console.log('Tier selected:', { amount, tier });
      setSelectedAmount(amount);
      setSelectedTier(tier);
      if (tier === 'custom') {
        setStep('deposit');
      } else {
        setStep('deposit');
      }
    } catch (error) {
      console.error('Error in handleTierSelect:', error);
    }
  };

  const handleCustomAmountSubmit = () => {
    try {
      const amount = parseFloat(customAmount);
      if (amount < MIN_DEPOSIT) {
        toast.error('Invalid Amount', `Minimum deposit is $${MIN_DEPOSIT} USDT`);
        return;
      }
      setSelectedAmount(amount);
      setStep('deposit');
    } catch (error) {
      console.error('Error in handleCustomAmountSubmit:', error);
    }
  };

  const handleQRFullscreen = () => {
    setShowQRFullscreen(true);
  };

  const handleAddressVerification = () => {
    try {
      if (lastDigits.toLowerCase() === lastSixDigits.toLowerCase()) {
        setAddressVerified(true);
        toast.success('Address Verified', 'You have successfully verified the wallet address');
      } else {
        toast.error('Verification Failed', 'The last 6 digits do not match. Please check and try again.');
      }
    } catch (error) {
      console.error('Error in handleAddressVerification:', error);
      // Fallback verification without toast
      if (lastDigits.toLowerCase() === lastSixDigits.toLowerCase()) {
        setAddressVerified(true);
      }
    }
  };

  const handleDepositConfirm = () => {
    if (!addressVerified) {
      toast.error('Verification Required', 'Please verify the wallet address before proceeding');
      return;
    }

    setDepositStatus('pending');
    onDepositInitiated?.(selectedAmount, selectedTier);
    
    // Simulate processing
    setTimeout(() => {
      setDepositStatus('confirmed');
      toast.success('Deposit Initiated', 'Your deposit has been recorded and is being processed');
    }, 2000);
  };


  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Deposit USDT"
      size="lg"
    >
      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Quick Deposit Option */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Deposit</h3>
                <p className="text-gray-300 text-sm mb-4">Start with the minimum deposit amount of ${MIN_DEPOSIT} USDT</p>
                <Button 
                  onClick={() => handleTierSelect(MIN_DEPOSIT, 'starter')}
                  variant="crypto"
                  className="w-full"
                >
                  Deposit ${MIN_DEPOSIT} USDT
                </Button>
              </div>
              
              {/* Tier Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Or choose a tier:</h3>
                <PaymentTierCards onTierSelect={handleTierSelect} />
              </div>
            </div>
          </motion.div>
        )}

        {step === 'deposit' && (
          <motion.div
            key="deposit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Custom Amount Input */}
            {selectedTier === 'custom' && !customAmount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">Enter Custom Amount</h3>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    min={MIN_DEPOSIT}
                    className="flex-1"
                  />
                  <Button onClick={handleCustomAmountSubmit} disabled={!customAmount}>
                    Continue
                  </Button>
                </div>
                <p className="text-sm text-gray-300">
                  Minimum deposit: ${MIN_DEPOSIT} USDT
                </p>
              </motion.div>
            )}

            {/* Deposit Details */}
            {((selectedTier !== 'custom' && selectedAmount > 0) || (selectedTier === 'custom' && customAmount && parseFloat(customAmount) >= MIN_DEPOSIT)) && (
              <>
                <div className="bg-white/15 rounded-xl p-4 border border-white/25">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Deposit Amount</p>
                      <p className="text-2xl font-bold text-white">
                        ${selectedAmount.toLocaleString()} USDT
                      </p>
                    </div>
                    <StatusBadge status="pending" text={`${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Tier`} />
                  </div>
                </div>

                {/* Network Warning */}
                <WarningAlert
                  type="warning"
                  title="Important: TRC20 Network Only"
                  message="Only send USDT on the TRC20 network. Sending on other networks will result in permanent loss of funds."
                />

                {/* Professional Address and QR Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AddressDisplay
                    address={USDT_ADDRESS}
                    network={NETWORK}
                    label="Deposit Address"
                    showQR={true}
                    onQRClick={handleQRFullscreen}
                    allowObfuscation={true}
                  />
                  
                  <QRCodeDisplay
                    address={USDT_ADDRESS}
                    network={NETWORK}
                    amount={selectedAmount}
                    size="md"
                    onFullscreen={handleQRFullscreen}
                  />
                </div>

                {/* Address Verification */}
                <WarningAlert
                  type="warning"
                  title="Address Verification Required"
                  message="Before sending funds, please verify the wallet address by entering the last 6 digits."
                >
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">Last 6 digits:</span>
                      <code className="text-sm font-mono text-white bg-black/20 px-2 py-1 rounded">
                        ...{lastSixDigits}
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

                {/* Instructions */}
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-300 mb-2">Deposit Instructions</h4>
                  <ol className="text-sm text-blue-200 space-y-1">
                    <li>1. Verify the wallet address matches the last 6 digits above</li>
                    <li>2. Send exactly ${selectedAmount.toLocaleString()} USDT to the address</li>
                    <li>3. Use TRC20 network only</li>
                    <li>4. Wait for network confirmation (usually 1-3 minutes)</li>
                    <li>5. Funds will be credited to your account automatically</li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep('select')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant="crypto"
                    onClick={handleDepositConfirm}
                    disabled={!addressVerified || depositStatus === 'pending'}
                    loading={depositStatus === 'pending'}
                    className="flex-1 flex items-center justify-center"
                  >
                    {depositStatus === 'pending' ? 'Processing Deposit...' : 'I Have Sent the Funds'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}