import { Chip, PaperCard } from '@/components/primitives';
import { DISPLAY_CHIP } from '@/components/primitives/Chip';
import { BlockHeading } from '../BlockHeading';
import { chosenFlowerNames, chosenSwatches, labelledAnswers } from '@/lib/answerDisplay';
import type { BlockProps } from '../blockTypes';

export function ColourStrip({ profile }: BlockProps) {
  const { answers } = profile;
  const loved = chosenSwatches(answers, 'coloursLoved');
  const hated = chosenSwatches(answers, 'coloursHated');
  const aesthetic = labelledAnswers(answers, 'aesthetic');
  const scents = labelledAnswers(answers, 'scentsLoved');
  const blooms = chosenFlowerNames(answers, 'flowers');

  return (
    <PaperCard>
      <BlockHeading>Colour and vibe</BlockHeading>

      <SwatchRow label="Loves" swatches={loved} />
      <SwatchRow label="Never" swatches={hated} />

      <ChipRow label="Aesthetic" values={aesthetic} />
      <ChipRow label="Hobbies" values={labelledAnswers(answers, 'hobbies')} />
      <ChipRow label="Flowers" values={blooms} />
      <ChipRow label="Scents" values={scents} />
    </PaperCard>
  );
}

type SwatchRowProps = { label: string; swatches: ReturnType<typeof chosenSwatches> };

function SwatchRow({ label, swatches }: SwatchRowProps) {
  if (swatches.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm text-faded">{label}</span>
      <ul className="flex flex-wrap gap-2">
        {swatches.map((swatch) => (
          <li
            key={swatch.name}
            style={{ backgroundColor: swatch.base, color: swatch.ink, borderColor: swatch.base }}
            className={DISPLAY_CHIP}
          >
            {swatch.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChipRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm text-faded">{label}</span>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Chip key={value} label={value} />
        ))}
      </div>
    </div>
  );
}
