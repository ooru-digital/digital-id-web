import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import Callout from './ui/Callout';

interface FailedScreenProps {
  error: string;
  onRetry: () => void;
  onStartOver: () => void;
}

const FIXES = [
  'Make sure your NRC number is correct and not already issued',
  'Check that all personal information is accurate',
  'Check that your internet connection is stable',
  'Retake your selfie if it was unclear'
];

export default function FailedScreen({ error, onRetry, onStartOver }: FailedScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex max-w-2xl flex-col gap-6"
    >
      <Callout tone="fail" title="Your Digital ID was not issued">
        <p className="break-words">{error}</p>
      </Callout>

      <div className="rounded-lg bg-card p-6 shadow-card">
        <p className="mb-3 text-small font-medium">Before you try again</p>
        <ul className="grid grid-cols-1 gap-3 text-small text-ink-muted sm:grid-cols-2">
          {FIXES.map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-pill bg-azure" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onStartOver}>
          Start over
        </Button>
        <Button type="button" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
      </div>

      <p className="text-small text-ink-muted">
        If the problem continues, contact{' '}
        <a href="mailto:support@ooru.io" className="font-medium text-azure-ink hover:underline">support@ooru.io</a>
        {' '}and include the error above.
      </p>
    </motion.div>
  );
}
