type TapeProps = {
  /** Where the strip sits relative to the card it decorates. */
  placement?: 'top-left' | 'top-right' | 'top-centre';
  className?: string;
};

const PLACEMENTS = {
  'top-left': '-top-3 left-5 -rotate-6',
  'top-right': '-top-3 right-5 rotate-6',
  'top-centre': '-top-3 left-1/2 -translate-x-1/2 -rotate-2',
} as const;

export function Tape({ placement = 'top-centre', className = '' }: TapeProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-6 w-20 bg-tape/80 shadow-sm ${PLACEMENTS[placement]} ${className}`}
    />
  );
}
