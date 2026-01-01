import { Heart, Share2, X, Scale, Hash, Flame, Droplet, Wheat, Dumbbell, ChevronDown, Lightbulb, Sparkles, Languages, Loader2, Check, Info, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ConfidenceBadge from './ConfidenceBadge';
import { AnalysisResult } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import AIChatBox from './AIChatBox';

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

const AnalysisPanel = ({ result, onToggleFavorite, onShare, onClose }: AnalysisPanelProps) => {
  const [showTips, setShowTips] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<Partial<AnalysisResult> | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    detectedLanguageName, 
    selectedLanguage, 
    setSelectedLanguage,
    isTranslating, 
    translateContent, 
    isEnglish,
    availableLanguages 
  } = useTranslation();
  
  // Get the display language name
  const targetLanguageName = selectedLanguage 
    ? availableLanguages[selectedLanguage] 
    : detectedLanguageName;
  
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

  // Handle scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 300);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleTranslate = async (langCode?: string) => {
    if (isTranslated && !langCode) {
      setIsTranslated(false);
      setShowLanguageSelector(false);
      return;
    }
    
    const contentToTranslate = {
      name: result.name,
      category: result.category,
      attributes: result.attributes,
      details: result.details,
      tips: result.tips,
    };
    
    const translated = await translateContent(contentToTranslate, langCode);
    if (translated) {
      setTranslatedResult(translated);
      setIsTranslated(true);
      setShowLanguageSelector(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50"
    >
      {/* Animated blurred background */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={result.imageData}
          alt=""
          className="w-full h-full object-cover blur-3xl saturate-150 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/95" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-primary/20 blur-[100px]"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 -right-24 w-96 h-96 rounded-full bg-purple-500/15 blur-[120px]"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px]"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        ref={scrollContainerRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative h-full overflow-y-auto scrollbar-hide overscroll-contain"
      >
        <div className="min-h-full flex flex-col">
          {/* Sticky Header */}
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="sticky top-0 z-20 px-4 py-3 sm:px-6 sm:py-4"
          >
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/25 hover:border-white/35 transition-all duration-300 shadow-xl"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </Button>
              </motion.div>
              <div className="flex gap-2 sm:gap-3">
                {!isEnglish && (
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTranslate()}
                      disabled={isTranslating}
                      className={cn(
                        "w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-2xl border transition-all duration-300 shadow-xl",
                        isTranslated 
                          ? "bg-primary/30 border-primary/50 hover:bg-primary/40" 
                          : "bg-white/10 border-white/20 hover:bg-white/25 hover:border-white/35"
                      )}
                    >
                      {isTranslating ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                      ) : isTranslated ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      ) : (
                        <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </Button>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleFavorite}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/25 hover:border-white/35 transition-all duration-300 shadow-xl"
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300',
                        result.isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'
                      )}
                    />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShare}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/25 hover:border-white/35 transition-all duration-300 shadow-xl"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Main content */}
          <div className="flex-1 px-4 sm:px-6 pb-8 sm:pb-12 max-w-lg mx-auto w-full">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6 sm:mb-8"
            >
              {/* Image with floating effect */}
              <div className="relative aspect-square max-w-[220px] sm:max-w-[280px] mx-auto">
                <motion.div
                  className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/40 via-primary/20 to-purple-500/20 blur-3xl"
                  animate={{ 
                    opacity: [0.4, 0.7, 0.4],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="rounded-[2rem] overflow-hidden shadow-2xl ring-2 ring-white/20">
                    <img
                      src={result.imageData}
                      alt={result.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4"
                  >
                    <ConfidenceBadge level={result.confidence} />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Title & Category */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-center mb-6 sm:mb-8"
            >
              <motion.span 
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3"
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {displayResult.category}
              </motion.span>
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {displayResult.name}
              </motion.h1>
              
              {/* Language toggle */}
              <motion.div 
                className="relative inline-block mt-3 sm:mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <motion.button
                  onClick={() => {
                    if (isEnglish) {
                      setShowLanguageSelector(!showLanguageSelector);
                    } else {
                      handleTranslate();
                    }
                  }}
                  disabled={isTranslating}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-[10px] sm:text-xs font-medium hover:bg-white/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : isTranslated ? (
                    <>
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span>{targetLanguageName}</span>
                      <span className="text-white/50 hidden sm:inline">• Tap for English</span>
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>
                        {isEnglish ? 'Translate' : `Translate to ${targetLanguageName}`}
                      </span>
                      {isEnglish && <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                    </>
                  )}
                </motion.button>
                
                {/* Language selector dropdown */}
                <AnimatePresence>
                  {showLanguageSelector && isEnglish && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-44 sm:w-48 max-h-56 sm:max-h-64 overflow-y-auto rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl z-50 scrollbar-hide"
                    >
                      <div className="p-1.5 sm:p-2 space-y-0.5 sm:space-y-1">
                        {Object.entries(availableLanguages)
                          .filter(([code]) => code !== 'en')
                          .map(([code, name]) => (
                            <motion.button
                              key={code}
                              onClick={() => {
                                setSelectedLanguage(code);
                                handleTranslate(code);
                              }}
                              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-white/80 hover:bg-white/10 rounded-xl transition-colors"
                              whileHover={{ x: 4 }}
                            >
                              {name}
                            </motion.button>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Quick Stats */}
            {quickStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8"
              >
                {quickStats.map((stat, index) => {
                  const icons: Record<string, typeof Scale> = {
                    weight: Scale,
                    quantity: Hash,
                    size: Scale,
                    count: Hash,
                  };
                  const IconComponent = icons[stat.label.toLowerCase()] || Info;
                  
                  return (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[100px] sm:max-w-[140px]">{stat.value}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Calories Hero */}
            {mainCalories && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative overflow-hidden p-5 sm:p-6 rounded-[1.5rem] sm:rounded-3xl bg-gradient-to-br from-orange-500/25 via-amber-500/15 to-orange-600/10 border border-orange-400/30 backdrop-blur-xl text-center mb-5 sm:mb-6"
              >
                <motion.div
                  className="absolute -top-12 -right-12 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-orange-400/25 blur-3xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                    rotate: [0, 8, -8, 0],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 mx-auto mb-2 sm:mb-3 drop-shadow-lg" />
                </motion.div>
                <motion.p 
                  className="text-5xl sm:text-6xl font-display font-bold text-white drop-shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 180 }}
                >
                  {mainCalories.value}
                </motion.p>
                <p className="text-xs sm:text-sm text-orange-200/80 font-medium mt-1 uppercase tracking-wide">calories</p>
              </motion.div>
            )}

            {/* Nutrition Dashboard */}
            {otherNutrition.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl space-y-4 sm:space-y-5 mb-5 sm:mb-6"
              >
                <h3 className="text-[10px] sm:text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-3 sm:h-4 rounded-full bg-primary" />
                  Nutrition Breakdown
                </h3>
                {otherNutrition.map((item, index) => {
                  const colors = nutritionColors[item.key] || nutritionColors.protein;
                  const IconComponent = colors.icon;
                  
                  return (
                    <motion.div 
                      key={index} 
                      className="space-y-2 sm:space-y-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <motion.div 
                            className={cn('w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg', colors.bg, colors.glow)}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </motion.div>
                          <span className="text-xs sm:text-sm font-semibold text-white">{item.label}</span>
                        </div>
                        <span className="text-sm sm:text-base font-bold text-white">{item.value}</span>
                      </div>
                      <div className="h-2 sm:h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: 0.65 + index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 sm:space-y-4 mb-5 sm:mb-6"
              >
                {displayResult.details.slice(0, 3).map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.55 + index * 0.08 }}
                    className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl overflow-hidden relative group"
                  >
                    <motion.div
                      className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-primary/25 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-2 group-hover:text-primary transition-colors">
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary" />
                      {detail.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{detail.content}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Tips Section */}
            {displayResult.tips.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-5 sm:mb-6"
              >
                <motion.button
                  onClick={() => setShowTips(!showTips)}
                  className="w-full p-4 sm:p-5 rounded-[1.5rem] sm:rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/25 backdrop-blur-xl flex items-center justify-between group"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <motion.div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/25 flex items-center justify-center shadow-lg shadow-primary/20"
                      animate={{ rotate: showTips ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </motion.div>
                    <div className="text-left">
                      <span className="font-bold text-white text-sm sm:text-base block">Tips & Insights</span>
                      <span className="text-[10px] sm:text-xs text-white/50">{displayResult.tips.length} helpful tips</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showTips ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 px-1">
                        {displayResult.tips.map((tip, index) => (
                          <motion.li
                            key={index}
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.06, type: 'spring', stiffness: 300 }}
                            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10"
                          >
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-lg shadow-primary/30" />
                            <span className="text-xs sm:text-sm text-white/80 leading-relaxed">{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* AI Chat Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mb-5 sm:mb-6"
            >
              <AIChatBox 
                context={{
                  name: displayResult.name,
                  category: displayResult.category,
                  attributes: displayResult.attributes,
                  details: displayResult.details,
                  tips: displayResult.tips,
                }}
              />
            </motion.div>

            {/* Disclaimer */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-[10px] sm:text-[11px] text-white/40 text-center px-4 py-2 mb-4 sm:mb-6"
            >
              AI-generated estimates. Actual values may vary.
            </motion.p>

            {/* Scan another button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground hover:opacity-90 font-bold text-base sm:text-lg shadow-xl shadow-primary/30 border border-white/10"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Scan Another
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl z-30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalysisPanel;
