import { HandLabel } from '@/components/primitives';
import { chosenSwatches, labelledAnswers, textAnswer } from '@/lib/answerDisplay';
import type { BlockProps } from '../blockTypes';

/**
 * Two columns on green and red paper. The "never" side is deliberately the
 * quieter of the two: it is a warning, not the point of the page.
 */
export function BuyMeBoard({ profile }: BlockProps) {
  const { answers } = profile;
  const burritoSkips = labelledAnswers(answers, 'burritoSkips');

  const yes = [
    ...labelledAnswers(answers, 'snacks'),
    ...labelledAnswers(answers, 'collects'),
    textAnswer(answers, 'cafeOrder'),
    textAnswer(answers, 'comfortMeal'),
    ...labelledAnswers(answers, 'cuisine').map((cuisine) => `Cuisine: ${cuisine}`),
    ...labelledAnswers(answers, 'cakeFlavour').map((flavour) => `Cake: ${flavour}`),
  ].filter(Boolean);

  const no = [
    textAnswer(answers, 'foodsHated'),
    burritoSkips.length > 0 ? `In a burrito: ${burritoSkips.join(', ')}` : '',
    ...labelledAnswers(answers, 'scentsHated').map((scent) => `${scent} (scent)`),
    ...chosenSwatches(answers, 'coloursHated').map((swatch) => `${swatch.name} (colour)`),
  ].filter(Boolean);

  if (yes.length === 0 && no.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <Column title="Yes please" tone="keep" items={yes} />
      <Column title="Never, thanks" tone="avoid" items={no} />
    </section>
  );
}

type ColumnProps = { title: string; tone: 'keep' | 'avoid'; items: string[] };

const TONES = {
  keep: 'bg-keep text-keep-ink',
  avoid: 'bg-avoid/60 text-avoid-ink',
} as const;

function Column({ title, tone, items }: ColumnProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-card border-2 border-paper-edge p-4 ${TONES[tone]}`}>
      <HandLabel size="md" className="block">
        {title}
      </HandLabel>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
