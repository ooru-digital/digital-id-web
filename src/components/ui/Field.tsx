import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const inputClass = (hasError?: boolean) =>
  `w-full rounded-sm border bg-card px-4 py-3 text-body text-ink placeholder:text-ink-muted/70 transition-colors duration-200 focus:border-ink focus-visible:outline-offset-0 ${
    hasError ? 'border-fail' : 'border-line-strong hover:border-ink'
  }`;

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Field({ id, label, error, hint, className = '', children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1 text-caption text-fail"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-none" aria-hidden />
            {error}
          </motion.p>
        ) : hint ? (
          <p key="hint" className="text-caption text-ink-muted">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
