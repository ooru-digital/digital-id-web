import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from './ui/Button';
import Field, { inputClass } from './ui/Field';
import Callout from './ui/Callout';
import IdCardPreview, { mrzNameLine, type IdCardData } from './ui/IdCardPreview';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type FormField = 'email' | 'password' | 'confirmPassword' | 'firstName' | 'lastName';
type FormErrors = Partial<Record<FormField, string>>;

const EMPTY_FORM: Record<FormField, string> = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: ''
};

const SPECIMEN: IdCardData = {
  givenName: 'Amara',
  surName: 'Banda',
  documentNumber: '204816/10/1',
  dateOfBirth: '14 Mar 1994',
  nationality: 'Zambian',
  sex: 'F',
  mrz: ['IDZMB204816101<<<<<<<<<<<<<<<<', '9403148F<<<<<<<ZMB<<<<<<<<<<<6', mrzNameLine('Banda', 'Amara')]
};

const FLOW = ['Document', 'Details', 'Selfie', 'Verify'];

const ease = [0.22, 1, 0.36, 1] as const;

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cardStage, setCardStage] = useState(0);

  // One orchestrated moment on load: the specimen credential assembles itself
  useEffect(() => {
    const timers = [1, 2, 3, 4].map(stage => setTimeout(() => setCardStage(stage), 350 + stage * 450));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleInputChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (authError) setAuthError('');
  };

  const validateForm = () => {
    const next: FormErrors = {};
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = 'Please enter a valid email address';

    if (!formData.password.trim()) next.password = 'Password is required';
    else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters long';

    if (!isLogin) {
      if (!formData.firstName.trim()) next.firstName = 'First name is required';
      if (!formData.lastName.trim()) next.lastName = 'Last name is required';
      if (formData.password !== formData.confirmPassword) next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication - in real app, this would be an API call
      if (isLogin) {
        if (formData.email === 'demo@example.com' && formData.password === 'password') {
          onLogin({ id: '1', name: 'John Doe', email: formData.email });
        } else {
          setAuthError('Invalid email or password. Try demo@example.com / password');
        }
      } else {
        onLogin({
          id: Date.now().toString(),
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        });
      }
    } catch {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const fillDemo = () => {
    setFormData({ ...EMPTY_FORM, email: 'demo@example.com', password: 'password' });
    setErrors({});
    setAuthError('');
  };

  const describedBy = (field: FormField) => (errors[field] ? `${field}-error` : undefined);

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Brand panel */}
      <aside className="on-strong relative flex flex-col overflow-hidden bg-navy px-6 py-8 text-ink-on-strong sm:px-12 lg:min-h-screen lg:py-12">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-ink-on-strong/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-ink-on-strong/10"
          aria-hidden
        />

        <img src="/brand/ooru-logo-white.png" alt="Ooru Digital" className="relative h-7 w-auto self-start sm:h-8" />

        <div className="relative mt-8 flex flex-1 flex-col justify-center gap-12 lg:mt-0">
          <div className="flex max-w-[30rem] flex-col gap-4">
            <h1 className="text-display-40 lg:text-display-56">Your Digital Identity, Issued Securely</h1>
            <p className="text-lead-18 text-ink-muted-on-strong">
              Upload a document, confirm your details and take a selfie. Your verifiable credential goes
              straight to your wallet.
            </p>
          </div>

          <motion.div
            className="hidden w-full max-w-[26rem] lg:block"
            initial={{ opacity: 0, y: 24, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
          >
            <IdCardPreview
              data={SPECIMEN}
              stage={cardStage}
              badge={{ label: 'Specimen', tone: 'neutral' }}
            />
          </motion.div>

          <ol className="hidden flex-wrap gap-x-6 gap-y-2 text-small text-ink-muted-on-strong lg:flex" aria-label="How it works">
            {FLOW.map((label, index) => (
              <li key={label} className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-pill border border-ink-muted-on-strong/50 text-caption">
                  {index + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </div>

        <p className="relative mt-8 hidden text-caption text-ink-muted-on-strong lg:block">
          Credentials issued with CredIssuer by Ooru Digital
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease }}
              className="mb-12 flex flex-col gap-2"
            >
              <h2 className="text-display-40">{isLogin ? 'Sign In' : 'Create Account'}</h2>
              <p className="text-body text-ink-muted">
                {isLogin ? 'Continue to your Ooru Digital ID application.' : 'Register to apply for your Ooru Digital ID.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.form layout onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  key="names"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease }}
                  className="-m-1 overflow-hidden p-1"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Field id="firstName" label="First name" error={errors.firstName}>
                      <input
                        id="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={e => handleInputChange('firstName', e.target.value)}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={describedBy('firstName')}
                        className={inputClass(!!errors.firstName)}
                      />
                    </Field>
                    <Field id="lastName" label="Last name" error={errors.lastName}>
                      <input
                        id="lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={e => handleInputChange('lastName', e.target.value)}
                        aria-invalid={!!errors.lastName}
                        aria-describedby={describedBy('lastName')}
                        className={inputClass(!!errors.lastName)}
                      />
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout="position">
              <Field id="email" label="Email address" error={errors.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={describedBy('email')}
                    className={`${inputClass(!!errors.email)} pl-10`}
                  />
                </div>
              </Field>
            </motion.div>

            <motion.div layout="position">
              <PasswordField
                id="password"
                label="Password"
                value={formData.password}
                error={errors.password}
                visible={showPassword}
                onToggle={() => setShowPassword(v => !v)}
                onChange={v => handleInputChange('password', v)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </motion.div>

            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease }}
                  className="-m-1 overflow-hidden p-1"
                >
                  <PasswordField
                    id="confirmPassword"
                    label="Confirm password"
                    value={formData.confirmPassword}
                    error={errors.confirmPassword}
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(v => !v)}
                    onChange={v => handleInputChange('confirmPassword', v)}
                    autoComplete="new-password"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <motion.div layout="position" className="flex items-center justify-between text-small">
                <label htmlFor="remember-me" className="flex items-center gap-2 text-ink">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 rounded-[4px] border-line-strong accent-navy" />
                  Remember me
                </label>
                <a href="#" className="font-medium text-azure-ink hover:underline">
                  Forgot password?
                </a>
              </motion.div>
            )}

            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                >
                  <Callout tone="fail" title="Could not sign in">{authError}</Callout>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout="position">
              <Button type="submit" loading={isLoading} className="w-full">
                {isLoading ? (isLogin ? 'Signing in' : 'Creating account') : isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div layout="position" className="mt-6 flex flex-col gap-6">
            {isLogin && (
              <div className="flex items-center justify-between gap-4 rounded-lg bg-sand px-6 py-4">
                <div className="flex flex-col gap-1">
                  <p className="text-small font-medium">Demo credentials</p>
                  <p className="font-mono text-[12px] leading-4 text-ink-muted">demo@example.com / password</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={fillDemo}>
                  Fill in
                </Button>
              </div>
            )}

            <p className="text-center text-caption text-ink-muted">
              © {new Date().getFullYear()} Ooru Digital Private Limited
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface PasswordFieldProps {
  id: FormField;
  label: string;
  value: string;
  error?: string;
  visible: boolean;
  autoComplete: string;
  onToggle: () => void;
  onChange: (value: string) => void;
}

function PasswordField({ id, label, value, error, visible, autoComplete, onToggle, onChange }: PasswordFieldProps) {
  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          type={visible ? 'text' : 'password'}
          id={id}
          autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass(!!error)} pl-10 pr-12`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill text-ink-muted hover:text-ink"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}
