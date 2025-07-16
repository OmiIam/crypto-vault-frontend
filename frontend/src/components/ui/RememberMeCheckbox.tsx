'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function RememberMeCheckbox({ 
  checked, 
  onChange, 
  label = "Remember me",
  className = "",
  disabled = false
}: RememberMeCheckboxProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative w-5 h-5 rounded-md border-2 transition-all duration-200
          ${checked 
            ? 'bg-blue-500 border-blue-500' 
            : 'bg-white/10 border-white/30 hover:border-white/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/20'}
          focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-slate-900
        `}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        aria-label={label}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
      >
        <motion.div
          initial={false}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Check className="h-3 w-3 text-white" />
        </motion.div>
      </motion.button>
      
      <motion.span
        className={`
          text-sm text-gray-300 select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-white'}
          transition-colors duration-200
        `}
        onClick={handleToggle}
        whileHover={!disabled ? { x: 2 } : {}}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {label}
      </motion.span>
    </div>
  );
}