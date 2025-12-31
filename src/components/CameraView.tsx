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
        stopCamera();
        onCapture(imageData);
      }
    }
  }, [onCapture, stopCamera]);

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
    <>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Scan overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent scan-line" />
                <div className="absolute inset-0 bg-primary/5" />
              </div>
            )}

            {/* Corner markers */}
            <div className="absolute inset-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-16 h-16 border-l-3 border-t-3 border-primary rounded-tl-2xl" style={{ borderWidth: '3px' }} />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-3 border-t-3 border-primary rounded-tr-2xl" style={{ borderWidth: '3px' }} />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-3 border-b-3 border-primary rounded-bl-2xl" style={{ borderWidth: '3px' }} />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-3 border-b-3 border-primary rounded-br-2xl" style={{ borderWidth: '3px' }} />
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-0 left-0 right-0 pb-10 pt-20 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopCamera}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                >
                  <X className="w-6 h-6 text-white" />
                </Button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  disabled={isAnalyzing}
                  className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center disabled:opacity-50"
                >
                  <div className="absolute inset-1 rounded-full border-4 border-black/20" />
                  {isAnalyzing ? (
                    <Zap className="w-8 h-8 text-primary animate-pulse" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white border-4 border-black/10" />
                  )}
                </motion.button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={switchCamera}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                >
                  <SwitchCamera className="w-6 h-6 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={startCamera}
              className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base gap-3"
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-14 rounded-2xl border-2 border-border hover:bg-secondary font-semibold text-base gap-3"
            >
              <Upload className="w-5 h-5" />
              Upload Photo
            </Button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CameraView;
