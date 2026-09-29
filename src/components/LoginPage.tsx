import React, { useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ScanFace, ScanLine, Check } from 'lucide-react';
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

// ICAO specimen convention: fictional state "Utopia" (UTO). Portrait is AI-generated (StyleGAN), not a real person.
const SPECIMEN: IdCardData = {
  givenName: 'Elena',
  surName: 'Novak',
  documentNumber: '204816/10/1',
  dateOfBirth: '14 Mar 1994',
  nationality: 'Utopian',
  sex: 'F',
  mrz: ['IDUTO204816101<<<<<<<<<<<<<<<<', '9403148F<<<<<<<UTO<<<<<<<<<<<6', mrzNameLine('Novak', 'Elena')],
  photo: '/brand/specimen-portrait.jpg'
};

const FLOW = ['Document', 'Details', 'Selfie', 'Verify'];
const HEADLINE = 'Your Digital Identity, Issued Securely';

const ease = [0.22, 1, 0.36, 1] as const;

// Hypotrochoid rosette, the line pattern printed on passports and banknotes
const rosette = (R: number, r: number, d: number) => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const end = (2 * Math.PI * r) / gcd(R, r);
  const steps = 1400;
  let path = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * end;
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    path += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path;
};

const ROSETTES = [rosette(180, 48, 60), rosette(150, 42, 88), rosette(120, 33, 40)];

function Guilloche({ className, duration }: { className: string; duration: number }) {
  return (
    <motion.svg
      viewBox="-200 -200 400 400"
      className={`pointer-events-none absolute ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration, ease: 'linear', repeat: Infinity }}
      aria-hidden
    >
      {ROSETTES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={0.5} opacity={0.5 - i * 0.12} />
      ))}
    </motion.svg>
  );
}

const formStagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } };
const formItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } }
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cardStage, setCardStage] = useState(0);
  const reduceMotion = useReducedMotion();
  const shake = useAnimationControls();

  // Pointer position across the brand panel, normalised to -0.5..0.5
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const glowX = useMotionValue(70);
  const glowY = useMotionValue(20);
  const spring = { stiffness: 120, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), spring);
  const sheenX = useSpring(useTransform(px, [-0.5, 0.5], [0, 100]), spring);
  const sheen = useMotionTemplate`linear-gradient(115deg, transparent 20%, rgba(46,217,232,0.28) ${sheenX}%, rgba(255,255,255,0.35) calc(${sheenX}% + 4%), transparent 80%)`;
  const glow = useMotionTemplate`radial-gradient(560px circle at ${glowX}% ${glowY}%, rgba(46,217,232,0.16), transparent 70%)`;

  // One orchestrated moment on load: the specimen credential assembles itself
  useEffect(() => {
    const timers = [1, 2, 3, 4].map(stage => setTimeout(() => setCardStage(stage), 350 + stage * 450));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    px.set(x - 0.5);
    py.set(y - 0.5);
    glowX.set(x * 100);
    glowY.set(y * 100);
  };

  const handlePointerLeave = () => {
    px.set(0);
    py.set(0);
  };

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

  const shakeCard = () => shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });

  const succeed = async (user: User) => {
    setIsVerified(true);
    await new Promise(resolve => setTimeout(resolve, 650));
    onLogin(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      shakeCard();
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication - in real app, this would be an API call
      if (isLogin) {
        if (formData.email === 'demo@example.com' && formData.password === 'password') {
          await succeed({ id: '1', name: 'John Doe', email: formData.email });
        } else {
          setAuthError('Invalid email or password. Try demo@example.com / password');
          shakeCard();
        }
      } else {
        await succeed({
          id: Date.now().toString(),
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        });
      }
    } catch {
      setAuthError('An error occurred. Please try again.');
      shakeCard();
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
      <aside
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="on-strong relative flex flex-col overflow-hidden bg-navy px-6 pb-10 pt-8 text-ink-on-strong sm:px-12 lg:min-h-screen lg:py-12"
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} aria-hidden />
        <Guilloche className="-right-56 -top-56 h-[640px] w-[640px] text-cyan/40" duration={140} />
        <Guilloche className="-bottom-72 -left-64 h-[560px] w-[560px] text-ink-muted-on-strong/30" duration={180} />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fcfcfa 0 1px, transparent 1px 4px)' }}
          aria-hidden
        />

        <motion.img
          src="/brand/ooru-logo-white.png"
          alt="Ooru Digital"
          className="relative h-7 w-auto self-start sm:h-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        />

        <div className="relative mt-8 flex flex-1 flex-col justify-center gap-10 lg:mt-0 lg:gap-12">
          <div className="flex max-w-[30rem] flex-col gap-4">
            <h1 className="text-display-32 sm:text-display-40 lg:text-display-56" aria-label={HEADLINE}>
              {HEADLINE.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom" aria-hidden>
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.06 }}
                  >
                    {word}&nbsp;
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="text-body text-ink-muted-on-strong sm:text-lead-18"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.45 }}
            >
              Upload a document, confirm your details and take a selfie. Your verifiable credential goes
              straight to your wallet.
            </motion.p>
            <motion.p
              className="flex items-center gap-2 text-small text-ink-muted-on-strong"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <ShieldCheck className="h-4 w-4 flex-none text-cyan" aria-hidden />
              Digital IDs are issued by the Issuing Authority.
            </motion.p>
          </div>

          <div className="relative w-full max-w-[20rem] self-center sm:max-w-[26rem] lg:self-start" style={{ perspective: 1000 }}>
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.9, ease, delay: 0.2 }}
            >
              <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
                <IdCardPreview data={SPECIMEN} stage={cardStage} badge={{ label: 'Specimen', tone: 'neutral' }} />
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-lg mix-blend-overlay"
                  style={{ background: sheen }}
                  aria-hidden
                />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {cardStage >= 4 && (
                <>
                  <VerifyChip icon={ScanFace} label="Face match 98%" className="-right-2 -top-4 sm:-right-8" delay={0.2} />
                  <VerifyChip icon={ScanLine} label="MRZ valid" className="-bottom-7 right-6" delay={0.45} />
                </>
              )}
            </AnimatePresence>
          </div>

          <ol className="hidden flex-wrap gap-2 text-small lg:flex" aria-label="How it works">
            {FLOW.map((label, index) => {
              const lit = cardStage > index;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-2 rounded-pill border py-1 pl-1 pr-3 transition-colors duration-500 ${
                    lit ? 'border-cyan/60 bg-cyan/10 text-ink-on-strong' : 'border-ink-muted-on-strong/30 text-ink-muted-on-strong'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-pill text-caption transition-colors duration-500 ${
                      lit ? 'bg-cyan text-navy' : 'border border-ink-muted-on-strong/50'
                    }`}
                  >
                    {lit ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>
        </div>

        <p className="relative mt-8 hidden text-caption text-ink-muted-on-strong lg:block">
          Issued by the Issuing Authority · Powered by CredIssuer from Ooru Digital
        </p>
      </aside>

      {/* Form panel */}
      <main
        className="relative flex items-center justify-center px-4 py-10 sm:px-12 sm:py-12"
        style={{ backgroundImage: 'radial-gradient(rgba(10,57,112,0.09) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      >
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          <motion.div animate={shake} className="rounded-lg border border-line/60 bg-card p-6 shadow-raised sm:p-10">
            <motion.div variants={formStagger} initial="hidden" animate="show">
              <motion.div variants={formItem} className="mb-8 flex flex-col gap-3">
                <span className="flex items-center gap-2 self-start rounded-pill bg-sand px-3 py-1 text-caption font-medium text-azure-ink">
                  <Lock className="h-3 w-3" aria-hidden />
                  Secure sign-in
                </span>
                <h2 className="text-display-32 sm:text-display-40">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                <p className="text-body text-ink-muted">
                  {isLogin ? 'Continue to your Ooru Digital ID application.' : 'Register to apply for your Ooru Digital ID.'}
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {!isLogin && (
                  <motion.div variants={formItem} className="grid grid-cols-2 gap-4">
                    <Field id="firstName" label="First name" error={errors.firstName}>
                      <input
                        id="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={e => handleInputChange('firstName', e.target.value)}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={describedBy('firstName')}
                        className={`${inputClass(!!errors.firstName)} ${focusRing}`}
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
                        className={`${inputClass(!!errors.lastName)} ${focusRing}`}
                      />
                    </Field>
                  </motion.div>
                )}

                <motion.div variants={formItem}>
                  <Field id="email" label="Email address" error={errors.email}>
                    <div className="group relative">
                      <Mail className={iconClass} aria-hidden />
                      <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={describedBy('email')}
                        className={`${inputClass(!!errors.email)} ${focusRing} pl-10`}
                      />
                    </div>
                  </Field>
                </motion.div>

                <motion.div variants={formItem}>
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

                {!isLogin && (
                  <motion.div variants={formItem}>
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

                {isLogin && (
                  <motion.div variants={formItem} className="flex items-center justify-between text-small">
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
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease }}
                      role="alert"
                    >
                      <Callout tone="fail" title="Could not sign in">{authError}</Callout>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={formItem}>
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isVerified}
                    className={`group relative w-full overflow-hidden ${isVerified ? '!bg-pass !opacity-100' : ''}`}
                  >
                    <span
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%] motion-reduce:hidden"
                      aria-hidden
                    />
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isVerified ? 'ok' : isLoading ? 'busy' : 'idle'}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                      >
                        {isVerified && <Check className="h-4 w-4" aria-hidden />}
                        {isVerified
                          ? 'Verified'
                          : isLoading
                            ? isLogin ? 'Signing in' : 'Creating account'
                            : isLogin ? 'Sign in' : 'Create account'}
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>

              {isLogin && (
                <motion.div
                  variants={formItem}
                  className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-dashed border-line-strong/60 bg-sand/60 px-5 py-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-small font-medium">Demo credentials</p>
                    <p className="font-mono text-[12px] leading-4 text-ink-muted">demo@example.com / password</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={fillDemo}>
                    Fill in
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <p className="mt-6 text-center text-caption text-ink-muted">
            © {new Date().getFullYear()} Ooru Digital Private Limited
          </p>
        </motion.div>
      </main>
    </div>
  );
}

const focusRing = 'focus:ring-4 focus:ring-cyan/25';
const iconClass =
  'pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted transition-colors duration-200 group-focus-within:text-azure-ink';

interface VerifyChipProps {
  icon: typeof ScanFace;
  label: string;
  className: string;
  delay: number;
}

function VerifyChip({ icon: Icon, label, className, delay }: VerifyChipProps) {
  return (
    <motion.div
      className={`absolute z-10 ${className}`}
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
    >
      <motion.div
        className="flex items-center gap-2 rounded-pill border border-white/20 bg-navy/70 px-3 py-1.5 text-caption font-medium text-ink-on-strong shadow-raised backdrop-blur-md"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 }}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-cyan text-navy">
          <Icon className="h-3 w-3" aria-hidden />
        </span>
        {label}
        <Check className="h-3.5 w-3.5 text-cyan" aria-hidden />
      </motion.div>
    </motion.div>
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
      <div className="group relative">
        <Lock className={iconClass} aria-hidden />
        <input
          type={visible ? 'text' : 'password'}
          id={id}
          autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass(!!error)} ${focusRing} pl-10 pr-12`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill text-ink-muted hover:text-ink"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={visible ? 'hide' : 'show'}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </Field>
  );
}
