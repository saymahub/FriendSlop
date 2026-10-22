import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'quiet' | 'keep' | 'avoid';
};

const VARIANTS = {
  primary: 'border-ink bg-[var(--person-base)] text-[var(--person-ink)] shadow-lift',
  quiet: 'border-paper-edge bg-paper text-ink-soft hover:border-faded',
  keep: 'border-keep-ink bg-keep text-keep-ink shadow-lift',
  avoid: 'border-avoid-ink bg-avoid text-avoid-ink shadow-lift',
} as const;

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`min-h-11 rounded-card border-2 px-4 py-2 font-semibold transition-transform active:translate-y-px disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
