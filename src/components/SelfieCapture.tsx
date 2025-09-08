import React, { useState, useRef, useCallback } from 'react';
import { Camera, RotateCcw, Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface SelfieCaptureProps {
  onNext: (imageData: string) => void;
  onBack: () => void;
  error?: string;
}

export default function SelfieCapture({ onNext, onBack, error }: SelfieCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
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
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const displayError = error || localError;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5D5FEF]/10 rounded-xl mb-3">
            <Camera className="w-6 h-6 text-[#5D5FEF]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Take a Selfie</h3>
          <p className="text-sm text-gray-600">Please take a clear photo of yourself for identity verification</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured selfie"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              
              {!isStreaming && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">Camera preview will appear here</p>
                    <p className="text-xs text-gray-400">Click "Start Camera" to begin</p>
                  </div>
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {displayError && (
            <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">{displayError}</span>
            </div>
          )}

          <div className="flex justify-center space-x-3">
            {!isStreaming && !capturedImage && (
              <button
                onClick={startCamera}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] text-white font-semibold rounded-lg hover:from-[#5D5FEF]/90 hover:to-[#7C3AED]/90 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </button>
            )}
            
            {isStreaming && (
              <button
                onClick={capturePhoto}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] text-white font-semibold rounded-lg hover:from-[#5D5FEF]/90 hover:to-[#7C3AED]/90 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </button>
            )}
            
            {capturedImage && (
              <button
                onClick={retakePhoto}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </button>
            )}
          </div>

          <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-lg p-4 border border-[#5D5FEF]/20">
            <h3 className="font-semibold text-[#5D5FEF] mb-2 flex items-center text-sm">
              <div className="w-1.5 h-1.5 bg-[#5D5FEF] rounded-full mr-2"></div>
              Selfie Guidelines
            </h3>
            <ul className="text-xs text-[#5D5FEF]/80 space-y-1">
              <li className="flex items-start">
                <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                Look directly at the camera with a neutral expression
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                Ensure your face is well-lit and clearly visible
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                Remove sunglasses, hats, or anything covering your face
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                Position yourself in the center of the frame
              </li>
            </ul>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!capturedImage}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] text-white font-semibold rounded-lg hover:from-[#5D5FEF]/90 hover:to-[#7C3AED]/90 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              <Check className="w-4 h-4 mr-2" />
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}