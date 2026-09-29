import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'outline' | 'accent' | 'on-strong';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant;
  size?: 'md' | 'sm';
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'border-transparent bg-navy text-ink-on-strong hover:bg-azure-ink',
  outline: 'bg-transparent text-ink border-line-strong hover:border-ink',
  accent: 'border-transparent bg-cyan text-ink hover:bg-azure hover:text-ink-on-strong',
  'on-strong': 'border-transparent bg-ink-on-strong text-navy hover:bg-cyan',
};

const SIZES = {
  md: 'text-label px-6 py-3',
  sm: 'text-small font-medium px-4 py-2',
};

// Ooru pill button: every button is a full pill, one primary per screen.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...rest },
  ref
) {
  const inactive = disabled || loading;
  return (
    <motion.button
      ref={ref}
      whileTap={inactive ? undefined : { scale: 0.97 }}
      disabled={inactive}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children as React.ReactNode}
    </motion.button>
  );
});

export default Button;
