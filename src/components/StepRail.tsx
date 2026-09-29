import { motion } from 'framer-motion';
import { Check, Lock, Pencil } from 'lucide-react';
import IdCardPreview, { type IdCardData } from './ui/IdCardPreview';

export interface RailStep {
  label: string;
  hint: string;
  summary?: string;
  reachable: boolean;
}

interface StepRailProps {
  steps: RailStep[];
  current: number;
  onSelect: (index: number) => void;
  card: IdCardData;
  cardStage: number;
  savedAt?: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="h-1 overflow-hidden rounded-pill bg-line"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label="Application progress"
    >
      <motion.div
        className="h-full rounded-pill bg-azure"
        initial={false}
        animate={{ width: `${((current + 1) / total) * 100}%` }}
        transition={{ duration: 0.5, ease }}
      />
    </div>
  );
}

export default function StepRail({ steps, current, onSelect, card, cardStage, savedAt }: StepRailProps) {
  const next = steps[current + 1];

  return (
    <>
      {/* Mobile: compact progress bar */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-baseline justify-between text-small">
          <span className="font-medium">{steps[current].label}</span>
          <span className="text-ink-muted">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <ProgressBar current={current} total={steps.length} />
        <p className="mt-2 flex justify-between text-caption text-ink-muted">
          <span>{next ? `Next: ${next.label}` : 'Last step'}</span>
          {savedAt && <span>Draft saved at {formatTime(savedAt)}</span>}
        </p>
      </div>

      {/* Desktop: vertical rail */}
      <nav aria-label="Application steps" className="hidden lg:block">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-small text-ink-muted">
            Step {current + 1} of {steps.length}
          </p>
          <ProgressBar current={current} total={steps.length} />
        </div>

        <ol className="flex flex-col">
          {steps.map((step, index) => {
            const active = index === current;
            const done = !active && !!step.summary;
            const clickable = step.reachable && !active;
            const isLast = index === steps.length - 1;
            const content = (
              <>
                <span className="relative z-10 flex h-8 w-8 flex-none items-center justify-center">
                  {done ? (
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, ease }}
                      className="flex h-8 w-8 items-center justify-center rounded-pill bg-azure text-ink-on-strong"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </motion.span>
                  ) : active ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-pill border-2 border-navy bg-card text-small font-medium">
                      {index + 1}
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-pill border border-line-strong bg-canvas text-small text-ink-muted">
                      {index + 1}
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 pt-1.5 text-left">
                  <span className="flex items-center justify-between gap-2">
                    <span className={`text-body font-medium ${!done && !active ? 'text-ink-muted' : ''}`}>{step.label}</span>
                    {clickable && done && (
                      <span className="flex items-center gap-1 text-caption text-azure-ink opacity-70 transition-opacity group-hover:opacity-100">
                        <Pencil className="h-3 w-3" aria-hidden />
                        Edit
                      </span>
                    )}
                  </span>
                  <span className={`truncate text-small ${active ? 'text-azure-ink' : 'text-ink-muted'}`}>
                    {active ? 'In progress' : done ? step.summary : step.hint}
                  </span>
                </span>
              </>
            );

            return (
              <li key={step.label} className="relative pb-6 last:pb-0">
                {!isLast && (
                  <span className="absolute left-4 top-10 h-[calc(100%-3rem)] w-px -translate-x-1/2 bg-line-strong" aria-hidden>
                    <motion.span
                      className="absolute inset-0 origin-top bg-azure"
                      initial={false}
                      animate={{ scaleY: done ? 1 : 0 }}
                      transition={{ duration: 0.45, ease }}
                    />
                  </span>
                )}
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    className="group -m-2 flex w-[calc(100%+1rem)] items-start gap-4 rounded-sm p-2 transition-colors hover:bg-sand"
                    aria-label={`${step.label}${done ? ', completed. Edit' : ''}`}
                  >
                    {content}
                  </button>
                ) : (
                  <div className="flex items-start gap-4" aria-current={active ? 'step' : undefined}>
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* The last step shows the full card, so the rail preview would repeat it */}
        {next && (
          <figure className="mt-12 flex flex-col gap-3">
            <figcaption className="text-small font-medium">Your Digital ID so far</figcaption>
            <IdCardPreview data={card} stage={cardStage} />
          </figure>
        )}
        {savedAt && (
          <p className="mt-3 text-caption text-ink-muted">Draft saved on this device at {formatTime(savedAt)}</p>
        )}

        <div className="mt-6 flex gap-2 border-t border-line pt-6 text-small text-ink-muted">
          <Lock className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          <p>Your information is encrypted and used only for identity verification and credential issuance.</p>
        </div>
      </nav>
    </>
  );
}
