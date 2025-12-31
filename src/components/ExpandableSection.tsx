import { useState, forwardRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const ExpandableSection = forwardRef<HTMLDivElement, ExpandableSectionProps>(
  ({ title, icon, children, defaultOpen = false, className }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div ref={ref} className={cn('rounded-xl bg-secondary/50 overflow-hidden', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon && <span className="text-primary">{icon}</span>}
            <span className="font-medium text-foreground">{title}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 pb-4 pt-0">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

ExpandableSection.displayName = 'ExpandableSection';

export default ExpandableSection;
