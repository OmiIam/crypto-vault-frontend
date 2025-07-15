'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

type AlertType = 'warning' | 'info' | 'success' | 'error';

interface WarningAlertProps {
  type?: AlertType;
  title: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    background: 'from-orange-500/20 via-orange-500/10 to-red-500/5',
    border: 'border-orange-500/30',
    iconColor: 'text-orange-400',
    titleColor: 'text-orange-100',
    messageColor: 'text-orange-200',
    glow: 'shadow-orange-500/20'
  },
  info: {
    icon: Info,
    background: 'from-blue-500/20 via-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-100',
    messageColor: 'text-blue-200',
    glow: 'shadow-blue-500/20'
  },
  success: {
    icon: CheckCircle,
    background: 'from-green-500/20 via-green-500/10 to-emerald-500/5',
    border: 'border-green-500/30',
    iconColor: 'text-green-400',
    titleColor: 'text-green-100',
    messageColor: 'text-green-200',
    glow: 'shadow-green-500/20'
  },
  error: {
    icon: XCircle,
    background: 'from-red-500/20 via-red-500/10 to-pink-500/5',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    titleColor: 'text-red-100',
    messageColor: 'text-red-200',
    glow: 'shadow-red-500/20'
  }
};

export default function WarningAlert({
  type = 'warning',
  title,
  message,
  children,
  className = '',
  dismissible = false,
  onDismiss
}: WarningAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      className={`
        relative p-4 rounded-xl border backdrop-blur-sm
        bg-gradient-to-r ${config.background} ${config.border}
        shadow-lg ${config.glow}
        ${className}
      `}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-xl"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "linear",
          repeatDelay: 2 
        }}
      />

      <div className="relative z-10 flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            delay: 0.1 
          }}
          className={`flex-shrink-0 ${config.iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.h4
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-sm font-semibold ${config.titleColor}`}
          >
            {title}
          </motion.h4>
          
          {message && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-sm mt-1 ${config.messageColor}`}
            >
              {message}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-3"
            >
              {children}
            </motion.div>
          )}
        </div>

        {dismissible && onDismiss && (
          <motion.button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <XCircle className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}