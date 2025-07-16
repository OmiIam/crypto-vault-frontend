'use client';

import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'floating' | 'minimal';
  showToggle?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', label = 'Password', error, variant = 'default', showToggle = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const baseClasses = `
      w-full px-4 py-3 sm:py-3 rounded-xl transition-all duration-300
      focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
      placeholder:text-white placeholder:opacity-90 relative min-h-[44px] text-base
    `;

    const variants = {
      default: `
        bg-white/20 backdrop-blur-md border border-white/30 text-white
        hover:bg-white/25 hover:border-white/40 
        focus:bg-white/25 focus:border-blue-400/60 focus:ring-blue-400/30
        ${error ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/30' : ''}
      `,
      floating: `
        bg-transparent border-b-2 border-white/30 rounded-none px-0 py-2
        hover:border-white/50 focus:border-blue-400 focus:ring-0
        ${error ? 'border-red-400 focus:border-red-400' : ''}
      `,
      minimal: `
        bg-white/15 border border-white/20 text-white
        hover:bg-white/20 hover:border-white/30
        focus:bg-white/20 focus:border-white/40 focus:ring-white/15
        ${error ? 'border-red-400/40 focus:border-red-400/60 focus:ring-red-400/15' : ''}
      `
    };

    const inputClasses = `${baseClasses} ${variants[variant]} ${className} pl-10 ${showToggle ? 'pr-12' : ''}`;

    const containerVariants = {
      default: { scale: 1 },
      focused: { scale: 1.02 },
      error: { x: [-2, 2, -2, 2, 0] }
    };

    const labelVariants = {
      default: { y: 0, scale: 1, color: '#D1D5DB' },
      focused: { y: -24, scale: 0.85, color: '#60A5FA' },
      filled: { y: -24, scale: 0.85, color: '#D1D5DB' },
      error: { color: '#F87171' }
    };

    if (variant === 'floating' && label) {
      return (
        <motion.div 
          className="relative"
          variants={containerVariants}
          animate={error ? 'error' : isFocused ? 'focused' : 'default'}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="relative">
            {/* Lock Icon */}
            <motion.div 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
              whileHover={{ scale: 1.1 }}
            >
              <Lock className="h-5 w-5" />
            </motion.div>
            
            {/* Password Input */}
            <motion.input
              ref={ref}
              type={showPassword ? 'text' : 'password'}
              className={inputClasses}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              whileFocus={{ 
                boxShadow: "0 0 20px rgba(96, 165, 250, 0.3)",
                transition: { duration: 0.2 }
              }}
              {...props}
            />
            
            {/* Password Toggle Button */}
            {showToggle && (
              <motion.button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </motion.button>
            )}
            
            {/* Floating Label */}
            <motion.label
              className="absolute left-0 top-2 pointer-events-none origin-left text-sm font-medium"
              variants={labelVariants}
              animate={
                error ? 'error' :
                isFocused ? 'focused' : 
                hasValue ? 'filled' : 
                'default'
              }
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {label}
            </motion.label>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="space-y-2"
        variants={containerVariants}
        animate={error ? 'error' : isFocused ? 'focused' : 'default'}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {label && (
          <motion.label 
            className="block text-sm font-medium text-gray-200"
            whileHover={{ color: '#ffffff' }}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          {/* Lock Icon */}
          <motion.div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
            whileHover={{ scale: 1.1 }}
          >
            <Lock className="h-5 w-5" />
          </motion.div>
          
          {/* Password Input */}
          <motion.input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={inputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            whileFocus={{ 
              boxShadow: "0 0 20px rgba(96, 165, 250, 0.3)",
              transition: { duration: 0.2 }
            }}
            {...props}
          />
          
          {/* Password Toggle Button */}
          {showToggle && (
            <motion.button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </motion.button>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-400 flex items-center gap-1"
          >
            <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;