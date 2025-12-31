import { useState, useCallback, useRef } from 'react';
import { History, Sparkles, Scan } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CameraView from '@/components/CameraView';
import AnalysisPanel from '@/components/AnalysisPanel';
import HistoryPanel from '@/components/HistoryPanel';
import AnalyzingOverlay from '@/components/AnalyzingOverlay';
import TipsCarousel from '@/components/TipsCarousel';
import RecentScans from '@/components/RecentScans';
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
          text: `I identified a ${currentResult.name} using Visual AI!\n\nCategory: ${currentResult.category}\nConfidence: ${currentResult.confidence}`,
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

  return (
    <div className="min-h-screen mesh-gradient flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-4 pt-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">
                <span className="text-gradient">Vision</span>
                <span className="text-foreground">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground">Identify anything instantly</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
              className="w-11 h-11 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary relative"
            >
              <History className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content - Pushed to bottom third */}
      <main className="flex-1 flex flex-col justify-end relative z-10">
        {/* Center visual element / Camera preview */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center backdrop-blur-sm overflow-hidden relative">
              {/* Video element always in DOM */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  video.play().catch(() => console.log('Video play handled'));
                }}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {/* Scanning overlay - only when camera active */}
              {isCameraActive && (
                <>
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-2 pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-primary rounded-br-lg" />
                  </div>
                </>
              )}
              
              {/* Scan icon - only when camera inactive */}
              <AnimatePresence>
                {!isCameraActive && (
                  <motion.div
                    key="scan-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="float-animation"
                  >
                    <Scan className="w-16 h-16 text-primary/60" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Floating particles */}
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary/40"
              animate={{ y: [-5, 5, -5], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-3 -left-3 w-3 h-3 rounded-full bg-primary/30"
              animate={{ y: [5, -5, 5], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 -left-4 w-2 h-2 rounded-full bg-primary/50"
              animate={{ x: [-3, 3, -3], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Bottom section with controls */}
        <div className="px-4 pb-8 space-y-6 max-w-lg mx-auto w-full">
          {/* Recent scans or tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {history.length > 0 ? (
              <RecentScans 
                history={history} 
                onSelectItem={(result) => setCurrentResult(result)} 
              />
            ) : (
              <TipsCarousel />
            )}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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

          {/* Subtle instruction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground"
          >
            {isCameraActive ? 'Position the item in the frame and capture' : 'Point at any object to identify it with AI'}
          </motion.p>
        </div>
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
