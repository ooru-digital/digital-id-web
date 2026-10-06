import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, CheckCheck } from 'lucide-react';
import IdCardPreview, { type IdCardData } from './ui/IdCardPreview';

interface IssuanceProgressProps {
  transactionId: string | null;
  status: string | null;
  card: IdCardData;
}

type StageState = 'done' | 'active' | 'pending';

const TIPS = [
  'Your Digital ID is cryptographically signed, so it cannot be forged or tampered with.',
  'Once issued, your Digital ID will be sent to your registered email address.',
  'You can store your Digital ID in your wallet and share it securely whenever needed.',
  'Your Digital ID includes a QR code so it can be verified instantly.'
];

// ponytail: backend exposes no per-check status (one POST + status poll), so the earlier checks tick on a timer.
// The last check never completes here; a real Completed status unmounts this for the success screen.
// Drive `ticked` from real status fields once the issuer reports them.
const CHECKS = [
  { active: 'Checking NID database (Mocked)', done: 'NID database check successful (Mocked)', description: 'Confirming your record in the National ID database.' },
  { active: 'Matching your face (Mocked)', done: 'Face match successful (Mocked)', description: 'Comparing your selfie with your document photo.' },
  { active: 'Signing and issuing your Digital ID', done: 'Digital ID issued', description: 'Creating your verifiable credential with CredIssuer.' }
];
const CHECK_INTERVAL_MS = 900;

const ease = [0.22, 1, 0.36, 1] as const;

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function IssuanceProgress({ transactionId, status, card }: IssuanceProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [introStage, setIntroStage] = useState(0);
  const [ticked, setTicked] = useState(0);

  useEffect(() => {
    const elapsedTimer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    const checkTimer = setInterval(() => setTicked(t => Math.min(t + 1, CHECKS.length - 1)), CHECK_INTERVAL_MS);
    const tipTimer = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 5000);
    // Photo, then fields, while the submission is in flight
    const introTimers = [setTimeout(() => setIntroStage(1), 250), setTimeout(() => setIntroStage(2), 800)];
    return () => {
      clearInterval(elapsedTimer);
      clearInterval(checkTimer);
      clearInterval(tipTimer);
      introTimers.forEach(clearTimeout);
    };
  }, []);

  const handleCopy = async () => {
    if (!transactionId) return;
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy transaction ID:', e);
    }
  };

  // The MRZ types out once the issuer has accepted the request
  const cardStage = transactionId ? 3 : introStage;

  const stages = CHECKS.map((check, index) => {
    const state: StageState = index < ticked ? 'done' : index === ticked ? 'active' : 'pending';
    const isLast = index === CHECKS.length - 1;
    return {
      title: state === 'done' ? check.done : check.active,
      description: isLast && status ? `${check.description} Status: ${status}` : check.description,
      state
    };
  });

  return (
    <div className="grid items-center gap-12 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mx-auto w-full max-w-[28rem]"
      >
        <IdCardPreview
          data={card}
          stage={cardStage}
          scanning={!!transactionId}
          badge={{ label: transactionId ? 'Signing' : 'Submitting', tone: 'progress' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="mx-auto mt-6 flex w-full max-w-[20rem] flex-col items-center gap-3"
        >
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-small text-ink-muted">
            Generating your verifiable credential with
            <span className="relative inline-block overflow-hidden">
              <img src="/brand/credissuer-logo.svg" alt="CredIssuer" className="h-5 w-auto" />
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent motion-reduce:hidden"
                aria-hidden
              />
            </span>
          </p>
          <div className="relative h-0.5 w-full overflow-hidden rounded-pill bg-credissuer/15" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-2/5 animate-indeterminate rounded-pill bg-credissuer motion-reduce:hidden" />
          </div>
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-6">
        <ol className="flex flex-col" aria-label="Issuance progress" aria-live="polite">
          {stages.map((stage, index) => (
            <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
              {index < stages.length - 1 && (
                <span className="absolute left-3 top-8 h-[calc(100%-2rem)] w-px bg-line-strong" aria-hidden>
                  <motion.span
                    className="absolute inset-0 origin-top bg-pass"
                    initial={false}
                    animate={{ scaleY: stage.state === 'done' ? 1 : 0 }}
                    transition={{ duration: 0.5, ease }}
                  />
                </span>
              )}
              <StageNode state={stage.state} />
              <div className="flex min-w-0 flex-col gap-1 pt-0.5">
                <p className={`text-body font-medium ${stage.state === 'pending' ? 'text-ink-muted' : ''}`}>
                  {stage.title}
                </p>
                <p className="text-small text-ink-muted">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <dl className="grid grid-cols-1 gap-4 rounded-lg bg-sand p-6 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-caption text-ink-muted">Transaction ID</dt>
            <dd className="flex min-w-0 items-center gap-2">
              {transactionId ? (
                <>
                  <span className="truncate font-mono text-[14px] leading-5">{transactionId}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? 'Transaction ID copied' : 'Copy transaction ID'}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-pill text-ink-muted hover:bg-card hover:text-ink"
                  >
                    {copied ? <CheckCheck className="h-4 w-4 text-pass" /> : <Copy className="h-4 w-4" />}
                  </button>
                </>
              ) : (
                <span className="h-5 w-40 animate-pulse rounded-sm bg-line/60" aria-label="Waiting for transaction ID" />
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-ink-muted">Time elapsed</dt>
            <dd className="font-mono text-[14px] leading-5 tabular-nums">{formatElapsed(elapsedSeconds)}</dd>
          </div>
        </dl>

        <div className="min-h-[3.5rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-small text-ink-muted"
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-caption text-ink-muted">
          Keep this page open. You'll move on automatically once your Digital ID is ready.
        </p>
      </div>
    </div>
  );
}

function StageNode({ state }: { state: StageState }) {
  if (state === 'done') {
    return (
      <motion.span
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        className="relative z-10 flex h-6 w-6 flex-none items-center justify-center rounded-pill bg-pass text-ink-on-strong"
      >
        <Check className="h-3.5 w-3.5" aria-hidden />
      </motion.span>
    );
  }
  if (state === 'active') {
    return (
      <span className="relative z-10 flex h-6 w-6 flex-none items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-pill bg-azure/30 motion-reduce:hidden" />
        <span className="h-6 w-6 rounded-pill border-2 border-azure bg-card" />
        <span className="absolute h-2 w-2 rounded-pill bg-azure" />
      </span>
    );
  }
  return <span className="relative z-10 h-6 w-6 flex-none rounded-pill border-2 border-line-strong bg-card" />;
}
