import { useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { RotateCw } from 'lucide-react';

interface IssuedCardProps {
  svgUrl: string;
  // Shown if the credential image fails to load
  fallback: React.ReactNode;
}

// ponytail: crop boxes are fixed to the Utopia template (451x543, front above back);
// read them from the SVG's #Front / #Back bounding boxes if templates start to vary.
const SVG_WIDTH = 451;
const SVG_HEIGHT = 543;
const FRONT = '31 23 390 231';
const BACK = '31 289 390 231';

const flipSpring = { type: 'spring', stiffness: 70, damping: 13, mass: 0.9 } as const;

export default function IssuedCard({ svgUrl, fallback }: IssuedCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const reduceMotion = useReducedMotion();
  const lift = useAnimationControls();

  if (status === 'error') return <>{fallback}</>;

  const handleFlip = () => {
    setFlipped(f => !f);
    if (!reduceMotion) lift.start({ scale: [1, 1.05, 1], y: [0, -8, 0], transition: { duration: 0.8, ease: 'easeInOut' } });
  };

  const face = (viewBox: string, side: 'front' | 'back') => {
    const hidden = side === 'front' ? flipped : !flipped;
    return (
      <svg
        viewBox={viewBox}
        className="absolute inset-0 h-full w-full rounded-lg shadow-raised"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: side === 'back' && !reduceMotion ? 'rotateY(180deg)' : undefined,
          opacity: reduceMotion && hidden ? 0 : 1,
          transition: reduceMotion ? 'opacity 0.3s' : undefined
        }}
        aria-hidden
      >
        <image
          href={svgUrl}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          preserveAspectRatio="none"
          {...(side === 'front' && { onLoad: () => setStatus('ready'), onError: () => setStatus('error') })}
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div animate={lift} className="w-full" style={{ perspective: 1400 }}>
        <motion.button
          type="button"
          onClick={handleFlip}
          disabled={status !== 'ready'}
          aria-label={`Your Digital ID card, ${flipped ? 'back' : 'front'} side. Show the ${flipped ? 'front' : 'back'}.`}
          className="relative block w-full rounded-lg disabled:cursor-wait"
          style={{ aspectRatio: '390 / 231', transformStyle: 'preserve-3d' }}
          initial={false}
          animate={{ rotateY: flipped && !reduceMotion ? 180 : 0 }}
          transition={flipSpring}
        >
          <motion.span
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: status === 'ready' ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {face(FRONT, 'front')}
            {face(BACK, 'back')}
          </motion.span>

          {status === 'loading' && (
            <span className="absolute inset-0 overflow-hidden rounded-lg bg-sand" aria-hidden>
              <span className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-card/80 to-transparent motion-reduce:hidden" />
              <span className="absolute bottom-4 left-6 text-small text-ink-muted">Loading your Digital ID</span>
            </span>
          )}
        </motion.button>
      </motion.div>

      <p className="flex items-center gap-2 text-small text-ink-muted" aria-live="polite">
        <RotateCw className="h-4 w-4" aria-hidden />
        Tap the card to see the {flipped ? 'front' : 'back'}
      </p>
    </div>
  );
}
