type ChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  /** Selection order shown as a badge, for questions that rank their picks. */
  badge?: number;
};

export function Chip({ label, selected = false, onClick, badge }: ChipProps) {
  const tone = selected
    ? 'border-ink bg-[var(--person-base)] text-[var(--person-ink)]'
    : 'border-paper-edge bg-paper text-ink-soft hover:border-faded';

  if (!onClick) {
    return (
      <span className={`${DISPLAY_CHIP} border-[var(--person-base)] bg-[var(--person-wash)] text-ink`}>
        {label}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`${CHIP_BASE} ${tone}`}>
      {label}
      {badge !== undefined && <span className="ml-1 text-xs font-bold tabular-nums">{badge}</span>}
    </button>
  );
}

/** Shared by every non-interactive pill, so sizes cannot drift apart. */
export const DISPLAY_CHIP =
  'inline-flex items-center gap-1 rounded-chip border-2 px-3.5 py-1.5 text-sm font-semibold';

/** min-h-11 is 44px: the smallest target a thumb hits reliably. */
const CHIP_BASE =
  'inline-flex min-h-11 items-center gap-1 rounded-chip border-2 px-4 py-2 text-sm font-semibold transition-colors';
