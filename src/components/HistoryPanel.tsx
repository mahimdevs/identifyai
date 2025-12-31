import { useState } from 'react';
import { History, Heart, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/types/analysis';
import HistoryItem from './HistoryItem';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  history: AnalysisResult[];
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (result: AnalysisResult) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

const HistoryPanel = ({
  history,
  isOpen,
  onClose,
  onSelectItem,
  onDeleteItem,
  onClearAll,
}: HistoryPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const filteredHistory = history.filter(item =>
    filter === 'all' ? true : item.isFavorite
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md z-50 glass-panel rounded-l-3xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-display font-semibold">History</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="glass-button w-10 h-10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 p-4 border-b border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={cn(
                    'rounded-full px-4',
                    filter === 'all' && 'bg-primary/20 text-primary'
                  )}
                >
                  All ({history.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('favorites')}
                  className={cn(
                    'rounded-full px-4',
                    filter === 'favorites' && 'bg-primary/20 text-primary'
                  )}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Favorites ({history.filter(h => h.isFavorite).length})
                </Button>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="rounded-full px-4 text-destructive hover:text-destructive ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {filter === 'favorites'
                        ? 'No favorites yet. Tap the heart icon to save items.'
                        : 'No history yet. Start by analyzing an image!'}
                    </p>
                  </div>
                ) : (
                  filteredHistory.map(item => (
                    <HistoryItem
                      key={item.id}
                      result={item}
                      onClick={() => onSelectItem(item)}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel;
