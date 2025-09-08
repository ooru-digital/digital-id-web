import React from 'react';
import { XCircle, RefreshCw, Home, AlertTriangle, HelpCircle } from 'lucide-react';

interface FailedScreenProps {
  error: string;
  onRetry: () => void;
  onStartOver: () => void;
}

export default function FailedScreen({ error, onRetry, onStartOver }: FailedScreenProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-white">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Registration Failed</h2>
          <p className="text-red-100">
            We encountered an issue while processing your GovPass ID registration.
          </p>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Error Details */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-red-900 mb-1 text-sm">Error Details</h3>
                <p className="text-xs text-red-800 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
          
          {/* Common Solutions */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-blue-900">Common Solutions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-blue-800">Ensure your National ID number is unique and correct</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-blue-800">Check that all personal information is accurate</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-blue-800">Verify your internet connection is stable</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-blue-800">Try using a different photo if the selfie was unclear</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] text-white font-semibold rounded-lg hover:from-[#5D5FEF]/90 hover:to-[#7C3AED]/90 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <button
              onClick={onStartOver}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Start Over
            </button>
          </div>
          
          {/* Support Notice */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600">
              If the problem persists, please contact our support team for assistance. 
              <br />
              <span className="font-medium">Support Email:</span> support@govpass.gov
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}