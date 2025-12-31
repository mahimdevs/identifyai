import { Heart, Clock, ChevronRight } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';
import ConfidenceBadge from './ConfidenceBadge';
import { cn } from '@/lib/utils';

interface HistoryItemProps {
  result: AnalysisResult;
  onClick: () => void;
}

const HistoryItem = ({ result, onClick }: HistoryItemProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
        <img
          src={result.imageData}
          alt={result.name}
          className="w-full h-full object-cover"
        />
        {result.isFavorite && (
          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive/90 flex items-center justify-center">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-primary font-medium">{result.category}</span>
          <ConfidenceBadge level={result.confidence} className="scale-75 origin-left" />
        </div>
        <h3 className="font-medium text-foreground truncate">{result.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          {formatTime(result.timestamp)}
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
};

export default HistoryItem;
