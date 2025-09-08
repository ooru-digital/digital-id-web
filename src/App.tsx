import React, { useState } from 'react';
import { Shield, Lock, User, FileText, Camera, CheckCircle } from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import DocumentUpload from './components/DocumentUpload';
import PersonalDetailsForm from './components/PersonalDetailsForm';
import SelfieCapture from './components/SelfieCapture';
import SuccessScreen from './components/SuccessScreen';
import ProcessingScreen from './components/ProcessingScreen';
import FailedScreen from './components/FailedScreen';
import LoginPage from './components/LoginPage';
import { apiConfig, buildUserCreationUrl } from './config/apiConfig';

type Step = 'document' | 'personal' | 'selfie' | 'success' | 'failed';

interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
}

interface RegistrationData {
  personalDetails?: PersonalDetails;
  document?: File;
  selfie?: string;
  userId?: string;
  extractedData?: any;
}

interface UserCreationResponse {
  message: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('document');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [error, setError] = useState('');

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentStep('document');
    setRegistrationData({});
    setError('');
  };

  const handleDocumentUpload = (file: File, extractedData?: any) => {
    setRegistrationData(prev => ({ 
      ...prev, 
      document: file,
      extractedData: extractedData 
    }));
    setCurrentStep('personal');
  };

  const handlePersonalDetails = (details: PersonalDetails) => {
    setRegistrationData(prev => ({ ...prev, personalDetails: details }));
    setCurrentStep('selfie');
  };

  // Helper function to remove country code from phone number
  const removeCountryCode = (phoneNumber: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it starts with +, remove the + and country code
    if (cleaned.startsWith('+')) {
      const withoutPlus = cleaned.substring(1);
      
      // Common country codes and their lengths
      const countryCodes = [
        { code: '91', length: 2 },   // India
        { code: '1', length: 1 },    // US/Canada
        { code: '44', length: 2 },   // UK
        { code: '86', length: 2 },   // China
        { code: '81', length: 2 },   // Japan
        { code: '49', length: 2 },   // Germany
        { code: '33', length: 2 },   // France
        { code: '39', length: 2 },   // Italy
        { code: '7', length: 1 },    // Russia
        { code: '55', length: 2 },   // Brazil
      ];
      
      // Try to match known country codes
      for (const { code, length } of countryCodes) {
        if (withoutPlus.startsWith(code)) {
          const remainingNumber = withoutPlus.substring(length);
          // Return the number without country code if it looks like a valid phone number
          if (remainingNumber.length >= 10) {
            return remainingNumber;
          }
        }
      }
      
      // If no known country code matched, assume it's a 1-3 digit country code
      // and take the last 10 digits as the phone number
      if (withoutPlus.length > 10) {
        return withoutPlus.substring(withoutPlus.length - 10);
      }
      
      return withoutPlus;
    }
    
    // If it doesn't start with +, check if it has a country code prefix
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      // Indian number with country code (91XXXXXXXXXX)
      return cleaned.substring(2);
    }
    
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      // US/Canada number with country code (1XXXXXXXXXX)
      return cleaned.substring(1);
    }
    
    // For other cases, return as is (assuming it's already in national format)
    return cleaned;
  };

  const handleSelfieCapture = async (imageData: string) => {
    setRegistrationData(prev => ({ ...prev, selfie: imageData }));
    setError('');

    try {
      const personalDetails = registrationData.personalDetails!;
      
      // Remove country code from phone number before sending to API
      const phoneWithoutCountryCode = removeCountryCode(personalDetails.phone);
      
      console.log('Original phone:', personalDetails.phone);
      console.log('Phone without country code:', phoneWithoutCountryCode);
      
      const url = buildUserCreationUrl();

      // Prepare the user creation payload
      const payload = {
        first_name: personalDetails.firstName,
        last_name: personalDetails.lastName,
        email: personalDetails.email,
        phone_number: phoneWithoutCountryCode,
        gender: personalDetails.gender,
        date_of_birth: personalDetails.dateOfBirth,
        national_id_number: personalDetails.nationalId,
        photo: imageData
      };

      console.log('User creation payload:', JSON.stringify(payload, null, 2));

      // Call the User Creation API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 201) {
        const responseData: UserCreationResponse = await response.json();
        console.log('User creation response:', responseData);
        
        // 201 status means successful creation
        setCurrentStep('success');
      } else {
        // Handle error responses
        let errorMessage = `Registration failed. Please try again. (Error: ${response.status})`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If JSON parsing fails, use the default error message
          console.error('Failed to parse error response:', e);
        }
        
        console.error('User creation API error:', response.status, errorMessage);
        setError(errorMessage);
        setCurrentStep('failed');
      }
    } catch (error) {
      console.error('API call failed:', error);
      setError('Network error. Please check your connection and try again.');
      setCurrentStep('failed');
    }
  };

  const handleBackToDocument = () => {
    setCurrentStep('document');
    setError('');
  };

  const handleBackToPersonal = () => {
    setCurrentStep('personal');
    setError('');
  };

  const handleStartOver = () => {
    setCurrentStep('document');
    setRegistrationData({});
    setError('');
  };

  const handleRetry = () => {
    setCurrentStep('selfie');
    setError('');
  };

  const getStepNumber = (step: Step) => {
    switch (step) {
      case 'document': return 1;
      case 'personal': return 2;
      case 'selfie': return 3;
      case 'success': return 3;
      case 'failed': return 3;
      default: return 1;
    }
  };

  const getStepIcon = (step: Step) => {
    switch (step) {
      case 'document': return FileText;
      case 'personal': return User;
      case 'selfie': return Camera;
      case 'success': return CheckCircle;
      case 'failed': return Shield;
      default: return FileText;
    }
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 'document': return 'Upload National ID';
      case 'personal': return 'Verify Information';
      case 'selfie': return 'Identity Verification';
      case 'success': return 'Digital ID Created';
      case 'failed': return 'Registration Failed';
      default: return 'GovPass Digital ID Registration';
    }
  };

  const getStepDescription = (step: Step) => {
    switch (step) {
      case 'document': return 'Upload your physical National ID for automatic data extraction';
      case 'personal': return 'Review and edit the extracted information';
      case 'selfie': return 'Take a selfie to complete your identity verification';
      case 'success': return 'Your digital national ID has been successfully created';
      case 'failed': return 'We encountered an issue with your registration';
      default: return 'Get your secure GovPass ID in just 3 simple steps. Fast, secure, and officially recognized.';
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const StepIcon = getStepIcon(currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-[#5D5FEF] rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">GovPass ID Portal</h1>
                <p className="text-xs text-gray-500">Republic of Digital Nations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <User className="w-3 h-3" />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Compact Hero Section */}
      <div className="bg-gradient-to-br from-[#5D5FEF] via-[#7C3AED] to-[#5D5FEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            {/* Step Icon */}
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <StepIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {getStepTitle(currentStep)}
              </h1>
              <p className="text-sm text-white/90 max-w-2xl mx-auto">
                {getStepDescription(currentStep)}
              </p>
            </div>

            {/* Features */}
            {currentStep === 'document' && (
              <div className="flex flex-wrap justify-center gap-4 text-xs text-white">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Smart data extraction</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Auto-fill forms</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Ready in 5 minutes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentStep !== 'success' && currentStep !== 'failed' && (
          <div className="mb-6">
            <StepIndicator 
              currentStep={getStepNumber(currentStep)} 
              totalSteps={3} 
            />
          </div>
        )}

        {currentStep === 'document' && (
          <DocumentUpload 
            onNext={handleDocumentUpload}
          />
        )}

        {currentStep === 'personal' && (
          <PersonalDetailsForm 
            onNext={handlePersonalDetails}
            onBack={handleBackToDocument}
            extractedData={registrationData.extractedData}
          />
        )}

        {currentStep === 'selfie' && (
          <SelfieCapture 
            onNext={handleSelfieCapture}
            onBack={handleBackToPersonal}
            error={error}
          />
        )}

        {currentStep === 'success' && (
          <SuccessScreen 
            onStartOver={handleStartOver}
          />
        )}

        {currentStep === 'failed' && (
          <FailedScreen 
            error={error}
            onRetry={handleRetry}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Compact Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-xs text-gray-500">
              © 2025 GovPass ID Portal. All rights reserved.
            </div>
            <div className="flex space-x-4 text-xs">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;