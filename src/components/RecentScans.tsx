import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

interface RecentScansProps {
  history: AnalysisResult[];
  onSelectItem: (result: AnalysisResult) => void;
}

const RecentScans = ({ history, onSelectItem }: RecentScansProps) => {
  const recentItems = history.slice(0, 5);

  if (recentItems.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Recent Scans</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {recentItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectItem(item)}
            className="flex-shrink-0 group relative"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-colors">
              <img
                src={item.imageData}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
              <p className="text-[10px] font-medium text-white truncate">{item.name}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default RecentScans;
