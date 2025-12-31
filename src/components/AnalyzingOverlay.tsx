import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Sparkles, Eye, Brain, Cpu, Zap } from 'lucide-react';

const analyzingMessages = [
  { icon: Scan, text: "Scanning image..." },
  { icon: Eye, text: "Detecting objects..." },
  { icon: Brain, text: "Processing with AI..." },
  { icon: Sparkles, text: "Identifying features..." },
  { icon: Cpu, text: "Analyzing details..." },
  { icon: Zap, text: "Almost there..." },
];

interface AnalyzingOverlayProps {
  imageData: string;
}

const AnalyzingOverlay = ({ imageData }: AnalyzingOverlayProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % analyzingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = analyzingMessages[messageIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
    >
      {/* Background image with blur */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={imageData}
          alt="Analyzing"
          className="w-full h-full object-cover opacity-20 blur-xl scale-110"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8">
        {/* Animated scanning ring */}
        <div className="relative">
          {/* Outer pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            style={{ width: 160, height: 160, margin: -20 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            style={{ width: 160, height: 160, margin: -20 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            style={{ width: 160, height: 160, margin: -20 }}
          />

          {/* Rotating scan ring */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: 'hsl(var(--primary))',
              borderRightColor: 'hsl(var(--primary) / 0.5)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner circle with image preview */}
          <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-primary/50">
            <img
              src={imageData}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Scanning line effect */}
            <motion.div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Center icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
              <motion.div
                key={messageIndex}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CurrentIcon className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Status text */}
        <div className="text-center space-y-3">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl font-display font-semibold text-foreground"
          >
            {analyzingMessages[messageIndex].text}
          </motion.p>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {analyzingMessages.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === messageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                animate={index === messageIndex ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Fun fact or tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-muted-foreground text-center max-w-xs"
        >
          ✨ VisionAI can identify thousands of objects, animals, plants, and more!
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AnalyzingOverlay;
