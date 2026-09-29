import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type Tone = 'info' | 'pass' | 'warn' | 'fail';

const TONES: Record<Tone, { border: string; text: string; Icon: typeof Info }> = {
  info: { border: 'border-line-strong', text: 'text-ink', Icon: Info },
  pass: { border: 'border-pass', text: 'text-pass', Icon: CheckCircle2 },
  warn: { border: 'border-warn', text: 'text-warn', Icon: AlertTriangle },
  fail: { border: 'border-fail', text: 'text-fail', Icon: XCircle },
};

interface CalloutProps {
  tone?: Tone;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Callout({ tone = 'info', title, children, className = '' }: CalloutProps) {
  const { border, text, Icon } = TONES[tone];
  return (
    <div className={`flex flex-col gap-2 rounded-lg border bg-sand p-6 ${border} ${className}`}>
      <p className={`flex items-center gap-2 text-small font-medium ${text}`}>
        <Icon className="h-4 w-4 flex-none" aria-hidden />
        {title}
      </p>
      {children && <div className="text-small text-ink">{children}</div>}
    </div>
  );
}
