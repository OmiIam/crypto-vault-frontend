'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';

type StatusType = 'success' | 'pending' | 'failed' | 'warning' | 'processing';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    background: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
    defaultText: 'Success'
  },
  pending: {
    icon: Clock,
    background: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    defaultText: 'Pending'
  },
  failed: {
    icon: XCircle,
    background: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    defaultText: 'Failed'
  },
  warning: {
    icon: AlertCircle,
    background: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/20',
    defaultText: 'Warning'
  },
  processing: {
    icon: Loader2,
    background: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    defaultText: 'Processing'
  }
};

const sizes = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1'
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-2'
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'h-5 w-5',
    gap: 'gap-2'
  }
};

export default function StatusBadge({
  status,
  text,
  size = 'md',
  animated = true,
  className = ''
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeConfig = sizes[size];
  const Icon = config.icon;
  
  const displayText = text || config.defaultText;

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={animated ? { 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      } : undefined}
      className={`
        inline-flex items-center ${sizeConfig.gap} ${sizeConfig.container}
        ${config.background} ${config.border} ${config.text}
        border rounded-full font-medium backdrop-blur-sm
        shadow-lg ${config.glow}
        ${className}
      `}
    >
      <motion.div
        animate={status === 'processing' ? { rotate: 360 } : undefined}
        transition={status === 'processing' ? {
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        } : undefined}
      >
        <Icon className={sizeConfig.icon} />
      </motion.div>
      <span className="font-medium">{displayText}</span>
    </motion.div>
  );
}