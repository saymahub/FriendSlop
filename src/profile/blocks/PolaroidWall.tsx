import { Polaroid } from '@/components/primitives';
import { BlockHeading } from '../BlockHeading';
import { flowerArt } from '@/assets/registry';
import { pictureOf, textAnswer, topFlower } from '@/lib/answerDisplay';
import type { BlockProps } from '../blockTypes';

const PICKS = [
  { questionId: 'show', caption: 'Show' },
  { questionId: 'movie', caption: 'Film' },
  { questionId: 'book', caption: 'Book' },
  { questionId: 'game', caption: 'Game' },
  { questionId: 'artist', caption: 'On repeat' },
  { questionId: 'anime', caption: 'Anime' },
  { questionId: 'animal', caption: 'Animal' },
  { questionId: 'nextCountry', caption: 'Next trip' },
] as const;

/** Favourites as tilted photo frames: the picture they picked, or the title they typed. */
export function PolaroidWall({ profile }: BlockProps) {
  const flower = topFlower(profile.answers, 'flowers');
  const picks = PICKS.map((pick) => ({
    ...pick,
    value: textAnswer(profile.answers, pick.questionId),
    picture: pictureOf(profile.answers, pick.questionId),
  })).filter(
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
            {pick.picture ? (
              <PictureFill src={pick.picture} title={pick.value} />
            ) : (
              <p className="px-2 text-center text-sm font-bold text-ink-soft">{pick.value}</p>
            )}
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

/** The picked picture fills the frame, with its title kept readable underneath. */
function PictureFill({ src, title }: { src: string; title: string }) {
  return (
    <div className="flex h-full w-full flex-col">
      <img src={src} alt="" className="min-h-0 w-full flex-1 object-cover" />
      <p className="truncate bg-white px-1 pt-1 text-center text-xs font-bold text-ink-soft">{title}</p>
    </div>
  );
}
