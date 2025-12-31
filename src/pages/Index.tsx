import { useState, useCallback, useRef } from 'react';
import { History, Search, Camera, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CameraView from '@/components/CameraView';
import AnalysisPanel from '@/components/AnalysisPanel';
import HistoryPanel from '@/components/HistoryPanel';
import AnalyzingOverlay from '@/components/AnalyzingOverlay';
import { useHistory } from '@/hooks/useHistory';
import { AnalysisResult } from '@/types/analysis';
import { analyzeImage } from '@/services/analysisService';

const Index = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    history,
    addToHistory,
    toggleFavorite,
    deleteItem,
    clearAll,
  } = useHistory();

  const handleAnalyzeImage = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalyzingImage(imageData);
    
    try {
      const result = await analyzeImage(imageData);
      setCurrentResult(result);
      addToHistory(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unable to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
      setAnalyzingImage(null);
    }
  }, [addToHistory, toast]);

  const handleShare = useCallback(async () => {
    if (!currentResult) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Identified: ${currentResult.name}`,
          text: `I identified a ${currentResult.name} using IdentifyAnytime!\n\nCategory: ${currentResult.category}\nConfidence: ${currentResult.confidence}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `Identified: ${currentResult.name}\nCategory: ${currentResult.category}\nConfidence: ${currentResult.confidence}`
        );
        toast({
          title: 'Copied to clipboard!',
          description: 'Analysis result has been copied.',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [currentResult, toast]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentResult) return;
    toggleFavorite(currentResult.id);
    setCurrentResult(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
  }, [currentResult, toggleFavorite]);

  const recentScans = history.slice(0, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Search className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">
              IdentifyAnytime
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
              className="w-10 h-10 rounded-xl hover:bg-secondary relative"
            >
              <History className="w-5 h-5 text-muted-foreground" />
              {history.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-5 max-w-md mx-auto w-full">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Identify Anything
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Point your camera at any object and get instant AI-powered identification
          </p>
        </motion.div>

        {/* Animated Magnifying Glass with Camera */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative flex items-center justify-center mb-10"
        >
          {/* Outer glow rings - only when camera not active */}
          {!isCameraActive && (
            <>
              <motion.div
                className="absolute w-56 h-56 rounded-full border border-primary/20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-48 h-48 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.2, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
            </>
          )}

          {/* Scanning rings when camera active */}
          {isCameraActive && (
            <>
              <motion.div
                className="absolute w-44 h-44 rounded-full border-2 border-primary/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute w-44 h-44 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
            </>
          )}
          
          {/* Main magnifying glass */}
          <div className="relative">
            <motion.div
              animate={isCameraActive ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Glass circle with camera or animation */}
              <div className="w-40 h-40 rounded-full border-[5px] border-primary flex items-center justify-center relative overflow-hidden bg-primary/5 shadow-lg shadow-primary/20">
                {/* Video feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Scanning line when camera active */}
                {isCameraActive && (
                  <motion.div
                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
                    animate={{ y: [-60, 60] }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  />
                )}

                {/* Corner markers when camera active */}
                {isCameraActive && (
                  <div className="absolute inset-3 pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-white/80 rounded-tl" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-white/80 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-white/80 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-white/80 rounded-br" />
                  </div>
                )}
                
                {/* Animation when camera not active */}
                {!isCameraActive && (
                  <>
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                      animate={{ x: [-120, 120], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                    
                    {/* Inner scanning lines */}
                    <motion.div
                      className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                      animate={{ y: [-50, 50] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    />
                    
                    {/* Center icon */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Search className="w-12 h-12 text-primary" />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
            
          </div>
          
          {/* Floating particles - only when camera not active */}
          {!isCameraActive && (
            <>
              <motion.div
                className="absolute top-4 right-8 w-2 h-2 rounded-full bg-primary/60"
                animate={{ y: [-8, 8], x: [0, 4, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-8 left-6 w-1.5 h-1.5 rounded-full bg-primary/50"
                animate={{ y: [6, -6], x: [0, -3, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute top-12 left-4 w-1 h-1 rounded-full bg-primary/40"
                animate={{ y: [-4, 4], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <CameraView 
            onCapture={handleAnalyzeImage} 
            isAnalyzing={isAnalyzing}
            inlineMode={true}
            videoRef={videoRef}
            onCameraStart={() => setIsCameraActive(true)}
            onCameraStop={() => setIsCameraActive(false)}
          />
        </motion.div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pb-8"
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent</h2>
            <div className="grid grid-cols-4 gap-3">
              {recentScans.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onClick={() => setCurrentResult(item)}
                  className="aspect-square rounded-xl overflow-hidden border border-border hover:border-primary transition-colors"
                >
                  <img
                    src={item.imageData}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Categories */}
        {recentScans.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pb-8"
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-3">What can you identify?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Plants & Flowers', emoji: '🌿' },
                { label: 'Animals & Pets', emoji: '🐕' },
                { label: 'Food & Dishes', emoji: '🍽️' },
                { label: 'Objects & More', emoji: '📦' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-4 rounded-xl bg-secondary/50 border border-border"
                >
                  <span className="text-2xl mb-2 block">{item.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Analyzing Overlay */}
      <AnimatePresence>
        {isAnalyzing && analyzingImage && (
          <AnalyzingOverlay imageData={analyzingImage} />
        )}
      </AnimatePresence>

      {/* Analysis Panel */}
      <AnimatePresence>
        {currentResult && !isAnalyzing && (
          <AnalysisPanel
            result={currentResult}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onClose={() => setCurrentResult(null)}
          />
        )}
      </AnimatePresence>

      {/* History Panel */}
      <HistoryPanel
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectItem={(result) => {
          setCurrentResult(result);
          setIsHistoryOpen(false);
        }}
        onDeleteItem={deleteItem}
        onClearAll={clearAll}
      />
    </div>
  );
};

export default Index;