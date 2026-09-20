type StampProps = {
  label: string;
  /** A date or similar detail printed under the label, as on a real stamp. */
  detail?: string;
  /**
   * `done` for a finished page, `muted` for a shortfall, `stamp` for the red
   * ink kept for submission itself.
   */
  tone?: 'stamp' | 'done' | 'muted';
};

const TONES = {
  stamp: 'border-stamp text-stamp',
  done: 'border-keep-ink text-keep-ink',
  muted: 'border-faded text-faded',
} as const;

export function Stamp({ label, detail, tone = 'stamp' }: StampProps) {
  return (
    <span
      className={`font-stamp inline-flex -rotate-6 flex-col items-center rounded-card border-[3px] px-3 py-1 opacity-80 ${TONES[tone]}`}
    >
      <span className="text-hand-md leading-none uppercase">{label}</span>
      {detail && <span className="text-xs tracking-wide">{detail}</span>}
    </span>
  );
}
