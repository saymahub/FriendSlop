import { Polaroid } from '@/components/primitives';
import { BlockHeading } from '../BlockHeading';
import { flowerArt } from '@/assets/registry';
import { textAnswer, topFlower } from '@/lib/answerDisplay';
import type { BlockProps } from '../blockTypes';

const PICKS = [
  { questionId: 'show', caption: 'Show' },
  { questionId: 'movie', caption: 'Film' },
  { questionId: 'book', caption: 'Book' },
  { questionId: 'game', caption: 'Game' },
  { questionId: 'artist', caption: 'On repeat' },
  { questionId: 'character', caption: 'Character' },
  { questionId: 'animal', caption: 'Animal' },
  { questionId: 'nextCountry', caption: 'Next trip' },
] as const;

/** Media picks as tilted photo frames. Real artwork replaces the titles later. */
export function PolaroidWall({ profile }: BlockProps) {
  const flower = topFlower(profile.answers, 'flowers');
  const picks = PICKS.map((pick) => ({ ...pick, value: textAnswer(profile.answers, pick.questionId) })).filter(
    (pick) => pick.value !== '',
  );

  if (picks.length === 0 && !flower) {
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
        {flower && (
          <Polaroid caption={flower.name} tiltSeed="flower">
            <img src={flowerArt[flower.id]} alt="" className="h-full w-full object-contain p-3" />
          </Polaroid>
        )}
      </div>
    </section>
  );
}
