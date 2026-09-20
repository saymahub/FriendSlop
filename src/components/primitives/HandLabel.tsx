import type { ElementType, ReactNode } from 'react';

type HandLabelProps = {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  /** `title` is the display face, reserved for page and section titles. */
  face?: 'hand' | 'title';
  /** Soft halo in the signature colour. Display sizes only. */
  glow?: boolean;
  as?: ElementType;
  className?: string;
};

const SIZES = {
  sm: 'text-hand-sm',
  md: 'text-hand-md',
  lg: 'text-hand-lg',
  xl: 'text-hand-xl',
  hero: 'text-hand-hero',
} as const;

const FACES = { hand: 'font-hand', title: 'font-title font-bold' } as const;

/** Handwriting is for labels, names and captions only — never for body copy. */
export function HandLabel({
  children,
  size = 'md',
  face = 'hand',
  glow = false,
  as: Tag = 'span',
  className = '',
}: HandLabelProps) {
  return (
    <Tag className={`${FACES[face]} leading-tight ${SIZES[size]} ${glow ? 'text-glow' : ''} ${className}`}>
      {children}
    </Tag>
  );
}
