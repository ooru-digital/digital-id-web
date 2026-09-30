import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Copy, Download, Mail, RotateCw, Smartphone, X } from 'lucide-react';
import { buildOfferQrUrl } from '../config/apiConfig';
import Callout from './ui/Callout';
import Button from './ui/Button';
import IdCardPreview, { type IdCardData } from './ui/IdCardPreview';
import IssuedCard, { downloadCardPdf } from './ui/IssuedCard';

interface SuccessScreenProps {
  onStartOver: () => void;
  card?: IdCardData;
  svgUrl?: string;
  credentialId?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

const WALLET_STEPS = [
  { title: 'Open CredIssuer Wallet', body: 'Launch the app on your phone and unlock it.' },
  { title: 'Scan this code', body: 'Tap Scan and point your camera at the QR code.' },
  { title: 'Accept your National ID', body: 'Review the details and accept to save it to your wallet.' }
];

const WALLET_ANDROID_URL = 'https://drive.google.com/drive/folders/1QafLwz_ou6KKwqCdkYaEvPhaR2Vhb7d9';
const WALLET_INFO_EMAIL = 'info@ooru.io';

// iPadOS reports itself as a Mac, so a touch-capable "Mac" is treated as iOS
function detectPlatform(): 'android' | 'ios' | 'desktop' {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'desktop';
}

const BENEFITS = [
  'Stored securely on your device',
  'Available offline',
  'Verified instantly by QR code',
  'You choose what to share'
];

export default function SuccessScreen({ onStartOver, card, svgUrl, credentialId }: SuccessScreenProps) {
  const preview = card && <IdCardPreview data={card} stage={4} badge={{ label: 'Issued', tone: 'pass' }} />;

  return (
    <div className="flex flex-col gap-12">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {(svgUrl || card) && (
          <motion.div
            initial={{ scale: 0.96, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mx-auto w-full max-w-[28rem]"
          >
            {svgUrl ? <IssuedCard svgUrl={svgUrl} fallback={preview} /> : preview}
          </motion.div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 48 48" className="h-12 w-12 flex-none text-pass" aria-hidden>
              <motion.circle
                cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease }}
              />
              <motion.path
                d="M15 24.5l6 6 12-13" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease, delay: 0.5 }}
              />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="text-lead-18 text-pass">Issued</p>
              <p className="text-small text-ink-muted">Your Digital ID has been signed and sent to your email.</p>
              <p className="text-small text-ink-muted">QR contains face biometric data. Can be used for face authentication offline.</p>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.9 }}
            className="flex items-center gap-2 self-start rounded-pill border border-credissuer/25 bg-credissuer/5 py-1.5 pl-2 pr-4 text-small text-ink-muted"
          >
            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-pill bg-credissuer text-ink-on-strong">
              <Check className="h-3 w-3" aria-hidden />
            </span>
            Signed &amp; issued via
            <img src="/brand/credissuer-logo.svg" alt="CredIssuer" className="h-4 w-auto" />
          </motion.p>

          <ul className="grid grid-cols-1 gap-3 text-small sm:grid-cols-2">
            {BENEFITS.map(item => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none text-azure" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          {svgUrl && (
            <Button type="button" className="self-start" onClick={() => downloadCardPdf(svgUrl)}>
              <Download className="h-4 w-4" aria-hidden />
              Download card (PDF)
            </Button>
          )}
        </div>
      </div>

      <section className="rounded-lg bg-sand p-6 sm:p-12" aria-labelledby="wallet-heading">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h3 id="wallet-heading" className="text-display-28">Add It to CredIssuer Wallet</h3>
            <p className="text-body text-ink-muted">Scan the code with the CredIssuer Wallet app to keep your National ID on your phone.</p>
          </div>
          <DownloadWallet />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)]">
          <WalletQr credentialId={credentialId} />

          <ol className="flex flex-col gap-6">
            {WALLET_STEPS.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.6 + index * 0.08 }}
                className="flex gap-4"
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-pill border border-line-strong bg-card text-small font-medium">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-body font-medium">{step.title}</p>
                  <p className="text-small text-ink-muted">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
        <p className="text-small text-ink-muted">
          Need help? Contact{' '}
          <a href="mailto:support@ooru.io" className="font-medium text-azure-ink hover:underline">support@ooru.io</a>
        </p>
        <Button type="button" variant="outline" onClick={onStartOver}>
          Register another ID
        </Button>
      </div>
    </div>
  );
}

function DownloadWallet() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<'ios' | 'desktop'>('desktop');
  const [copied, setCopied] = useState(false);

  const open = () => {
    const platform = detectPlatform();
    if (platform === 'android') {
      window.open(WALLET_ANDROID_URL, '_blank', 'noopener');
      return;
    }
    setMode(platform);
    setCopied(false);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_ANDROID_URL);
      setCopied(true);
    } catch {
      window.open(WALLET_ANDROID_URL, '_blank', 'noopener');
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <p className="text-small text-ink-muted">Don&apos;t have the app yet?</p>
      <Button type="button" variant="outline" className="self-start sm:self-auto" onClick={open}>
        <Smartphone className="h-4 w-4" aria-hidden />
        Download Wallet
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="wallet-dialog-title"
        onClick={e => e.target === e.currentTarget && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-card text-ink shadow-card backdrop:bg-navy/50 backdrop:backdrop-blur-sm"
      >
        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-pill p-2 text-ink-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          {mode === 'desktop' ? (
            <>
              <div className="flex flex-col gap-2 pr-8">
                <h4 id="wallet-dialog-title" className="text-lead-18 font-medium">Get CredIssuer Wallet</h4>
                <p className="text-small text-ink-muted">Scan with your Android phone&apos;s camera to download the app.</p>
              </div>

              <div className="relative mx-auto p-4">
                {CORNERS.map(c => (
                  <span key={c} className={`absolute h-8 w-8 border-navy ${c}`} aria-hidden />
                ))}
                <img
                  src="/brand/wallet-android-qr.svg"
                  alt="QR code to download CredIssuer Wallet for Android"
                  className="h-52 w-52 rounded-sm bg-card p-3"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="button" variant="outline" size="sm" className="self-center" onClick={copyLink}>
                  {copied ? <Check className="h-3.5 w-3.5 text-pass" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  {copied ? 'Link copied' : 'Copy download link'}
                </Button>
                <p className="rounded-lg bg-sand px-4 py-3 text-center text-small text-ink-muted">
                  On iPhone? The iOS app is coming soon. Reach out to{' '}
                  <a href={`mailto:${WALLET_INFO_EMAIL}`} className="font-medium text-azure-ink hover:underline">{WALLET_INFO_EMAIL}</a>
                  {' '}for early access.
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-sand text-navy">
                <Smartphone className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-2">
                <h4 id="wallet-dialog-title" className="text-lead-18 font-medium">iOS app coming soon</h4>
                <p className="text-small text-ink-muted">
                  CredIssuer Wallet is available on Android today, and we&apos;re working on the iPhone version.
                  For early access or more information, reach out to{' '}
                  <span className="font-medium text-ink">{WALLET_INFO_EMAIL}</span>.
                </p>
                <p className="text-small text-ink-muted">Your Digital ID is already in your email, so nothing is lost in the meantime.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${WALLET_INFO_EMAIL}?subject=${encodeURIComponent('CredIssuer Wallet for iOS')}`}
                  className="inline-flex items-center justify-center gap-2 rounded-pill border border-transparent bg-navy px-6 py-3 text-label text-ink-on-strong transition-colors hover:bg-azure-ink"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  Email {WALLET_INFO_EMAIL}
                </a>
                <Button type="button" variant="outline" onClick={close}>Close</Button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}

// Scanner-style corner brackets framing the QR
const CORNERS = [
  'left-0 top-0 border-l-2 border-t-2 rounded-tl-lg',
  'right-0 top-0 border-r-2 border-t-2 rounded-tr-lg',
  'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
  'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg'
];

function WalletQr({ credentialId }: { credentialId?: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  if (!credentialId || state === 'error') {
    return (
      <Callout tone="warn" title="QR code unavailable" className="w-full max-w-[20rem]">
        <p>Your Digital ID was still sent to your email.</p>
        {credentialId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => { setState('loading'); setAttempt(a => a + 1); }}
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </Button>
        )}
      </Callout>
    );
  }

  return (
    <figure className="mx-auto flex flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease, delay: 0.4 }}
        className="relative p-4"
      >
        {CORNERS.map(c => (
          <span key={c} className={`absolute h-8 w-8 border-navy ${c}`} aria-hidden />
        ))}
        <div className="relative h-60 w-60 overflow-hidden rounded-sm bg-card p-3">
          {state === 'loading' && <div className="absolute inset-3 animate-pulse rounded bg-line" aria-hidden />}
          <img
            key={attempt}
            src={buildOfferQrUrl(credentialId)}
            alt="QR code to add your National ID to CredIssuer Wallet"
            className={`h-full w-full object-contain transition-opacity ${state === 'ready' ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
          />
        </div>
      </motion.div>
      <figcaption className="max-w-[16rem] text-center text-small text-ink-muted">
        On this phone? Open this page on another screen to scan it.
      </figcaption>
    </figure>
  );
}
