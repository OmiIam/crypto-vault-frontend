'use client';

import { motion } from 'framer-motion';
import { DollarSign, Star, Crown, Zap, TrendingUp, Shield } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PaymentTierCardsProps {
  onTierSelect: (amount: number, tier: 'starter' | 'professional' | 'custom') => void;
  className?: string;
}

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    amount: 500,
    icon: DollarSign,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Standard processing',
      'Basic support',
      'Market access',
      'Portfolio tracking'
    ],
    badge: 'Most Popular',
    badgeColor: 'bg-blue-500',
    description: 'Perfect for beginners entering the crypto market'
  },
  {
    id: 'professional',
    name: 'Professional',
    amount: 4500,
    icon: Star,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Priority processing',
      'Enhanced support',
      'Advanced analytics',
      'Premium features',
      'Lower fees'
    ],
    badge: 'Best Value',
    badgeColor: 'bg-purple-500',
    description: 'For serious traders seeking advanced tools'
  },
  {
    id: 'custom',
    name: 'Custom',
    amount: 0,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Unlimited deposits',
      'Dedicated support',
      'Premium analytics',
      'Custom solutions',
      'Lowest fees',
      'Priority access'
    ],
    badge: 'Premium',
    badgeColor: 'bg-amber-500',
    description: 'Tailored for high-volume professional traders'
  }
];

export default function PaymentTierCards({ onTierSelect, className = '' }: PaymentTierCardsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Deposit Tier</h2>
        <p className="text-gray-300">Select the amount that best fits your trading needs</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                variant="premium" 
                hover={true}
                className={`
                  relative overflow-hidden group cursor-pointer
                  ${tier.id === 'professional' ? 'ring-2 ring-purple-500/50' : ''}
                `}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium text-white
                    ${tier.badgeColor}
                  `}>
                    {tier.badge}
                  </span>
                </div>

                {/* Tier Header */}
                <div className="text-center mb-6">
                  <motion.div
                    className={`
                      w-16 h-16 mx-auto mb-4 rounded-2xl
                      bg-gradient-to-br ${tier.color}
                      flex items-center justify-center
                      shadow-lg
                    `}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  
                  {tier.amount > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-3xl font-bold text-white">
                        ${tier.amount.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-sm">USDT</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-white">Custom Amount</span>
                      <Zap className="h-5 w-5 text-amber-400" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm text-center mb-6">
                  {tier.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                      className="flex items-center gap-3"
                    >
                      <div className={`
                        w-2 h-2 rounded-full bg-gradient-to-r ${tier.color}
                      `} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  variant={tier.id === 'professional' ? 'crypto' : tier.id === 'custom' ? 'premium' : 'primary'}
                  size="lg"
                  className="w-full"
                  onClick={() => onTierSelect(tier.amount, tier.id as any)}
                >
                  {tier.id === 'custom' ? 'Enter Custom Amount' : `Deposit $${tier.amount.toLocaleString()}`}
                </Button>

                {/* Tier Highlights */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                  {tier.id === 'starter' && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Beginner Friendly</span>
                    </div>
                  )}
                  {tier.id === 'professional' && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>Enhanced Features</span>
                    </div>
                  )}
                  {tier.id === 'custom' && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Premium Support</span>
                    </div>
                  )}
                </div>

                {/* Animated gradient overlay */}
                <motion.div
                  className={`
                    absolute inset-0 bg-gradient-to-r ${tier.color} 
                    opacity-0 group-hover:opacity-10 transition-opacity duration-300
                    rounded-2xl
                  `}
                />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-400"
      >
        <p>All deposits are processed on the TRC20 network • Minimum deposit: $500 USDT</p>
      </motion.div>
    </div>
  );
}