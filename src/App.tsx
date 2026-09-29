import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import StepRail from './components/StepRail';
import { type IdCardData, mrzNameLine } from './components/ui/IdCardPreview';
import Button from './components/ui/Button';
import Callout from './components/ui/Callout';
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
import { buildDigitalIdCredentialData, buildMrzLines, MOCKED_DETAILS } from './utils/digitalIdCredential';

type Step = 'personal' | 'selfie' | 'photoVerification' | 'issuing' | 'success' | 'failed';

const WIZARD_STEPS: Step[] = ['personal', 'selfie', 'photoVerification'];
const STEP_LABELS = ['Details', 'Selfie', 'Review'];
const STEP_HINTS = ['Name, birth date, NRC', 'Live photo of your face', 'Check and issue'];

const ease = [0.22, 1, 0.36, 1] as const;

const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });

const toIdCardData = (details: PersonalDetails, selfie?: string): IdCardData => {
  const { line1, line2 } = buildMrzLines(details);
  return {
    givenName: details.givenName,
    surName: details.surName,
    documentNumber: details.nrcNumber,
    dateOfBirth: formatDate(details.dateOfBirth),
    nationality: MOCKED_DETAILS.nationality,
    sex: details.sex === 'Male' ? 'M' : details.sex === 'Female' ? 'F' : 'X',
    mrz: [line1, line2, mrzNameLine(details.surName, details.givenName)],
    photo: selfie
  };
};

// Step content slides in the direction of travel
const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -32 })
};

interface RegistrationData {
  personalDetails?: PersonalDetails;
  selfie?: string;
}

interface Draft {
  data: RegistrationData;
  step: Step;
  savedAt: number;
}

// ponytail: draft (details + selfie) sits unencrypted in this browser's localStorage until issue or
// start over; move to a server-side draft API if applicants use shared devices.
const draftKey = (email: string) => `ooru-draft:${email}`;

const readDraft = (email: string): Draft | null => {
  try {
    const raw = localStorage.getItem(draftKey(email));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeDraft = (email: string, draft: Draft) => {
  try {
    localStorage.setItem(draftKey(email), JSON.stringify(draft));
    return true;
  } catch {
    return false; // storage full or blocked: the wizard still works, it just can't resume
  }
};

const removeDraft = (email: string) => {
  try {
    localStorage.removeItem(draftKey(email));
  } catch {
    // nothing to clean up
  }
};

const formatSavedAt = (timestamp: number) =>
  new Date(timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

interface User {
  id: string;
  name: string;
  email: string;
}

const USER_STORAGE_KEY = 'digital-id-user';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const isAuthenticated = user !== null;
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [svgUrl, setSvgUrl] = useState<string>();
  const [credentialId, setCredentialId] = useState<string>();
  const [savedAt, setSavedAt] = useState<number>();
  const [resumedAt, setResumedAt] = useState<number>();
  // Set when the user leaves Review to change something; the edited step then returns straight to Review
  const [returnToReview, setReturnToReview] = useState(false);
  const issuanceStatus = useIssuanceStatusPolling(
    currentStep === 'issuing' ? transactionId : null,
    {
      onCompleted: (url, id) => {
        setSvgUrl(url);
        setCredentialId(id);
        if (user) removeDraft(user.email);
        setSavedAt(undefined);
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
    setSvgUrl(undefined);
    setCredentialId(undefined);
  };

  const restoreDraft = (email: string) => {
    const draft = readDraft(email);
    if (!draft || !WIZARD_STEPS.includes(draft.step)) return;
    setRegistrationData(draft.data);
    setCurrentStep(draft.step);
    setSavedAt(draft.savedAt);
    setResumedAt(draft.savedAt);
  };

  // A session kept from an earlier visit resumes its draft on reload
  useEffect(() => {
    if (user) restoreDraft(user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (userData: User) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch {
      // session just won't survive a reload
    }
    setUser(userData);
    restoreDraft(userData.email);
  };

  // Signing out keeps the saved draft so the application can be resumed
  const handleLogout = () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // nothing to clean up
    }
    setUser(null);
    setCurrentStep('personal');
    setRegistrationData({});
    setError('');
    setSavedAt(undefined);
    setResumedAt(undefined);
    setReturnToReview(false);
    resetIssuance();
  };

  const goTo = (step: Step) => {
    setError('');
    setResumedAt(undefined);
    if (step === 'photoVerification') setReturnToReview(false);
    setCurrentStep(step);
  };

  const handlePersonalDetails = (details: PersonalDetails) => {
    setRegistrationData(prev => ({ ...prev, personalDetails: details }));
    goTo(returnToReview ? 'photoVerification' : 'selfie');
  };

  const handleSelfieCapture = (imageData: string) => {
    setRegistrationData(prev => ({ ...prev, selfie: imageData }));
    goTo('photoVerification');
  };

  const handleEdit = (step: Step) => {
    setReturnToReview(true);
    goTo(step);
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

  const handleStartOver = () => {
    if (user) removeDraft(user.email);
    setCurrentStep('personal');
    setRegistrationData({});
    setError('');
    setSavedAt(undefined);
    setResumedAt(undefined);
    setReturnToReview(false);
    resetIssuance();
  };

  const handleRetry = () => {
    setCurrentStep('photoVerification');
    setError('');
    resetIssuance();
  };

  const handleSelectStep = (index: number) => {
    if (currentStep === 'photoVerification') setReturnToReview(true);
    goTo(WIZARD_STEPS[index]);
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 'personal': return 'Enter your details';
      case 'selfie': return 'Take a selfie';
      case 'photoVerification': return 'Review and issue';
      case 'issuing': return 'Issuing your Digital ID';
      case 'success': return 'Your Digital ID is ready';
      case 'failed': return 'Issuance did not complete';
      default: return 'Ooru Digital ID';
    }
  };

  const getStepDescription = (step: Step) => {
    switch (step) {
      case 'personal': return 'Enter your details exactly as they should appear on your Digital ID.';
      case 'selfie': return 'Take a live photo so we can confirm the application is yours.';
      case 'photoVerification': return 'Check everything before we issue your Digital ID. You can edit any section.';
      case 'issuing': return 'Your details have been submitted and your Digital ID is being generated.';
      case 'success': return 'Your Digital ID has been issued and is ready to add to your wallet.';
      case 'failed': return 'Something went wrong while issuing your Digital ID. You can try again.';
      default: return '';
    }
  };

  const stepIndex = WIZARD_STEPS.indexOf(currentStep);
  const isWizardStep = stepIndex !== -1;

  // Direction of travel through the wizard: 1 forward, -1 back
  const orderIndex = isWizardStep ? stepIndex : WIZARD_STEPS.length;
  const previousIndex = useRef(orderIndex);
  const direction = orderIndex >= previousIndex.current ? 1 : -1;
  useEffect(() => {
    previousIndex.current = orderIndex;
  }, [orderIndex]);

  // Scroll to the top of the new step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Auto-save completed steps so the application can be resumed after signing out
  useEffect(() => {
    if (!user || !isWizardStep || (!registrationData.personalDetails && !registrationData.selfie)) return;
    const now = Date.now();
    if (writeDraft(user.email, { data: registrationData, step: currentStep, savedAt: now })) setSavedAt(now);
  }, [user, isWizardStep, registrationData, currentStep]);

  const { personalDetails, selfie } = registrationData;
  const card = personalDetails ? toIdCardData(personalDetails, selfie) : undefined;
  const railCard: IdCardData = card ?? {
    givenName: '',
    surName: '',
    documentNumber: '',
    dateOfBirth: '',
    nationality: '',
    sex: '',
    mrz: ['', '', ''],
    photo: selfie
  };
  const hasData = [!!personalDetails, !!selfie, true];
  const railSteps = STEP_LABELS.map((label, index) => ({
    label,
    hint: STEP_HINTS[index],
    summary: [personalDetails && `${personalDetails.givenName} ${personalDetails.surName}`, selfie && 'Photo captured'][index],
    reachable: hasData.slice(0, index).every(Boolean)
  }));

  const renderStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalDetailsForm
            onNext={handlePersonalDetails}
            initialValues={personalDetails}
            submitLabel={returnToReview ? 'Save and return to review' : undefined}
          />
        );
      case 'selfie':
        return (
          <SelfieCapture
            onNext={handleSelfieCapture}
            onBack={() => goTo('personal')}
            error={error}
            initialImage={selfie}
            submitLabel={returnToReview ? 'Save and return to review' : undefined}
          />
        );
      case 'photoVerification':
        return (
          <PhotoVerification
            details={personalDetails!}
            selfie={selfie!}
            card={card!}
            onEdit={handleEdit}
            onContinue={handleIssueDigitalId}
            onBack={() => goTo('selfie')}
          />
        );
      case 'issuing':
        return <IssuanceProgress transactionId={transactionId} status={issuanceStatus} card={card!} />;
      case 'success':
        return <SuccessScreen onStartOver={handleStartOver} card={card} svgUrl={svgUrl} credentialId={credentialId} />;
      case 'failed':
        return <FailedScreen error={error} onRetry={handleRetry} onStartOver={handleStartOver} />;
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div key="login" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="flex min-h-screen flex-col bg-canvas"
          >
            <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
                <div className="flex items-center gap-3">
                  <img src="/brand/ooru-mark-colour.png" alt="" className="h-6 w-auto" />
                  <span className="text-body font-medium">Ooru Digital ID</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden text-small text-ink-muted sm:inline">{user?.name}</span>
                  <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                    {isWizardStep ? 'Save and exit' : 'Sign out'}
                  </Button>
                </div>
              </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
              <div className={isWizardStep ? 'grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)]' : ''}>
                {isWizardStep && (
                  <aside className="lg:sticky lg:top-24 lg:self-start">
                    <StepRail
                      steps={railSteps}
                      current={stepIndex}
                      onSelect={handleSelectStep}
                      card={railCard}
                      cardStage={personalDetails ? 4 : selfie ? 1 : 0}
                      savedAt={savedAt}
                    />
                  </aside>
                )}

                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.section
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease }}
                    className="min-w-0"
                    aria-labelledby="step-title"
                  >
                    {isWizardStep && resumedAt && (
                      <Callout title="Welcome back" className="mb-12">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <p>We restored the application you saved on {formatSavedAt(resumedAt)}.</p>
                          <Button type="button" variant="outline" size="sm" onClick={handleStartOver}>
                            Start over
                          </Button>
                        </div>
                      </Callout>
                    )}

                    <div className="mb-12 flex max-w-[62ch] flex-col gap-2">
                      <h1 id="step-title" className="text-display-32">{getStepTitle(currentStep)}</h1>
                      <p className="text-body text-ink-muted">{getStepDescription(currentStep)}</p>
                    </div>

                    {isWizardStep ? (
                      <div className="rounded-lg bg-card p-6 shadow-card sm:p-12">{renderStep()}</div>
                    ) : (
                      renderStep()
                    )}
                  </motion.section>
                </AnimatePresence>
              </div>
            </main>

            <footer className="border-t border-line">
              <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-caption text-ink-muted sm:flex-row">
                <p>© {new Date().getFullYear()} Ooru Digital Private Limited</p>
                <nav className="flex gap-6" aria-label="Legal">
                  <a href="#" className="hover:text-ink">Privacy</a>
                  <a href="#" className="hover:text-ink">Terms</a>
                  <a href="mailto:support@ooru.io" className="hover:text-ink">Support</a>
                </nav>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
