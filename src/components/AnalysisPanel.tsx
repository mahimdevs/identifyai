import { Heart, Share2, X, Scale, Hash, Flame, Droplet, Wheat, Dumbbell, ChevronDown, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConfidenceBadge from './ConfidenceBadge';
import { AnalysisResult } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface AnalysisPanelProps {
  result: AnalysisResult;
  onToggleFavorite: () => void;
  onShare: () => void;
  onClose: () => void;
}

// Nutrition color mapping
const nutritionColors: Record<string, { bg: string; fill: string; icon: typeof Flame }> = {
  calories: { bg: 'bg-orange-500/20', fill: 'bg-gradient-to-r from-orange-400 to-orange-500', icon: Flame },
  protein: { bg: 'bg-emerald-500/20', fill: 'bg-gradient-to-r from-emerald-400 to-emerald-500', icon: Dumbbell },
  carbs: { bg: 'bg-amber-500/20', fill: 'bg-gradient-to-r from-amber-400 to-amber-500', icon: Wheat },
  fat: { bg: 'bg-rose-500/20', fill: 'bg-gradient-to-r from-rose-400 to-rose-500', icon: Droplet },
};

// Extract nutrition data from attributes
const extractNutrition = (attributes: { label: string; value: string }[]) => {
  const nutrition: { key: string; label: string; value: string; percentage: number }[] = [];
  
  attributes.forEach(attr => {
    const label = attr.label.toLowerCase();
    if (label.includes('calor')) {
      const match = attr.value.match(/(\d+)/);
      nutrition.push({ key: 'calories', label: 'Calories', value: match ? match[1] : attr.value, percentage: 100 });
    } else if (label.includes('protein')) {
      const match = attr.value.match(/(\d+)/);
      nutrition.push({ key: 'protein', label: 'Protein', value: attr.value, percentage: match ? Math.min(parseInt(match[1]) * 2, 100) : 50 });
    } else if (label.includes('carb')) {
      const match = attr.value.match(/(\d+)/);
      nutrition.push({ key: 'carbs', label: 'Carbs', value: attr.value, percentage: match ? Math.min(parseInt(match[1]), 100) : 50 });
    } else if (label.includes('fat')) {
      const match = attr.value.match(/(\d+)/);
      nutrition.push({ key: 'fat', label: 'Fat', value: attr.value, percentage: match ? Math.min(parseInt(match[1]) * 3, 100) : 50 });
    }
  });
  
  return nutrition;
};

// Get quick stats (non-nutrition attributes)
const getQuickStats = (attributes: { label: string; value: string }[]) => {
  return attributes.filter(attr => {
    const label = attr.label.toLowerCase();
    return !label.includes('calor') && !label.includes('protein') && !label.includes('carb') && !label.includes('fat');
  }).slice(0, 4);
};

const AnalysisPanel = ({ result, onToggleFavorite, onShare, onClose }: AnalysisPanelProps) => {
  const [showTips, setShowTips] = useState(false);
  const nutrition = extractNutrition(result.attributes);
  const quickStats = getQuickStats(result.attributes);
  const mainCalories = nutrition.find(n => n.key === 'calories');
  const otherNutrition = nutrition.filter(n => n.key !== 'calories');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      {/* Blurred background image */}
      <div className="absolute inset-0">
        <img
          src={result.imageData}
          alt=""
          className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 25 }}
        className="relative h-full overflow-y-auto"
      >
        <div className="min-h-full flex flex-col">
          {/* Header with close button */}
          <div className="sticky top-0 z-10 p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/40"
            >
              <X className="w-5 h-5 text-white" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/40"
              >
                <Heart
                  className={cn(
                    'w-5 h-5 transition-colors',
                    result.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/40"
              >
                <Share2 className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 px-4 pb-8 space-y-5">
            {/* Hero image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="relative aspect-square max-w-[280px] mx-auto rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20"
            >
              <img
                src={result.imageData}
                alt={result.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              <ConfidenceBadge level={result.confidence} className="absolute bottom-3 left-3" />
            </motion.div>

            {/* Title & Category */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-1"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wide">
                {result.category}
              </span>
              <h1 className="text-2xl font-display font-bold text-white">
                {result.name}
              </h1>
            </motion.div>

            {/* Quick Stats Row */}
            {quickStats.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-center gap-6 py-3"
              >
                {quickStats.map((stat, index) => {
                  const icons: Record<string, typeof Scale> = {
                    weight: Scale,
                    quantity: Hash,
                    size: Scale,
                    count: Hash,
                  };
                  const IconComponent = icons[stat.label.toLowerCase()] || Scale;
                  
                  return (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{stat.value}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Calories Hero (if food) */}
            {mainCalories && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 backdrop-blur-lg text-center"
              >
                <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-5xl font-display font-bold text-white">
                  {mainCalories.value}
                </p>
                <p className="text-sm text-orange-300/80 font-medium mt-1">calories</p>
              </motion.div>
            )}

            {/* Nutritional Dashboard */}
            {otherNutrition.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg space-y-4"
              >
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">
                  Nutrition Breakdown
                </h3>
                {otherNutrition.map((item, index) => {
                  const colors = nutritionColors[item.key] || nutritionColors.protein;
                  const IconComponent = colors.icon;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-white">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                          className={cn('h-full rounded-full', colors.fill)}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Details accordion (collapsed by default for non-food) */}
            {result.details.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                {result.details.slice(0, 2).map((detail, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg"
                  >
                    <h4 className="text-sm font-semibold text-white mb-2">{detail.title}</h4>
                    <p className="text-sm text-white/60 leading-relaxed">{detail.content}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Tips Section */}
            {result.tips.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="w-full p-4 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-white">Tips & Insights</span>
                  </div>
                  <ChevronDown className={cn(
                    'w-5 h-5 text-primary transition-transform',
                    showTips && 'rotate-180'
                  )} />
                </button>
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 space-y-2 px-2">
                        {result.tips.map((tip, index) => (
                          <motion.li
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3 text-sm text-white/70"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {tip}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Disclaimer */}
            <p className="text-[10px] text-white/30 text-center px-4">
              AI-generated estimates. Actual values may vary.
            </p>

            {/* Scan another button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={onClose}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
              >
                Scan Another
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisPanel;
