import { Polaroid } from '@/components/primitives';
import { BlockHeading } from '../BlockHeading';
import { textAnswer } from '@/lib/answerDisplay';
import type { BlockProps } from '../blockTypes';

const PICKS = [
  { questionId: 'show', caption: 'Show' },
  { questionId: 'movie', caption: 'Film' },
  { questionId: 'book', caption: 'Book' },
  { questionId: 'game', caption: 'Game' },
  { questionId: 'artist', caption: 'On repeat' },
  { questionId: 'character', caption: 'Character' },
] as const;

/** Media picks as tilted photo frames. Real artwork replaces the titles later. */
export function PolaroidWall({ profile }: BlockProps) {
  const picks = PICKS.map((pick) => ({ ...pick, value: textAnswer(profile.answers, pick.questionId) })).filter(
    (pick) => pick.value !== '',
  );

  if (picks.length === 0) {
    return null;
  }

  return (
    <section>
      <BlockHeading>On the wall</BlockHeading>
      <div className="flex flex-wrap justify-center gap-4">
        {picks.map((pick) => (
          <Polaroid key={pick.questionId} caption={pick.caption} tiltSeed={pick.questionId}>
            <p className="px-2 text-center text-sm font-bold text-ink-soft">{pick.value}</p>
          </Polaroid>
        ))}
      </div>
    </section>
  );
}
