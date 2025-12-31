import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, X, SwitchCamera, Aperture } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isAnalyzing: boolean;
  inlineMode?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onCameraStart?: () => void;
  onCameraStop?: () => void;
}

const CameraView = ({ 
  onCapture, 
  isAnalyzing, 
  inlineMode = false,
  videoRef: externalVideoRef,
  onCameraStart,
  onCameraStop 
}: CameraViewProps) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setIsCameraActive(true);
      onCameraStart?.();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      
      if (externalVideoRef?.current) {
        externalVideoRef.current.srcObject = mediaStream;
        try {
          await externalVideoRef.current.play();
        } catch (playError) {
          // Autoplay may be blocked
        }
      }
      if (internalVideoRef.current) {
        internalVideoRef.current.srcObject = mediaStream;
        try {
          await internalVideoRef.current.play();
        } catch (playError) {
          // Autoplay may be blocked
        }
      }
      
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraActive(false);
      onCameraStop?.();
    }
  }, [facingMode, externalVideoRef, onCameraStart, onCameraStop]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
      onCameraStop?.();
    }
  }, [stream, onCameraStop]);

  const switchCamera = useCallback(async () => {
    stopCamera();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(startCamera, 100);
  }, [stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    const video = externalVideoRef?.current || internalVideoRef.current;
    if (video && canvasRef.current) {
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
  }, [onCapture, stopCamera, externalVideoRef]);

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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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

      {inlineMode && (
        <video
          ref={internalVideoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />
      )}

      <AnimatePresence mode="wait">
        {isCameraActive && !inlineMode ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <video
              ref={internalVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary rounded-br-2xl" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 pb-10 pt-20 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopCamera}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md"
                >
                  <X className="w-5 h-5 text-white" />
                </Button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  disabled={isAnalyzing}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-black/10" />
                </motion.button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={switchCamera}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md"
                >
                  <SwitchCamera className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {isCameraActive && inlineMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2"
              >
                <Button
                  onClick={capturePhoto}
                  disabled={isAnalyzing}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium gap-2"
                >
                  <Aperture className="w-4 h-4" />
                  Capture
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={switchCamera}
                  className="h-12 w-12 rounded-xl"
                >
                  <SwitchCamera className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={stopCamera}
                  className="h-12 w-12 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {(!isCameraActive || !inlineMode) && (
              <div className="flex gap-3 w-full">
                <Button
                  onClick={startCamera}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Open Camera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-12 rounded-xl font-medium gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CameraView;