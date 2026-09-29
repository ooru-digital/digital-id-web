import { useEffect, useState } from 'react';
import { Fingerprint, Check, Loader2, Send, FileCheck, ShieldCheck, Clock, Copy, CheckCheck, Info } from 'lucide-react';

interface IssuanceProgressProps {
  transactionId: string | null;
  status: string | null;
}

type StageState = 'done' | 'active' | 'pending';

const TIPS = [
  'Your Digital ID is cryptographically signed, so it cannot be forged or tampered with.',
  'Once issued, your Digital ID will be sent to your registered email address.',
  'You can store your Digital ID in your Wallet and share it securely whenever needed.',
  'Your Digital ID includes a QR code so it can be verified instantly.'
];

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function IssuanceProgress({ transactionId, status }: IssuanceProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const elapsedTimer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    const tipTimer = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 5000);
    return () => {
      clearInterval(elapsedTimer);
      clearInterval(tipTimer);
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

  const stages: { title: string; description: string; icon: typeof Send; state: StageState }[] = [
    {
      title: 'Details submitted',
      description: transactionId
        ? 'Your application has been received by the issuing authority'
        : 'Securely submitting your details and photo…',
      icon: Send,
      state: transactionId ? 'done' : 'active'
    },
    {
      title: 'Generating & signing your Digital ID',
      description: transactionId
        ? `Creating your verifiable credential${status ? ` · Status: ${status}` : '…'}`
        : 'Waiting for submission to complete',
      icon: FileCheck,
      state: transactionId ? 'active' : 'pending'
    },
    {
      title: 'Ready to use',
      description: 'Your Digital ID will be delivered to your email and available for download',
      icon: ShieldCheck,
      state: 'pending'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#5D5FEF] via-[#7C3AED] to-[#5D5FEF] px-6 pt-10 pb-8 text-white overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

          {/* Animated emblem */}
          <div className="relative flex justify-center mb-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              <span className="absolute inset-2 rounded-full border-4 border-white/20 border-t-white animate-spin" />
              <span className="absolute inset-5 rounded-full border-2 border-dashed border-white/40 animate-spin-slow" />
              <div className="relative w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <Fingerprint className="w-8 h-8 text-[#5D5FEF] animate-pulse" />
              </div>
            </div>
          </div>

          <h2 className="relative text-2xl font-bold mb-2">Digital ID Issuance in Progress</h2>
          <p className="relative text-sm text-white/90 max-w-md mx-auto">
            Sit tight! We're securely generating your digital national ID. This usually takes less than a minute.
          </p>

          {/* Indeterminate progress bar */}
          <div className="relative mt-6 h-1.5 w-full max-w-sm mx-auto bg-white/20 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full animate-indeterminate" />
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Stages */}
          <ol className="text-left space-y-0">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isLast = index === stages.length - 1;
              return (
                <li key={stage.title} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  {!isLast && (
                    <span
                      className={`absolute left-5 top-10 -ml-px h-[calc(100%-2.5rem)] w-0.5 ${
                        stage.state === 'done' ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      stage.state === 'done'
                        ? 'bg-green-500 text-white shadow-md shadow-green-200'
                        : stage.state === 'active'
                        ? 'bg-[#5D5FEF] text-white shadow-lg shadow-[#5D5FEF]/30 ring-4 ring-[#5D5FEF]/15'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {stage.state === 'done' ? (
                      <Check className="w-5 h-5" />
                    ) : stage.state === 'active' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="pt-1.5 min-w-0">
                    <h3
                      className={`text-sm font-semibold ${
                        stage.state === 'pending' ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {stage.title}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        stage.state === 'active' ? 'text-[#5D5FEF]' : 'text-gray-500'
                      }`}
                    >
                      {stage.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Transaction details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1">Transaction ID</p>
              {transactionId ? (
                <div className="flex items-center justify-between space-x-2">
                  <span className="font-mono text-sm font-semibold text-gray-900 truncate">{transactionId}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-shrink-0 p-1 rounded text-gray-500 hover:text-[#5D5FEF] hover:bg-[#5D5FEF]/10 transition-colors"
                    title="Copy transaction ID"
                  >
                    {copied ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1">Time Elapsed</p>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#5D5FEF]" />
                <span className="font-mono text-sm font-semibold text-gray-900">{formatElapsed(elapsedSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Rotating tip */}
          <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-lg p-4 border border-[#5D5FEF]/20">
            <div className="flex items-start space-x-3 text-left">
              <div className="w-7 h-7 bg-[#5D5FEF] rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div className="min-h-[2.5rem]">
                <p className="text-xs font-semibold text-[#5D5FEF] mb-0.5">Did you know?</p>
                <p key={tipIndex} className="text-xs text-[#5D5FEF]/80 animate-fade-in-up">
                  {TIPS[tipIndex]}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Please keep this page open. You'll be taken to the next screen automatically once your Digital ID is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
