import { Heart, Share2, Bookmark, Info, Lightbulb, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ConfidenceBadge from './ConfidenceBadge';
import ExpandableSection from './ExpandableSection';
import { AnalysisResult } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface AnalysisPanelProps {
  result: AnalysisResult;
  onToggleFavorite: () => void;
  onShare: () => void;
  onClose: () => void;
}

const AnalysisPanel = ({ result, onToggleFavorite, onShare, onClose }: AnalysisPanelProps) => {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden"
    >
      <div className="glass-panel rounded-t-3xl max-h-[85vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="sticky top-0 bg-card/90 backdrop-blur-xl pt-3 pb-2 px-4 z-10">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto" />
        </div>

        <div className="px-6 pb-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                  {result.category}
                </span>
                <ConfidenceBadge level={result.confidence} />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                {result.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className="glass-button w-10 h-10 rounded-full"
              >
                <Heart
                  className={cn(
                    'w-5 h-5 transition-colors',
                    result.isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                className="glass-button w-10 h-10 rounded-full"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Image preview */}
          <div className="relative rounded-2xl overflow-hidden aspect-video">
            <img
              src={result.imageData}
              alt={result.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Attributes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Key Attributes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {result.attributes.map((attr, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-secondary/50 border border-border/50"
                >
                  <p className="text-xs text-muted-foreground mb-1">{attr.label}</p>
                  <p className="text-sm font-medium text-foreground">{attr.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Details */}
          <div className="space-y-3">
            {result.details.map((detail, index) => (
              <ExpandableSection
                key={index}
                title={detail.title}
                icon={<Info className="w-4 h-4" />}
                defaultOpen={index === 0}
              >
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {detail.content}
                </p>
              </ExpandableSection>
            ))}
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <ExpandableSection
              title="Suggested Actions & Tips"
              icon={<Lightbulb className="w-4 h-4" />}
              defaultOpen
            >
              <ul className="space-y-2">
                {result.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground/60 text-center italic px-4">
            Results are AI-generated estimates based on visual analysis. 
            Actual properties may vary.
          </p>

          {/* Close button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-12 rounded-xl border-primary/30 hover:bg-primary/10"
          >
            Analyze Another
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisPanel;
