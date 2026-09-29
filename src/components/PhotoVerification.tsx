import { ScanFace, FileText, ArrowLeftRight, ArrowLeft, Check, Sparkles, Info } from 'lucide-react';
import type { UploadedDocument } from './DocumentUpload';

interface PhotoVerificationProps {
  document?: UploadedDocument;
  selfie?: string;
  onContinue: () => void;
  onBack: () => void;
}

export default function PhotoVerification({ document, selfie, onContinue, onBack }: PhotoVerificationProps) {
  const isImageDocument = document?.mimeType.startsWith('image/');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5D5FEF]/10 rounded-xl mb-3">
            <ScanFace className="w-6 h-6 text-[#5D5FEF]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Photo Verification</h3>
          <p className="text-sm text-gray-600">
            Your live photo will be cross-checked against the photo on your physical identity document
          </p>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 mb-6">
          <figure className="space-y-2">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              {document && isImageDocument ? (
                <img src={document.dataUrl} alt="Identity document" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-[#5D5FEF] px-2 text-center">
                  <FileText className="w-10 h-10 mb-1" />
                  <span className="text-xs font-semibold truncate max-w-full">{document?.fileName || 'Document'}</span>
                </div>
              )}
            </div>
            <figcaption className="text-center">
              <p className="text-xs font-semibold text-gray-900">Physical Document</p>
              <p className="text-[11px] text-gray-500">Uploaded by you</p>
            </figcaption>
          </figure>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#5D5FEF]/10 border border-[#5D5FEF]/20 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-[#5D5FEF]" />
            </div>
          </div>

          <figure className="space-y-2">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              {selfie ? (
                <img src={selfie} alt="Live selfie" className="w-full h-full object-cover" />
              ) : (
                <ScanFace className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <figcaption className="text-center">
              <p className="text-xs font-semibold text-gray-900">Live Photo</p>
              <p className="text-[11px] text-gray-500">Captured just now</p>
            </figcaption>
          </figure>
        </div>

        {/* Coming soon notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-amber-900 mb-1 flex items-center flex-wrap gap-2">
                Automatic face matching
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                In a future update, your live photo will be automatically compared with the photo on your physical
                identity document to confirm that it's really you. This check is not enabled yet, so your application
                will continue without it.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-lg p-4 border border-[#5D5FEF]/20 mb-6">
          <div className="flex items-start space-x-3 text-left">
            <Info className="w-4 h-4 text-[#5D5FEF] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#5D5FEF]/80">
              Please make sure both photos clearly show the same person. If your selfie is unclear, go back and retake it
              before continuing.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retake Selfie
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] text-white font-semibold rounded-lg hover:from-[#5D5FEF]/90 hover:to-[#7C3AED]/90 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Continue & Issue Digital ID
          </button>
        </div>
      </div>
    </div>
  );
}
