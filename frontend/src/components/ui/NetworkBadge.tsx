'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, CheckCircle } from 'lucide-react';

interface NetworkBadgeProps {
  network: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function NetworkBadge({ 
  network, 
  className = '', 
  size = 'md',
  showIcon = true 
}: NetworkBadgeProps) {
  const getNetworkConfig = (network: string) => {
    switch (network.toUpperCase()) {
      case 'TRC20':
        return {
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/40',
          textColor: 'text-green-300',
          icon: Shield,
          name: 'TRC20',
          description: 'TRON Network'
        };
      case 'ERC20':
        return {
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/40',
          textColor: 'text-blue-300',
          icon: Zap,
          name: 'ERC20',
          description: 'Ethereum Network'
        };
      case 'BEP20':
        return {
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/40',
          textColor: 'text-yellow-300',
          icon: CheckCircle,
          name: 'BEP20',
          description: 'Binance Smart Chain'
        };
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/40',
          textColor: 'text-gray-300',
          icon: Shield,
          name: network,
          description: 'Unknown Network'
        };
    }
  };

  const config = getNetworkConfig(network);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        inline-flex items-center gap-2 rounded-full border backdrop-blur-sm
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && (
        <motion.div
          whileHover={{ rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <IconComponent className={iconSizes[size]} />
        </motion.div>
      )}
      <span className="font-semibold">{config.name}</span>
      <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${config.color} animate-pulse`} />
    </motion.div>
  );
}