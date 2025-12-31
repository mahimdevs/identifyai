import { Camera, Leaf, Utensils, Cpu, Dog, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const tips = [
  { icon: Utensils, label: 'Food', description: 'Get nutrition info & calories' },
  { icon: Leaf, label: 'Plants', description: 'Identify species & care tips' },
  { icon: Dog, label: 'Animals', description: 'Recognize breeds & traits' },
  { icon: Cpu, label: 'Gadgets', description: 'Find specs & similar products' },
  { icon: HelpCircle, label: 'Anything', description: 'Identify any object you see' },
];

const TipsCarousel = () => {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
        What can you identify?
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-28 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary/80 hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
              <tip.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="font-medium text-sm text-foreground">{tip.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tip.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TipsCarousel;
