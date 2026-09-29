import React, { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, RotateCcw, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import Callout from './ui/Callout';
import StepFooter from './ui/StepFooter';

interface SelfieCaptureProps {
  onNext: (imageData: string) => void;
  onBack: () => void;
  error?: string;
  initialImage?: string;
  submitLabel?: string;
}

export default function SelfieCapture({
  onNext,
  onBack,
  error,
  initialImage,
  submitLabel = 'Continue to review'
}: SelfieCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage || null);
  const [localError, setLocalError] = useState('');
  const [flashKey, setFlashKey] = useState(0);
  const [missingPhoto, setMissingPhoto] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setLocalError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setLocalError('Unable to access camera. Please ensure you have granted camera permissions.');
      console.error('Camera access error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setMissingPhoto(false);
        setFlashKey(k => k + 1);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleSubmit = () => {
    if (capturedImage) {
      onNext(capturedImage);
    } else {
      setMissingPhoto(true);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const displayError = error || localError;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-navy sm:aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full -scale-x-100 object-cover"
        />

        {isStreaming && !capturedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div className="aspect-[3/4] h-[72%] rounded-[50%] border-2 border-dashed border-ink-on-strong/80 shadow-[0_0_0_9999px_rgba(10,57,112,0.45)]" />
            <p className="absolute bottom-4 rounded-pill bg-navy/80 px-4 py-2 text-small text-ink-on-strong">
              Fit your face inside the oval
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {capturedImage && (
            <motion.img
              key={capturedImage}
              src={capturedImage}
              alt="Captured selfie"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flashKey > 0 && (
            <motion.div
              key={flashKey}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="pointer-events-none absolute inset-0 bg-ink-on-strong"
              aria-hidden
            />
          )}
        </AnimatePresence>

        {!isStreaming && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-ink-on-strong">
            <span className="flex h-12 w-12 items-center justify-center rounded-pill border border-ink-on-strong/30">
              <Camera className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-body font-medium">Your camera preview appears here</p>
              <p className="text-small text-ink-muted-on-strong">We only use the photo for this application.</p>
            </div>
          </div>
        )}

        {capturedImage && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="absolute left-4 top-4 flex items-center gap-1 rounded-pill bg-card px-3 py-1 text-caption font-medium text-pass shadow-card"
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            Photo captured
          </motion.span>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-6 flex justify-center">
        {!isStreaming && !capturedImage && (
          <Button type="button" variant="outline" onClick={startCamera}>
            <Camera className="h-4 w-4" aria-hidden />
            Start camera
          </Button>
        )}
        {isStreaming && (
          <Button type="button" variant="outline" onClick={capturePhoto}>
            <Camera className="h-4 w-4" aria-hidden />
            Take photo
          </Button>
        )}
        {capturedImage && (
          <Button type="button" variant="outline" onClick={retakePhoto}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retake
          </Button>
        )}
      </div>

      <AnimatePresence>
        {displayError && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6" role="alert">
            <Callout tone="fail" title="Camera unavailable">{displayError}</Callout>
          </motion.div>
        )}
      </AnimatePresence>

      {missingPhoto && (
        <p role="alert" className="mt-2 flex items-center justify-center gap-1 text-caption text-fail">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          Take a photo to continue
        </p>
      )}

      <div className="mt-6">
        <p className="mb-3 text-small font-medium">For a clear photo</p>
        <ul className="grid grid-cols-1 gap-3 text-small text-ink-muted sm:grid-cols-2">
          {[
            'Look directly at the camera with a neutral expression',
            'Make sure your face is well lit and clearly visible',
            'Remove sunglasses, hats or anything covering your face',
            'Keep your face centred in the frame'
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-none text-azure" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <StepFooter>
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Button>
        <Button type="button" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </StepFooter>
    </div>
  );
}
