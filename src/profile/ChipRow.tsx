import { Chip } from '@/components/primitives';

type ChipRowProps = {
  label: string;
  values: string[];
  /**
   * \`wide\` fits longer labels on one line. On a phone the label then sits above
   * its chips, because a wide label beside them would squeeze long answers.
   */
  labelWidth?: 'narrow' | 'wide';
};

const LAYOUTS = {
  narrow: { row: 'flex items-center gap-3', label: 'w-20 shrink-0' },
  wide: {
    row: 'flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3',
    label: 'whitespace-nowrap sm:w-36 sm:shrink-0',
  },
} as const;

/** A label and its answers as chips, or nothing at all when the answer is empty. */
export function ChipRow({ label, values, labelWidth = 'narrow' }: ChipRowProps) {
  if (values.length === 0) {
    return null;
  }

  const layout = LAYOUTS[labelWidth];

  return (
    <div className={`mt-3 ${layout.row}`}>
      <span className={`text-sm text-faded ${layout.label}`}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Chip key={value} label={value} />
        ))}
      </div>
    </div>
  );
}
