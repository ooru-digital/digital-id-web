import { motion } from 'framer-motion';
import { ArrowLeft, Pencil } from 'lucide-react';
import type { PersonalDetails } from './PersonalDetailsForm';
import IdCardPreview, { type IdCardData } from './ui/IdCardPreview';
import Button from './ui/Button';
import StepFooter from './ui/StepFooter';

type EditableStep = 'personal' | 'selfie';

interface PhotoVerificationProps {
  details: PersonalDetails;
  selfie: string;
  card: IdCardData;
  onEdit: (step: EditableStep) => void;
  onContinue: () => void;
  onBack: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

function ReviewSection({ title, onEdit, editLabel, children }: {
  title: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lead-18">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className="flex items-center gap-1 rounded-sm px-2 py-1 text-small font-medium text-azure-ink hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

export default function PhotoVerification({ details, selfie, card, onEdit, onContinue, onBack }: PhotoVerificationProps) {
  const rows = [
    { label: 'Given name', value: details.givenName },
    { label: 'Surname', value: details.surName },
    { label: 'Date of birth', value: card.dateOfBirth },
    { label: 'Sex', value: details.sex },
    { label: 'Email address', value: details.email },
    { label: 'NRC number', value: details.nrcNumber }
  ];

  return (
    <div>
      <motion.figure
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="mx-auto mb-12 flex max-w-md flex-col gap-3"
      >
        <IdCardPreview data={card} badge={{ label: 'Preview', tone: 'neutral' }} />
        <figcaption className="text-center text-small text-ink-muted">This is how your Digital ID will look</figcaption>
      </motion.figure>

      <div className="flex flex-col gap-6">
        <ReviewSection title="Your details" onEdit={() => onEdit('personal')} editLabel="Edit your details">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rows.map(row => (
              <div key={row.label} className="flex min-w-0 flex-col gap-1">
                <dt className="text-caption text-ink-muted">{row.label}</dt>
                <dd className="truncate text-body font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </ReviewSection>

        <ReviewSection title="Your photo" onEdit={() => onEdit('selfie')} editLabel="Retake your photo">
          <img src={selfie} alt="Your live photo" className="aspect-[4/3] w-40 rounded-sm object-cover" />
        </ReviewSection>
      </div>

      <StepFooter>
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Button>
        <Button type="button" variant="accent" onClick={onContinue}>
          Issue Digital ID
        </Button>
      </StepFooter>
    </div>
  );
}
