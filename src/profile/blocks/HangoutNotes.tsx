import { PaperCard } from '@/components/primitives';
import { labelledAnswers, textAnswer } from '@/lib/answerDisplay';
import { BlockHeading } from '../BlockHeading';
import { ChipRow } from '../ChipRow';
import type { BlockProps } from '../blockTypes';

/** How they like to spend time together: the planning notes for a day out. */
export function HangoutNotes({ profile }: BlockProps) {
  const { answers } = profile;
  const rows = [
    { label: 'Ideal Saturday plans', values: labelledAnswers(answers, 'idealSaturday') },
    { label: 'Group size', values: labelledAnswers(answers, 'groupSize') },
    { label: 'I’ll always eat here', values: [textAnswer(answers, 'alwaysYesRestaurant')].filter(Boolean) },
    { label: 'Do I need a heads up?', values: labelledAnswers(answers, 'planNotice') },
    { label: 'Not doing this', values: labelledAnswers(answers, 'hardNoActivities') },
  ];

  if (rows.every((row) => row.values.length === 0)) {
    return null;
  }

  return (
    <PaperCard>
      <BlockHeading>Wanna hang?</BlockHeading>
      {rows.map((row) => (
        <ChipRow key={row.label} label={row.label} values={row.values} labelWidth="wide" />
      ))}
    </PaperCard>
  );
}
