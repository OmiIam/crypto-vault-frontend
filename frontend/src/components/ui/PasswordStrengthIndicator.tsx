'use client';

import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  weight: number;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
    weight: 1
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password),
    weight: 1
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password),
    weight: 1
  },
  {
    label: 'Contains number',
    test: (password) => /\d/.test(password),
    weight: 1
  },
  {
    label: 'Contains special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    weight: 1
  }
];

export const calculatePasswordStrength = (password: string): { score: number; level: string; color: string } => {
  if (!password) return { score: 0, level: 'None', color: 'gray' };
  
  const passedRequirements = requirements.filter(req => req.test(password));
  const score = passedRequirements.reduce((sum, req) => sum + req.weight, 0);
  const maxScore = requirements.reduce((sum, req) => sum + req.weight, 0);
  const percentage = (score / maxScore) * 100;
  
  if (percentage < 40) {
    return { score: percentage, level: 'Weak', color: 'red' };
  } else if (percentage < 70) {
    return { score: percentage, level: 'Fair', color: 'yellow' };
  } else if (percentage < 90) {
    return { score: percentage, level: 'Good', color: 'blue' };
  } else {
    return { score: percentage, level: 'Strong', color: 'green' };
  }
};

export default function PasswordStrengthIndicator({ 
  password, 
  className = '', 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const { score, level, color } = calculatePasswordStrength(password);
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-400',
          border: 'border-red-500/30'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-400',
          border: 'border-yellow-500/30'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-400',
          border: 'border-blue-500/30'
        };
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-400',
          border: 'border-green-500/30'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-400',
          border: 'border-gray-500/30'
        };
    }
  };

  const colors = getColorClasses(color);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`space-y-3 ${className}`}
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Password Strength</span>
          <span className={`text-sm font-semibold ${colors.text}`}>
            {level}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`h-full ${colors.bg} transition-all duration-300`}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`p-3 rounded-lg border ${colors.border} bg-white/5 backdrop-blur-sm`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Requirements</span>
          </div>
          
          <div className="space-y-1">
            {requirements.map((requirement, index) => {
              const isValid = requirement.test(password);
              
              return (
                <motion.div
                  key={requirement.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ 
                      scale: isValid ? 1.1 : 1,
                      rotate: isValid ? 360 : 0
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 25 
                    }}
                  >
                    {isValid ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <X className="h-3 w-3 text-gray-500" />
                    )}
                  </motion.div>
                  <span className={`text-xs ${isValid ? 'text-green-300' : 'text-gray-400'}`}>
                    {requirement.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}