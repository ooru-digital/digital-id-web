import React from 'react';
import { CheckCircle, Home, Smartphone, Download, QrCode, ExternalLink, Star, Award, Shield } from 'lucide-react';

interface SuccessScreenProps {
  onStartOver: () => void;
}

export default function SuccessScreen({ onStartOver }: SuccessScreenProps) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-white">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Digital ID Created Successfully!</h2>
          <p className="text-green-100">
            Your digital national ID has been successfully created and is ready for download.
          </p>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg mb-3 mx-auto">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-green-900 mb-1 text-sm">Identity Verified</h3>
              <p className="text-xs text-green-700">Your identity has been successfully verified</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mb-3 mx-auto">
                <Award className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-1 text-sm">Digital ID Created</h3>
              <p className="text-xs text-blue-700">Your digital national ID has been generated</p>
            </div>
            
            <div className="bg-[#5D5FEF]/10 rounded-lg p-4 border border-[#5D5FEF]/20">
              <div className="flex items-center justify-center w-8 h-8 bg-[#5D5FEF] rounded-lg mb-3 mx-auto">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-[#5D5FEF] mb-1 text-sm">Ready for Download</h3>
              <p className="text-xs text-[#5D5FEF]/70">Available in Inji Wallet</p>
            </div>
          </div>

          {/* Inji Wallet Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h3 className="font-bold text-blue-900 mb-3 text-lg">Download Your Digital National ID</h3>
            <p className="text-blue-800 mb-4 text-sm">
              Your digital national ID is now available for download using the Inji Wallet mobile application.
            </p>

            {/* Download Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Download Inji Wallet</h4>
                    <p className="text-xs text-blue-700">Install the Inji Wallet app from your device's app store</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Open the App</h4>
                    <p className="text-xs text-blue-700">Launch Inji Wallet and set up your secure wallet</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Add Digital ID</h4>
                    <p className="text-xs text-blue-700">Use the "Add Credential" feature to download your digital national ID</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Verify & Use</h4>
                    <p className="text-xs text-blue-700">Your digital ID is now ready for secure verification</p>
                  </div>
                </div>
              </div>
            </div>

            {/* App Store Links */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://apps.apple.com/app/inji-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download for iOS
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              
              <a
                href="https://play.google.com/store/apps/details?id=io.mosip.inji"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download for Android
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-lg p-6 border border-[#5D5FEF]/20">
            <h3 className="font-bold text-[#5D5FEF] mb-4 flex items-center justify-center">
              <Shield className="w-5 h-5 mr-2" />
              Why Use Inji Wallet?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-[#5D5FEF] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#5D5FEF] text-xs">Secure Storage</p>
                  <p className="text-xs text-[#5D5FEF]/70">Your credentials are stored securely on your device</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-[#5D5FEF] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#5D5FEF] text-xs">Offline Access</p>
                  <p className="text-xs text-[#5D5FEF]/70">Access your digital ID even without internet</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-[#5D5FEF] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#5D5FEF] text-xs">Easy Verification</p>
                  <p className="text-xs text-[#5D5FEF]/70">Quick QR code scanning for instant verification</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-[#5D5FEF] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#5D5FEF] text-xs">Privacy First</p>
                  <p className="text-xs text-[#5D5FEF]/70">You control what information to share</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onStartOver}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Register Another ID
            </button>
          </div>

          {/* Support Notice */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Need help downloading your digital ID? Contact our support team at{' '}
              <span className="font-medium">support@govpass.gov</span> or visit our help center.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}