import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, FileImage, X, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

export interface UploadedDocument {
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

interface DocumentUploadProps {
  onNext: (document: UploadedDocument) => void;
  initialValue?: UploadedDocument;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function DocumentUpload({ onNext, initialValue }: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedDocument | null>(initialValue || null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ file?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, file: 'Please upload a JPG, PNG, WEBP or PDF file' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, file: `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}` }));
      return;
    }

    try {
      const dataUrl = await readAsDataUrl(file);
      setUploadedFile({ fileName: file.name, mimeType: file.type, size: file.size, dataUrl });
      setErrors(prev => ({ ...prev, file: undefined }));
    } catch (e) {
      console.error('Failed to read document:', e);
      setErrors(prev => ({ ...prev, file: 'Unable to read the file. Please try another one.' }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setErrors({ file: 'Please upload your document' });
      return;
    }
    onNext(uploadedFile);
  };

  const isImage = uploadedFile?.mimeType.startsWith('image/');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-[#5D5FEF]/10 rounded-lg mb-3">
              <FileText className="w-5 h-5 text-[#5D5FEF]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Your Identity Document</h2>
            <p className="text-sm text-gray-600">
              Upload a clear photo or scan of any physical identity document that shows your photo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Area */}
            <div className="space-y-1">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {uploadedFile ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-56 aspect-[1.6] rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                      {isImage ? (
                        <img src={uploadedFile.dataUrl} alt="Uploaded document" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center text-[#5D5FEF]">
                          <FileText className="w-10 h-10 mb-1" />
                          <span className="text-xs font-semibold">PDF Document</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
                        {isImage ? (
                          <FileImage className="w-4 h-4 text-[#5D5FEF] flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#5D5FEF] flex-shrink-0" />
                        )}
                        <p className="text-sm font-semibold text-gray-900 truncate">{uploadedFile.fileName}</p>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{formatFileSize(uploadedFile.size)}</p>
                      <div className="flex justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white hover:border-gray-400 transition-all duration-200 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={handleRemove}
                          className="inline-flex items-center px-3 py-1.5 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                    isDragging
                      ? 'border-[#5D5FEF] bg-[#5D5FEF]/10'
                      : errors.file
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-[#5D5FEF] hover:bg-[#5D5FEF]/5'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5D5FEF]/10 rounded-xl mb-3">
                    <UploadCloud className="w-6 h-6 text-[#5D5FEF]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    Drag & drop your document here, or <span className="text-[#5D5FEF]">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP or PDF · Max {formatFileSize(MAX_FILE_SIZE)}</p>
                </div>
              )}

              {errors.file && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.file}</span>
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-lg p-4 border border-[#5D5FEF]/20">
              <h3 className="font-semibold text-[#5D5FEF] mb-2 flex items-center text-sm">
                <div className="w-1.5 h-1.5 bg-[#5D5FEF] rounded-full mr-2"></div>
                Document Guidelines
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-[#5D5FEF]/80">
                {[
                  'All four corners of the document are visible',
                  'Your photo on the document is clear and not covered',
                  'Text is readable, with no glare or blur',
                  'The document is valid and not expired'
                ].map(item => (
                  <li key={item} className="flex items-start">
                    <div className="w-1 h-1 bg-[#5D5FEF] rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] text-white font-semibold rounded-lg hover:from-[#5D5FEF]/90 hover:to-[#7C3AED]/90 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                Continue to Personal Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
