import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, SwitchCamera, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isAnalyzing: boolean;
}

const CameraView = ({ onCapture, isAnalyzing }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const switchCamera = useCallback(async () => {
    stopCamera();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(startCamera, 100);
  }, [stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  }, [onCapture]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, [onCapture]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {isCameraActive ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-full"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-3xl"
            />
            
            {/* Scan overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent scan-line" />
                <div className="absolute inset-0 bg-primary/5" />
              </div>
            )}

            {/* Corner markers */}
            <div className="absolute inset-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary rounded-br-lg" />
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={stopCamera}
                className="glass-button w-12 h-12 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={capturePhoto}
                disabled={isAnalyzing}
                className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center glow-effect disabled:opacity-50"
              >
                <div className="absolute inset-1 rounded-full border-4 border-primary-foreground/30" />
                {isAnalyzing ? (
                  <Zap className="w-8 h-8 text-primary-foreground animate-pulse" />
                ) : (
                  <Camera className="w-8 h-8 text-primary-foreground" />
                )}
              </motion.button>

              <Button
                variant="ghost"
                size="icon"
                onClick={switchCamera}
                className="glass-button w-12 h-12 rounded-full"
              >
                <SwitchCamera className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 px-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center glow-effect"
              >
                <Camera className="w-12 h-12 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-display font-semibold text-foreground">
                Visual AI Recognition
              </h2>
              <p className="text-muted-foreground max-w-xs">
                Point your camera at any object or upload an image to identify and learn more
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
              <Button
                onClick={startCamera}
                className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                <Camera className="w-5 h-5 mr-2" />
                Open Camera
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-14 rounded-2xl border-primary/30 hover:bg-primary/10 font-medium"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CameraView;
