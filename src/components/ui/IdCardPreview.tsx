import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export interface IdCardData {
  givenName: string;
  surName: string;
  documentNumber: string;
  dateOfBirth: string;
  nationality: string;
  sex: string;
  mrz: string[];
  photo?: string;
}

interface IdCardPreviewProps {
  data: IdCardData;
  // How much of the card is revealed: 0 blank, 1 photo, 2 fields, 3 MRZ, 4 complete
  stage?: number;
  badge?: { label: string; tone: 'neutral' | 'progress' | 'pass' };
  scanning?: boolean;
  className?: string;
}

const MRZ_LENGTH = 30;
// Typewriter easing: advance one character at a time
const typewriter = (t: number) => Math.floor(t * MRZ_LENGTH) / MRZ_LENGTH;

const BADGE_TONES = {
  neutral: 'border-line-strong text-ink-muted',
  progress: 'border-azure-ink text-azure-ink',
  pass: 'border-pass text-pass',
};

const reveal = (visible: boolean, delay = 0) => ({
  initial: false as const,
  animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay },
});

export default function IdCardPreview({ data, stage = 4, badge, scanning, className = '' }: IdCardPreviewProps) {
  const fields = [
    { label: 'Surname', value: data.surName },
    { label: 'Given name', value: data.givenName },
    { label: 'Document no.', value: data.documentNumber, mono: true },
    { label: 'Date of birth', value: data.dateOfBirth },
    { label: 'Nationality', value: data.nationality },
    { label: 'Sex', value: data.sex },
  ];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-card text-ink shadow-raised ${className}`}
      style={{ aspectRatio: '1.586 / 1' }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2">
            <img src="/brand/ooru-mark-colour.png" alt="" className="h-4 w-auto sm:h-5" />
            <span className="text-caption font-medium sm:text-small sm:font-medium">Digital Identity Card</span>
          </div>
          {badge && (
            <motion.span
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-pill border px-2 py-0.5 text-caption sm:px-3 ${BADGE_TONES[badge.tone]}`}
            >
              {badge.label}
            </motion.span>
          )}
        </div>

        <div className="flex flex-1 gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <div className="relative w-[26%] flex-none">
            <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-sand">
              <User className="h-1/3 w-1/3 text-line-strong" aria-hidden />
            </div>
            {data.photo && (
              <motion.img
                src={data.photo}
                alt="Holder photo"
                className="absolute inset-0 h-full w-full rounded-sm object-cover"
                initial={false}
                animate={stage >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="absolute -right-1.5 bottom-2 h-3 w-5 rounded-[3px] bg-cyan sm:h-4 sm:w-6" aria-hidden />
          </div>

          <dl className="grid flex-1 grid-cols-2 content-start gap-x-3 gap-y-1.5 sm:gap-y-2">
            {fields.map((field, index) => (
              <motion.div key={field.label} className="min-w-0" {...reveal(stage >= 2, stage >= 2 ? index * 0.07 : 0)}>
                <dt className="text-[10px] leading-3 text-ink-muted sm:text-caption">{field.label}</dt>
                <dd className={`truncate text-[11px] font-medium leading-4 sm:text-small sm:font-medium ${field.mono ? 'font-mono' : ''}`}>
                  {field.value || '—'}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        <div className="bg-sand px-4 py-2 sm:px-6 sm:py-3" aria-label="Machine readable zone">
          {data.mrz.map((line, index) => (
            <motion.p
              key={index}
              className="overflow-hidden whitespace-pre font-mono text-[9px] leading-[13px] tracking-[0.08em] text-ink sm:text-[11px] sm:leading-4"
              initial={false}
              animate={{ clipPath: stage >= 3 ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
              transition={{ duration: stage >= 3 ? 0.9 : 0, ease: typewriter, delay: stage >= 3 ? index * 0.9 : 0 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      {scanning && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-cyan/25 to-transparent motion-reduce:hidden" />
        </div>
      )}
    </div>
  );
}

const toMrzName = (value: string) => value.toUpperCase().replace(/[^A-Z]/g, '<');

// TD1 line 3 is the holder's name: SURNAME<<GIVEN<NAMES
export const mrzNameLine = (surName: string, givenName: string) =>
  `${toMrzName(surName)}<<${toMrzName(givenName)}`.padEnd(MRZ_LENGTH, '<').substring(0, MRZ_LENGTH);
