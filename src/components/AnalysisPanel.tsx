import { Heart, Share2, X, Scale, Hash, Flame, Droplet, Wheat, Dumbbell, ChevronDown, Lightbulb, Sparkles, Languages, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import ConfidenceBadge from './ConfidenceBadge';
import { AnalysisResult } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface AnalysisPanelProps {
  result: AnalysisResult;
  onToggleFavorite: () => void;
  onShare: () => void;
  onClose: () => void;
}

// Nutrition color mapping
const nutritionColors: Record<string, { bg: string; fill: string; glow: string; icon: typeof Flame }> = {
  calories: { bg: 'bg-orange-500/20', fill: 'bg-gradient-to-r from-orange-400 to-amber-400', glow: 'shadow-orange-500/30', icon: Flame },
  protein: { bg: 'bg-emerald-500/20', fill: 'bg-gradient-to-r from-emerald-400 to-teal-400', glow: 'shadow-emerald-500/30', icon: Dumbbell },
  carbs: { bg: 'bg-amber-500/20', fill: 'bg-gradient-to-r from-amber-400 to-yellow-400', glow: 'shadow-amber-500/30', icon: Wheat },
  fat: { bg: 'bg-rose-500/20', fill: 'bg-gradient-to-r from-rose-400 to-pink-400', glow: 'shadow-rose-500/30', icon: Droplet },
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const AnalysisPanel = ({ result, onToggleFavorite, onShare, onClose }: AnalysisPanelProps) => {
  const [showTips, setShowTips] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<Partial<AnalysisResult> | null>(null);
  
  const { languageName, isTranslating, translateContent, isEnglish } = useTranslation();
  
  // Use translated content if available
  const displayResult = useMemo(() => {
    if (isTranslated && translatedResult) {
      return {
        ...result,
        name: translatedResult.name || result.name,
        category: translatedResult.category || result.category,
        attributes: translatedResult.attributes || result.attributes,
        details: translatedResult.details || result.details,
        tips: translatedResult.tips || result.tips,
      };
    }
    return result;
  }, [result, isTranslated, translatedResult]);
  
  const nutrition = extractNutrition(displayResult.attributes);
  const quickStats = getQuickStats(displayResult.attributes);
  const mainCalories = nutrition.find(n => n.key === 'calories');
  const otherNutrition = nutrition.filter(n => n.key !== 'calories');
  
  const handleTranslate = async () => {
    if (isTranslated) {
      // Toggle back to English
      setIsTranslated(false);
      return;
    }
    
    const contentToTranslate = {
      name: result.name,
      category: result.category,
      attributes: result.attributes,
      details: result.details,
      tips: result.tips,
    };
    
    const translated = await translateContent(contentToTranslate);
    if (translated) {
      setTranslatedResult(translated);
      setIsTranslated(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50"
    >
      {/* Animated blurred background */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <img
          src={result.imageData}
          alt=""
          className="w-full h-full object-cover blur-3xl saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-primary/30 blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-40 -right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 28, stiffness: 200 }}
        className="relative h-full overflow-y-auto scrollbar-hide"
      >
        <motion.div 
          className="min-h-full flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header with close button */}
          <motion.div 
            className="sticky top-0 z-10 p-4 flex items-center justify-between"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </motion.div>
            <div className="flex gap-3">
              {/* Translate button - only show if not English */}
              {!isEnglish && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className={cn(
                      "w-11 h-11 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-lg",
                      isTranslated 
                        ? "bg-primary/30 border-primary/50 hover:bg-primary/40" 
                        : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30"
                    )}
                  >
                    {isTranslating ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : isTranslated ? (
                      <Check className="w-5 h-5 text-primary" />
                    ) : (
                      <Languages className="w-5 h-5 text-white" />
                    )}
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleFavorite}
                  className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
                >
                  <Heart
                    className={cn(
                      'w-5 h-5 transition-all duration-300',
                      result.isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'
                    )}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShare}
                  className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="flex-1 px-5 pb-10 space-y-6">
            {/* Hero image */}
            <motion.div
              variants={itemVariants}
              className="relative aspect-square max-w-[260px] mx-auto"
            >
              <motion.div
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/40 via-purple-500/20 to-transparent blur-2xl"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-white/30">
                <img
                  src={result.imageData}
                  alt={result.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <ConfidenceBadge level={result.confidence} className="absolute bottom-4 left-4" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title & Category */}
            <motion.div
              variants={itemVariants}
              className="text-center space-y-2"
            >
              <motion.span 
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider"
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="w-3 h-3" />
                {displayResult.category}
              </motion.span>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                {displayResult.name}
              </h1>
              
              {/* Language indicator */}
              {!isEnglish && (
                <motion.button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs font-medium hover:bg-white/15 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Translating...
                    </>
                  ) : isTranslated ? (
                    <>
                      <Check className="w-3 h-3 text-primary" />
                      {languageName}
                      <span className="text-white/50">• Tap for English</span>
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      Translate to {languageName}
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>

            {/* Quick Stats Row */}
            {quickStats.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-4 py-2"
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
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <IconComponent className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-white">{stat.value}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Calories Hero (if food) */}
            {mainCalories && (
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-orange-500/25 via-amber-500/15 to-orange-600/10 border border-orange-400/30 backdrop-blur-xl text-center"
              >
                <motion.div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-400/20 blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Flame className="w-10 h-10 text-orange-400 mx-auto mb-3 drop-shadow-lg" />
                </motion.div>
                <motion.p 
                  className="text-6xl font-display font-bold text-white drop-shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  {mainCalories.value}
                </motion.p>
                <p className="text-sm text-orange-200/80 font-medium mt-1 uppercase tracking-wide">calories</p>
              </motion.div>
            )}

            {/* Nutritional Dashboard */}
            {otherNutrition.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="p-5 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl space-y-5"
              >
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary" />
                  Nutrition Breakdown
                </h3>
                {otherNutrition.map((item, index) => {
                  const colors = nutritionColors[item.key] || nutritionColors.protein;
                  const IconComponent = colors.icon;
                  
                  return (
                    <motion.div 
                      key={index} 
                      className="space-y-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-lg', colors.bg, colors.glow)}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </motion.div>
                          <span className="text-sm font-semibold text-white">{item.label}</span>
                        </div>
                        <span className="text-base font-bold text-white">{item.value}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                          className={cn('h-full rounded-full shadow-lg', colors.fill, colors.glow)}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Details Cards */}
            {displayResult.details.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="space-y-4"
              >
                {displayResult.details.slice(0, 2).map((detail, index) => (
                  <motion.div
                    key={index}
                    className="p-5 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl overflow-hidden relative"
                    whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.25)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {detail.title}
                    </h4>
                    <p className="text-sm text-white/75 leading-relaxed">{detail.content}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Tips Section */}
            {displayResult.tips.length > 0 && (
              <motion.div variants={itemVariants}>
                <motion.button
                  onClick={() => setShowTips(!showTips)}
                  className="w-full p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/25 backdrop-blur-xl flex items-center justify-between group"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="w-12 h-12 rounded-2xl bg-primary/25 flex items-center justify-center shadow-lg shadow-primary/20"
                      animate={{ rotate: showTips ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </motion.div>
                    <span className="font-bold text-white text-base">Tips & Insights</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showTips ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-primary" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-4 space-y-3 px-1">
                        {displayResult.tips.map((tip, index) => (
                          <motion.li
                            key={index}
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
                            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                          >
                            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-lg shadow-primary/30" />
                            <span className="text-sm text-white/80 leading-relaxed">{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Disclaimer */}
            <motion.p 
              variants={itemVariants}
              className="text-[11px] text-white/40 text-center px-4 py-2"
            >
              AI-generated estimates. Actual values may vary.
            </motion.p>

            {/* Scan another button */}
            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full h-16 rounded-3xl bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground hover:opacity-90 font-bold text-lg shadow-xl shadow-primary/30 border border-white/10"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Scan Another
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisPanel;
