import React, { useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'framer-motion';
import { Check, Lock, ScanFace, ScanLine } from 'lucide-react';
import IdCardPreview, { type IdCardData } from './ui/IdCardPreview';
import IssuedCard from './ui/IssuedCard';

export interface PanelStep {
  label: string;
  summary?: string;
  reachable: boolean;
}

interface BrandPanelProps {
  steps: PanelStep[];
  // Index into steps, or -1 once the wizard is done (issuing, success, failed)
  current: number;
  onSelect: (index: number) => void;
  card: IdCardData;
  // Hidden on steps whose main content already shows the card
  showCard: boolean;
  // Set once issued: the signed credential replaces the preview
  issuedSvgUrl?: string;
  savedAt?: number;
}

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

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });

export default function BrandPanel({ steps, current, onSelect, card, showCard, issuedSvgUrl, savedAt }: BrandPanelProps) {
  const [cardStage, setCardStage] = useState(0);
  const reduceMotion = useReducedMotion();

  // Pointer position across the panel, normalised to -0.5..0.5
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

  // One orchestrated moment on load: the card assembles itself
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

  const detailsDone = !!steps[0].summary;
  const faceDone = !!steps[1].summary;
  const issued = current === -1 && showCard;
  const preview = <IdCardPreview data={card} stage={cardStage} badge={{ label: issued ? 'Issued' : 'Preview', tone: issued ? 'pass' : 'neutral' }} />;

  // ponytail: sticky h-screen + overflow-hidden clips content on viewports shorter than ~700px;
  // drop the sticky and use min-h-screen if that bites.
  return (
    <aside
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="on-strong relative flex flex-col overflow-hidden bg-navy px-6 pb-8 pt-6 text-ink-on-strong sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:px-12 lg:py-10 xl:px-16"
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

      <div className="relative mt-8 flex flex-1 flex-col justify-center gap-8 lg:mt-0 lg:gap-10">
        <div className="flex max-w-[30rem] flex-col gap-3">
          <h1 className="text-display-32 sm:text-display-40 xl:text-display-56" aria-label={HEADLINE}>
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
            Enter your details and take a selfie. Your verifiable credential goes straight to your wallet.
          </motion.p>
        </div>

        <AnimatePresence initial={false}>
          {showCard && (
            <motion.figure
              key="card"
              className="relative w-full max-w-[20rem] self-center sm:max-w-[26rem] lg:self-start"
              style={{ perspective: 1000 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.5, ease }}
            >
              {/* The issued card flips on tap, so it owns its own 3D and skips the pointer tilt */}
              {issuedSvgUrl ? (
                <IssuedCard svgUrl={issuedSvgUrl} fallback={preview} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 40, rotate: -6 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  transition={{ duration: 0.9, ease, delay: 0.2 }}
                >
                  <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
                    {preview}
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-lg mix-blend-overlay"
                      style={{ background: sheen }}
                      aria-hidden
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Chips are earned: each appears once its step is actually complete */}
              <AnimatePresence>
                {cardStage >= 4 && detailsDone && !issuedSvgUrl && (
                  <VerifyChip key="details" icon={ScanLine} label="Details captured" className="-right-2 -top-4 sm:-right-8" delay={0.2} />
                )}
                {cardStage >= 4 && faceDone && !issuedSvgUrl && (
                  <VerifyChip key="face" icon={ScanFace} label="Face captured" className="-bottom-7 right-6" delay={0.45} />
                )}
              </AnimatePresence>

              {!issuedSvgUrl && (
                <figcaption className="mt-5 text-small text-ink-muted-on-strong">
                  {issued ? 'Issued and signed.' : current === 0 ? 'Fills in as you type.' : 'Your Digital ID so far.'}
                </figcaption>
              )}
            </motion.figure>
          )}
        </AnimatePresence>

        <nav aria-label="Application steps">
          <ol className="flex flex-wrap gap-2 text-small">
            {steps.map((step, index) => {
              const active = index === current;
              const done = !active && !!step.summary;
              const clickable = step.reachable && !active;
              const className = `flex items-center gap-2 rounded-pill border py-1 pl-1 pr-3 transition-colors duration-500 ${
                active
                  ? 'border-cyan bg-cyan/15 text-ink-on-strong'
                  : done
                    ? 'border-cyan/60 bg-cyan/10 text-ink-on-strong'
                    : 'border-ink-muted-on-strong/30 text-ink-muted-on-strong'
              } ${clickable ? 'hover:bg-white/10' : ''}`;
              const content = (
                <>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-pill text-caption transition-colors duration-500 ${
                      done ? 'bg-cyan text-navy' : active ? 'border border-cyan text-ink-on-strong' : 'border border-ink-muted-on-strong/50'
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                  </span>
                  {step.label}
                </>
              );
              return (
                <li key={step.label} aria-current={active ? 'step' : undefined}>
                  {clickable ? (
                    <button type="button" onClick={() => onSelect(index)} className={className} aria-label={`${step.label}${done ? ', completed. Edit' : ''}`}>
                      {content}
                    </button>
                  ) : (
                    <span className={className}>{content}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="relative mt-8 hidden flex-col gap-3 text-caption text-ink-muted-on-strong lg:flex">
        <p className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 flex-none text-cyan" aria-hidden />
          Your information is encrypted and used only for identity verification and credential issuance.
        </p>
        {savedAt && <p>Draft saved on this device at {formatTime(savedAt)}.</p>}
      </div>
    </aside>
  );
}
