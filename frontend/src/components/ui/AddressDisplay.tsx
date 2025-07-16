'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  CheckCircle, 
  Shield, 
  ExternalLink, 
  Download,
  Eye,
  EyeOff,
  QrCode
} from 'lucide-react';
import Button from './Button';
import NetworkBadge from './NetworkBadge';
import { useToast } from '@/hooks/useToast';

interface AddressDisplayProps {
  address: string;
  network: string;
  label?: string;
  className?: string;
  showQR?: boolean;
  showExplorer?: boolean;
  onQRClick?: () => void;
  allowObfuscation?: boolean;
}

export default function AddressDisplay({
  address,
  network,
  label = 'Wallet Address',
  className = '',
  showQR = true,
  showExplorer = true,
  onQRClick,
  allowObfuscation = false
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isObfuscated, setIsObfuscated] = useState(false);
  const { toast } = useToast();

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address Copied', 'Wallet address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Copy Failed', 'Failed to copy address to clipboard');
    }
  };

  const copyWithNetwork = async () => {
    try {
      const textToCopy = `${network}: ${address}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Address with Network Copied', 'Full address details copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Copy Failed', 'Failed to copy address to clipboard');
    }
  };

  const openExplorer = () => {
    let explorerUrl = '';
    switch (network.toUpperCase()) {
      case 'TRC20':
        explorerUrl = `https://tronscan.org/#/address/${address}`;
        break;
      case 'ERC20':
        explorerUrl = `https://etherscan.io/address/${address}`;
        break;
      case 'BEP20':
        explorerUrl = `https://bscscan.com/address/${address}`;
        break;
      default:
        toast.error('Explorer Not Available', 'Block explorer not available for this network');
        return;
    }
    window.open(explorerUrl, '_blank');
  };

  const formatAddress = (addr: string) => {
    if (isObfuscated) {
      return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
    }
    
    // Break address into chunks for mobile readability
    const chunks = addr.match(/.{1,8}/g) || [];
    return chunks.join(' ');
  };

  const getAddressValidation = () => {
    const isValid = address.length > 20; // Basic validation
    return {
      isValid,
      message: isValid ? 'Valid address format' : 'Invalid address format',
      color: isValid ? 'text-green-400' : 'text-red-400'
    };
  };

  const validation = getAddressValidation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Shield className="h-6 w-6 text-blue-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">{label}</h3>
            <p className="text-sm text-gray-300">Secure deposit address</p>
          </div>
        </div>
        <NetworkBadge network={network} />
      </div>

      {/* Address Display */}
      <div className="mb-4">
        <div className="bg-black/30 border border-white/20 rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Address</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${validation.color}`}>
                {validation.message}
              </span>
              {allowObfuscation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsObfuscated(!isObfuscated)}
                  className="p-1"
                >
                  {isObfuscated ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>
          <motion.div
            className="font-mono text-sm text-white break-all leading-relaxed"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {formatAddress(address)}
          </motion.div>
        </div>

        {/* Last 6 Digits Highlight */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>Last 6 digits:</span>
          <motion.code
            className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-mono"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            ...{address.slice(-6)}
          </motion.code>
          <span className="text-xs text-gray-400">(for verification)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={copyAddress}
            className="text-center justify-center"
          >
            {copied ? 'Copied!' : 'Copy Address'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyWithNetwork}
            className="text-center justify-center"
          >
            Copy with Network
          </Button>
        </motion.div>

        {showQR && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onQRClick}
              className="text-center justify-center"
            >
              Show QR
            </Button>
          </motion.div>
        )}

        {showExplorer && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={openExplorer}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>
          </motion.div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-xs text-amber-300">
          <Shield className="h-3 w-3 inline mr-1" />
          Only send {network} tokens to this address. Other networks will result in permanent loss.
        </p>
      </div>
    </motion.div>
  );
}