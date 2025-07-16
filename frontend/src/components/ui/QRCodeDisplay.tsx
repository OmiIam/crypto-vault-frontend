'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Maximize2, 
  Copy, 
  CheckCircle,
  QrCode,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import Button from './Button';
import NetworkBadge from './NetworkBadge';
import { useToast } from '@/hooks/useToast';

interface QRCodeDisplayProps {
  address: string;
  network: string;
  amount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDownload?: boolean;
  showFullscreen?: boolean;
  onFullscreen?: () => void;
}

export default function QRCodeDisplay({
  address,
  network,
  amount,
  className = '',
  size = 'md',
  showDownload = true,
  showFullscreen = true,
  onFullscreen
}: QRCodeDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  const generateQRCode = () => {
    let qrData = address;
    if (amount) {
      qrData = `${address}?amount=${amount}`;
    }
    
    const qrSize = size === 'sm' ? '200x200' : size === 'md' ? '300x300' : '400x400';
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(qrData)}&format=png&margin=10`;
  };

  const downloadQR = async () => {
    try {
      setIsLoading(true);
      const qrUrl = generateQRCode();
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${network}_deposit_qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('QR Code Downloaded', 'QR code saved to your downloads');
    } catch (error) {
      toast.error('Download Failed', 'Failed to download QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyQRData = async () => {
    try {
      const qrData = amount ? `${address}?amount=${amount}` : address;
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      toast.success('QR Data Copied', 'QR code data copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Copy Failed', 'Failed to copy QR data');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
            <QrCode className="h-6 w-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">QR Code</h3>
            <p className="text-sm text-gray-300">Scan to deposit</p>
          </div>
        </div>
        <NetworkBadge network={network} size="sm" />
      </div>

      {/* QR Code Container */}
      <div className="relative">
        <motion.div
          className="bg-white rounded-xl p-4 mb-4 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.div
            className={`relative ${sizeClasses[size]}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src={generateQRCode()} 
              alt={`${network} Deposit QR Code`}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="200" fill="#f0f0f0"/>
                    <text x="100" y="100" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">
                      QR Code Unavailable
                    </text>
                  </svg>
                `)}`;
              }}
            />
            
            {/* Branded Corner */}
            <div className="absolute top-2 right-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* QR Code Info */}
        <div className="bg-black/20 border border-white/20 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Network:</span>
            <span className="text-white font-medium">{network}</span>
          </div>
          {amount && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-300">Amount:</span>
              <span className="text-white font-medium">${amount.toLocaleString()} USDT</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-300">Address:</span>
            <span className="text-white font-mono text-xs">
              {address.slice(0, 6)}...{address.slice(-6)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyQRData}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Data
                </>
              )}
            </Button>
          </motion.div>

          {showDownload && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadQR}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </Button>
            </motion.div>
          )}

          {showFullscreen && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullscreen}
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </Button>
            </motion.div>
          )}
        </div>

        {/* Mobile Instructions */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-300 text-sm">
            <Smartphone className="h-4 w-4" />
            <p>
              <strong>Mobile:</strong> Open your wallet app and scan this QR code to auto-fill the address
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}