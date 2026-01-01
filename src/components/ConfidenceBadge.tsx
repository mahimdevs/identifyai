import { cn } from '@/lib/utils';
import { Check, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  className?: string;
}

const ConfidenceBadge = ({ level, className }: ConfidenceBadgeProps) => {
  const config = {
    high: {
      label: 'High',
      icon: Check,
      bg: 'bg-emerald-500/25',
      border: 'border-emerald-400/40',
      text: 'text-emerald-300',
      glow: 'shadow-emerald-500/20',
    },
    medium: {
      label: 'Medium',
      icon: AlertTriangle,
      bg: 'bg-amber-500/25',
      border: 'border-amber-400/40',
      text: 'text-amber-300',
      glow: 'shadow-amber-500/20',
    },
    low: {
      label: 'Low',
      icon: HelpCircle,
      bg: 'bg-rose-500/25',
      border: 'border-rose-400/40',
      text: 'text-rose-300',
      glow: 'shadow-rose-500/20',
    },
  };

  const { label, icon: Icon, bg, border, text, glow } = config[level];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border backdrop-blur-xl shadow-lg',
        bg,
        border,
        text,
        glow,
        className
      )}
    >
      <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.charAt(0)}</span>
    </motion.span>
  );
};

export default ConfidenceBadge;
