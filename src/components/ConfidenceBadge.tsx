import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  className?: string;
}

const ConfidenceBadge = ({ level, className }: ConfidenceBadgeProps) => {
  const labels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        level === 'high' && 'confidence-high',
        level === 'medium' && 'confidence-medium',
        level === 'low' && 'confidence-low',
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-2',
        level === 'high' && 'bg-success',
        level === 'medium' && 'bg-warning',
        level === 'low' && 'bg-destructive',
      )} />
      {labels[level]}
    </span>
  );
};

export default ConfidenceBadge;
