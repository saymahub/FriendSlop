import { PaperCard } from '@/components/primitives';
import { BlockHeading } from '../BlockHeading';
import { questions } from '@/config/questions';
import { sliderAnswer, submittedSliderAnswer } from '@/lib/answerDisplay';
import type { SliderQuestion } from '@/config/questionTypes';
import type { BlockProps } from '../blockTypes';

/**
 * Every slider, drawn as a gauge with its ends labelled in words. Once the page is
 * handed in, an untouched slider shows in the middle, where its handle was left.
 */
export function Meters({ profile, showPrivate }: BlockProps) {
  const sliders = questions.filter(
    (question): question is SliderQuestion => question.type === 'slider' && (showPrivate || !question.isPrivate),
  );

  const answered = sliders
    .map((question) => ({ question, position: positionOf(profile, question.id) }))
    .filter((meter): meter is { question: SliderQuestion; position: number } => meter.position !== undefined);

  if (answered.length === 0) {
    return null;
  }

  return (
    <PaperCard>
      <BlockHeading>Where they land</BlockHeading>
      <div className="space-y-4">
        {answered.map(({ question, position }) => (
          <Meter key={question.id} question={question} position={position} />
        ))}
      </div>
    </PaperCard>
  );
}

function Meter({ question, position }: { question: SliderQuestion; position: number }) {
  const [low, high] = question.ends;

  return (
    <div>
      <p className="text-sm font-bold text-ink-soft">{question.label}</p>
      <div className="relative my-1 h-2 rounded-chip border border-paper-edge bg-[var(--person-wash)]">
        <span
          style={{ left: `${position}%` }}
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-[var(--person-base)]"
        />
      </div>
      <div className="flex justify-between gap-4 text-xs text-faded">
        <span className="max-w-[45%]">{low}</span>
        <span className="max-w-[45%] text-right">{high}</span>
      </div>
    </div>
  );
}

function positionOf(profile: BlockProps['profile'], questionId: string): number | undefined {
  return profile.submitted
    ? submittedSliderAnswer(profile.answers, questionId)
    : sliderAnswer(profile.answers, questionId);
}
