import { useState } from 'react';
import { Shield, User, Camera, CheckCircle, Fingerprint, FileText, ScanFace } from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import DocumentUpload, { type UploadedDocument } from './components/DocumentUpload';
import PersonalDetailsForm, { type PersonalDetails } from './components/PersonalDetailsForm';
import SelfieCapture from './components/SelfieCapture';
import PhotoVerification from './components/PhotoVerification';
import IssuanceProgress from './components/IssuanceProgress';
import SuccessScreen from './components/SuccessScreen';
import FailedScreen from './components/FailedScreen';
import LoginPage from './components/LoginPage';
import { apiConfig } from './config/apiConfig';
import { issueDigitalId, CredIssuerError } from './services/credIssuer';
import { useIssuanceStatusPolling } from './hooks/useIssuanceStatusPolling';
import { buildDigitalIdCredentialData } from './utils/digitalIdCredential';

type Step = 'document' | 'personal' | 'selfie' | 'photoVerification' | 'issuing' | 'success' | 'failed';

const STEP_LABELS = ['Document', 'Details', 'Selfie', 'Verify'];

interface RegistrationData {
  document?: UploadedDocument;
  personalDetails?: PersonalDetails;
  selfie?: string;
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
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const issuanceStatus = useIssuanceStatusPolling(
    currentStep === 'issuing' ? transactionId : null,
    {
      onCompleted: () => {
        setCurrentStep('success');
      },
      onFailed: (message) => {
        setError(message);
        setCurrentStep('failed');
      }
    }
  );

  const resetIssuance = () => {
    setTransactionId(null);
  };

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
    resetIssuance();
  };

  const handleDocumentUpload = (document: UploadedDocument) => {
    setRegistrationData(prev => ({ ...prev, document }));
    setCurrentStep('personal');
  };

  const handlePersonalDetails = (details: PersonalDetails) => {
    setRegistrationData(prev => ({ ...prev, personalDetails: details }));
    setCurrentStep('selfie');
  };

  const handleSelfieCapture = (imageData: string) => {
    setRegistrationData(prev => ({ ...prev, selfie: imageData }));
    setError('');
    setCurrentStep('photoVerification');
  };

  const handleIssueDigitalId = async () => {
    setError('');
    resetIssuance();
    setCurrentStep('issuing');

    try {
      const personalDetails = registrationData.personalDetails!;
      const imageData = registrationData.selfie!;
      const { credentialTemplateId, issuerInfo } = apiConfig.credIssuer;

      // Call the CredIssuer Digital ID issuance API; status is then polled by transaction ID
      const response = await issueDigitalId({
        issuer_info: {
          org_code: issuerInfo.orgCode,
          email: issuerInfo.email
        },
        issuer_credential_template_id: credentialTemplateId,
        credential_data: [buildDigitalIdCredentialData(personalDetails, imageData)]
      });

      console.log('Digital ID issuance response:', response);
      setTransactionId(response.transaction_id);
    } catch (error) {
      console.error('Digital ID issuance API error:', error);
      setError(
        error instanceof CredIssuerError
          ? error.message
          : 'Network error. Please check your connection and try again.'
      );
      setCurrentStep('failed');
    }
  };

  const handleBackToDocument = () => {
    setCurrentStep('document');
  };

  const handleBackToPersonal = () => {
    setCurrentStep('personal');
    setError('');
  };

  const handleBackToSelfie = () => {
    setCurrentStep('selfie');
  };

  const handleStartOver = () => {
    setCurrentStep('document');
    setRegistrationData({});
    setError('');
    resetIssuance();
  };

  const handleRetry = () => {
    setCurrentStep('photoVerification');
    setError('');
    resetIssuance();
  };

  const getStepNumber = (step: Step) => {
    switch (step) {
      case 'document': return 1;
      case 'personal': return 2;
      case 'selfie': return 3;
      case 'photoVerification': return 4;
      default: return 4;
    }
  };

  const getStepIcon = (step: Step) => {
    switch (step) {
      case 'document': return FileText;
      case 'personal': return User;
      case 'selfie': return Camera;
      case 'photoVerification': return ScanFace;
      case 'issuing': return Fingerprint;
      case 'success': return CheckCircle;
      case 'failed': return Shield;
      default: return User;
    }
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 'document': return 'Upload Identity Document';
      case 'personal': return 'Enter Your Details';
      case 'selfie': return 'Identity Verification';
      case 'photoVerification': return 'Photo Verification';
      case 'issuing': return 'Issuing Your Digital ID';
      case 'success': return 'Digital ID Created';
      case 'failed': return 'Registration Failed';
      default: return 'GovPass Digital ID Registration';
    }
  };

  const getStepDescription = (step: Step) => {
    switch (step) {
      case 'document': return 'Start by uploading any physical identity document that shows your photo';
      case 'personal': return 'Provide your personal information to create your digital ID';
      case 'selfie': return 'Take a selfie to complete your identity verification';
      case 'photoVerification': return 'Review your live photo against your identity document before issuance';
      case 'issuing': return 'Your details have been submitted and your digital ID is being generated';
      case 'success': return 'Your digital national ID has been successfully created';
      case 'failed': return 'We encountered an issue with your registration';
      default: return 'Get your secure GovPass ID in just 4 simple steps. Fast, secure, and officially recognized.';
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
                  <span>Secure registration</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Officially recognized</span>
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
        {(currentStep === 'document' ||
          currentStep === 'personal' ||
          currentStep === 'selfie' ||
          currentStep === 'photoVerification') && (
          <div className="mb-6">
            <StepIndicator 
              currentStep={getStepNumber(currentStep)} 
              totalSteps={STEP_LABELS.length}
              labels={STEP_LABELS}
            />
          </div>
        )}

        {currentStep === 'document' && (
          <DocumentUpload
            onNext={handleDocumentUpload}
            initialValue={registrationData.document}
          />
        )}

        {currentStep === 'personal' && (
          <PersonalDetailsForm 
            onNext={handlePersonalDetails}
            onBack={handleBackToDocument}
            initialValues={registrationData.personalDetails}
          />
        )}

        {currentStep === 'selfie' && (
          <SelfieCapture 
            onNext={handleSelfieCapture}
            onBack={handleBackToPersonal}
            error={error}
            initialImage={registrationData.selfie}
          />
        )}

        {currentStep === 'photoVerification' && (
          <PhotoVerification
            document={registrationData.document}
            selfie={registrationData.selfie}
            onContinue={handleIssueDigitalId}
            onBack={handleBackToSelfie}
          />
        )}

        {currentStep === 'issuing' && (
          <IssuanceProgress
            transactionId={transactionId}
            status={issuanceStatus}
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
