import { useState, useCallback } from 'react';
import { History, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CameraView from '@/components/CameraView';
import AnalysisPanel from '@/components/AnalysisPanel';
import HistoryPanel from '@/components/HistoryPanel';
import { useHistory } from '@/hooks/useHistory';
import { AnalysisResult } from '@/types/analysis';

const Index = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const {
    history,
    addToHistory,
    toggleFavorite,
    deleteItem,
    clearAll,
  } = useHistory();

  // Mock analysis for now - will be replaced with Gemini API
  const analyzeImage = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock result - this will be replaced with actual Gemini API response
    const mockResult: AnalysisResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageData,
      name: 'Golden Retriever',
      category: 'Animal / Dog',
      confidence: 'high',
      attributes: [
        { label: 'Breed', value: 'Golden Retriever' },
        { label: 'Size', value: 'Large (55-75 lbs)' },
        { label: 'Coat', value: 'Golden, Dense' },
        { label: 'Temperament', value: 'Friendly, Intelligent' },
      ],
      details: [
        {
          title: 'Breed Information',
          content: 'The Golden Retriever is a medium-large gun dog that was bred to retrieve shot waterfowl during hunting. They are known for their friendly, reliable, and kind temperament.',
        },
        {
          title: 'Care Requirements',
          content: 'Golden Retrievers require regular grooming due to their dense coat. They need daily exercise and mental stimulation. Regular vet check-ups are important as they can be prone to hip dysplasia.',
        },
        {
          title: 'Training Notes',
          content: 'Highly trainable and eager to please. Responds well to positive reinforcement. Early socialization is recommended.',
        },
      ],
      tips: [
        'Excellent family pet with a gentle disposition',
        'Requires 1-2 hours of exercise daily',
        'Regular brushing prevents matting and reduces shedding',
        'Prone to obesity - monitor food intake',
      ],
      isFavorite: false,
    };

    setCurrentResult(mockResult);
    addToHistory(mockResult);
    setIsAnalyzing(false);
  }, [addToHistory]);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg">
              <span className="text-gradient">Vision</span>
              <span className="text-foreground">AI</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
              className="glass-button w-10 h-10 rounded-full relative"
            >
              <History className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pt-20 pb-8">
        <div className="w-full max-w-2xl aspect-[3/4] sm:aspect-video">
          <CameraView onCapture={analyzeImage} isAnalyzing={isAnalyzing} />
        </div>
      </main>

      {/* Analysis Panel */}
      <AnimatePresence>
        {currentResult && (
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
