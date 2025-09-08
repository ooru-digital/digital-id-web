import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, ArrowRight, Loader2, CheckCircle, Scan, Eye } from 'lucide-react';
import { OCRService, defaultOCRConfig, OCRResult } from '../services/ocrService';

interface DocumentUploadProps {
  onNext: (file: File, extractedData?: any) => void;
}

export default function DocumentUpload({ onNext }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [structuredData, setStructuredData] = useState<any | null>(null);
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const validateFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      return false;
    }

    setError('');
    return true;
  };

  const createPreviewUrl = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const animateScanLine = () => {
    let position = 0;
    const interval = setInterval(() => {
      position += 2;
      setScanLinePosition(position);
      if (position >= 100) {
        position = 0;
      }
    }, 50);

    return interval;
  };

  const simulateProcessingSteps = async () => {
    const steps = [
      { message: 'Initializing scanner...', progress: 10, duration: 800 },
      { message: 'Analyzing document structure...', progress: 25, duration: 1200 },
      { message: 'Extracting text with OCR...', progress: 50, duration: 2500 },
      { message: 'Processing with AI...', progress: 75, duration: 2000 },
      { message: 'Structuring data...', progress: 90, duration: 1000 },
      { message: 'Finalizing extraction...', progress: 100, duration: 800 }
    ];

    for (const step of steps) {
      setProcessingStep(step.message);
      setProcessingProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  };

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    setError('');
    setStructuredData(null);
    setScanLinePosition(0);

    try {
      // Start the scanning animation
      const scanInterval = animateScanLine();
      
      // Start the visual animation
      const animationPromise = simulateProcessingSteps();
      
      // Start the actual OCR processing
      const ocrService = new OCRService(defaultOCRConfig);
      const processingPromise = ocrService.processDocument(file, (message) => {
        // We're using our own animation, so we don't need these progress messages
      });

      // Wait for both to complete
      const [, result] = await Promise.all([animationPromise, processingPromise]);

      // Stop the scanning animation
      clearInterval(scanInterval);
      setScanLinePosition(0);

      if (result.success && result.structuredData) {
        setStructuredData(result.structuredData);
        
        // Auto-advance to the next step after a brief delay
        setTimeout(() => {
          onNext(file, result.structuredData);
        }, 1500);
      } else {
        setError(result.error || 'Processing failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Document processing error:', error);
      setError('Failed to process document. Please try again.');
      setIsProcessing(false);
      setScanLinePosition(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        createPreviewUrl(file);
        processDocument(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        createPreviewUrl(file);
        processDocument(file);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStructuredData(null);
    setIsProcessing(false);
    setProcessingStep('');
    setProcessingProgress(0);
    setScanLinePosition(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryProcessing = () => {
    if (selectedFile) {
      processDocument(selectedFile);
    }
  };

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isImage = selectedFile?.type.startsWith('image/');
  const isPdf = selectedFile?.type === 'application/pdf';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section - Takes 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5D5FEF]/10 rounded-xl mb-3">
              <FileText className="w-6 h-6 text-[#5D5FEF]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Upload National ID</h3>
            <p className="text-sm text-gray-600">Upload your physical National ID for automatic data extraction</p>
          </div>
          
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300
              ${dragOver ? 'border-[#5D5FEF] bg-[#5D5FEF]/5' : 'border-gray-300 hover:border-gray-400'}
              ${selectedFile ? 'border-[#5D5FEF] bg-[#5D5FEF]/5' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 bg-[#5D5FEF]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#5D5FEF]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={removeFile}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-[#5D5FEF]/10 rounded-xl flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-[#5D5FEF]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Drag and drop your National ID here
                  </p>
                  <p className="text-xs text-gray-500">or click to browse files</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-[#5D5FEF]/20 rounded-lg text-xs font-medium text-[#5D5FEF] bg-[#5D5FEF]/10 hover:bg-[#5D5FEF]/20 hover:border-[#5D5FEF]/30 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] transition-all duration-200"
                >
                  Browse Files
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Supported: JPEG, PNG, PDF • Max: 5MB
          </p>

          {/* Processing Animation */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-xl p-4 border border-[#5D5FEF]/20">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-[#5D5FEF] rounded-lg flex items-center justify-center">
                      <Scan className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#5D5FEF] text-sm">Scanning Document</h4>
                    <p className="text-xs text-[#5D5FEF]/70">{processingStep}</p>
                  </div>
                </div>

                {/* Scanning Visualization */}
                <div className="relative bg-gray-900 rounded-lg p-3 overflow-hidden">
                  {/* Document representation */}
                  <div className="relative bg-white rounded p-3 min-h-[80px] border border-gray-200">
                    {/* Simulated document content */}
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                      <div className="h-2 bg-gray-300 rounded w-1/3"></div>
                    </div>
                    
                    {/* Scanning line effect */}
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#5D5FEF] to-transparent opacity-80 transition-all duration-100 ease-linear"
                      style={{ 
                        top: `${scanLinePosition}%`,
                        boxShadow: '0 0 10px rgba(93, 95, 239, 0.8)'
                      }}
                    />
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#5D5FEF]/70">
                    <span>Progress</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <div className="w-full bg-[#5D5FEF]/20 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] h-1.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center space-x-1 text-xs transition-all duration-300 ${processingProgress >= 25 ? 'text-[#5D5FEF]' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${processingProgress >= 25 ? 'bg-[#5D5FEF]' : 'bg-gray-300'}`} />
                    <span>Analysis</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-xs transition-all duration-300 ${processingProgress >= 50 ? 'text-[#5D5FEF]' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${processingProgress >= 50 ? 'bg-[#5D5FEF]' : 'bg-gray-300'}`} />
                    <span>Extraction</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-xs transition-all duration-300 ${processingProgress >= 75 ? 'text-[#5D5FEF]' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${processingProgress >= 75 ? 'bg-[#5D5FEF]' : 'bg-gray-300'}`} />
                    <span>AI Processing</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-xs transition-all duration-300 ${processingProgress >= 100 ? 'text-[#5D5FEF]' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${processingProgress >= 100 ? 'bg-[#5D5FEF]' : 'bg-gray-300'}`} />
                    <span>Structuring</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {structuredData && !isProcessing && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 text-sm">Scanning Complete!</h4>
                  <p className="text-xs text-green-700">Data extracted successfully. Redirecting...</p>
                </div>
              </div>
              
              {/* Success animation */}
              <div className="flex justify-center">
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping"></div>
                  <div className="relative w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1 text-sm">Scanning Failed</h4>
                  <p className="text-xs text-red-700 mb-2">{error}</p>
                  <button
                    onClick={retryProcessing}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                  >
                    <Scan className="w-3 h-3 mr-1" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-xl p-4 border border-[#5D5FEF]/20">
            <h3 className="font-semibold text-[#5D5FEF] mb-2 flex items-center text-sm">
              <div className="w-1.5 h-1.5 bg-[#5D5FEF] rounded-full mr-2"></div>
              Smart Processing
            </h3>
            <ul className="text-xs text-[#5D5FEF]/80 space-y-1">
              <li className="flex items-start">
                <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                Automatically extracts all personal information
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                Pre-fills the registration form for you
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                Secure processing with bank-level encryption
              </li>
            </ul>
          </div>
        </div>

        {/* Preview Section - Takes 1/3 width */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-[#5D5FEF]/10 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#5D5FEF]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Preview</h3>
          </div>

          <div className="space-y-4">
            {/* Document Preview */}
            <div className="border border-dashed border-gray-200 rounded-lg p-4 min-h-[200px] flex items-center justify-center relative overflow-hidden">
              {!selectedFile ? (
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs font-medium">No document</p>
                  <p className="text-xs">Upload to preview</p>
                </div>
              ) : previewUrl ? (
                <div className="w-full relative">
                  {isImage ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Document preview"
                        className="max-w-full max-h-[200px] mx-auto rounded object-contain"
                      />
                      {isProcessing && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#5D5FEF]/10 via-transparent to-[#5D5FEF]/10 rounded flex items-center justify-center">
                          {/* Scanning overlay effect */}
                          <div className="absolute inset-0 overflow-hidden rounded">
                            <div 
                              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#5D5FEF] to-transparent opacity-80 transition-all duration-100 ease-linear"
                              style={{ 
                                top: `${scanLinePosition}%`,
                                boxShadow: '0 0 10px rgba(93, 95, 239, 0.8)'
                              }}
                            />
                          </div>
                          
                          {/* Scanning status */}
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2 shadow border border-[#5D5FEF]/20">
                            <Scan className="w-4 h-4 text-[#5D5FEF] animate-pulse" />
                            <div>
                              <span className="text-xs font-medium text-[#5D5FEF]">Scanning</span>
                              <div className="text-xs text-[#5D5FEF]/70">{processingProgress}%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isPdf ? (
                    <div className="w-full">
                      <iframe
                        src={previewUrl}
                        className="w-full h-[200px] rounded border border-gray-200"
                        title="PDF preview"
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        PDF preview
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-xs font-medium">Preview unavailable</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs font-medium">Preview error</p>
                </div>
              )}
            </div>

            {/* File Information */}
            {selectedFile && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">File Info</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Size:</span>
                    <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{selectedFile.type.split('/')[1].toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`font-medium flex items-center space-x-1 ${
                      isProcessing ? 'text-blue-600' : 
                      structuredData ? 'text-green-600' : 
                      error ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-2 h-2 animate-spin" />
                          <span>Scanning</span>
                        </>
                      ) : structuredData ? (
                        <>
                          <CheckCircle className="w-2 h-2" />
                          <span>Complete</span>
                        </>
                      ) : error ? (
                        <>
                          <AlertCircle className="w-2 h-2" />
                          <span>Failed</span>
                        </>
                      ) : (
                        <span>Pending</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}