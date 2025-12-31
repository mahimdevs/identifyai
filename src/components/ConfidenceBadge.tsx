import { cn } from '@/lib/utils';
import { Check, AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  className?: string;
}

const ConfidenceBadge = ({ level, className }: ConfidenceBadgeProps) => {
  const config = {
    high: {
      label: 'High',
      icon: Check,
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
    medium: {
      label: 'Medium',
      icon: AlertTriangle,
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
    low: {
      label: 'Low',
      icon: HelpCircle,
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
    },
  };

  const { label, icon: Icon, bg, border, text } = config[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md',
        bg,
        border,
        text,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default ConfidenceBadge;
