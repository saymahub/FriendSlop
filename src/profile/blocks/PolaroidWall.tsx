import type { CSSProperties } from 'react';
import { Polaroid } from '@/components/primitives';
import { BlockHeading } from '../BlockHeading';
import { flowerArt } from '@/assets/registry';
import { chosenFlowers, pictureOf, textAnswer } from '@/lib/answerDisplay';
import type { Flower } from '@/config/flowers';
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
  const bouquet = chosenFlowers(profile.answers, 'flowers').filter((flower) => flower.id in flowerArt);
  const picks = PICKS.map((pick) => ({
    ...pick,
    value: textAnswer(profile.answers, pick.questionId),
    picture: pictureOf(profile.answers, pick.questionId),
  })).filter(
    (pick) => pick.value !== '',
  );

  if (picks.length === 0 && bouquet.length === 0) {
    return null;
  }

  return (
    <section>
      <BlockHeading>My picks</BlockHeading>
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
        {bouquet.length > 0 && (
          <Polaroid caption={namesOf(bouquet)} tiltSeed="flower">
            <Bouquet flowers={bouquet} />
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

/**
 * Where each flower sits in the frame, by how many were picked. Two lean apart
 * and overlap in the middle; three make a triangle, the first pick on top and in
 * front. Positions are percentages of the frame, so they hold at any size.
 */
const ARRANGEMENTS: Record<number, CSSProperties[]> = {
  1: [{ inset: '6%', width: '88%' }],
  2: [
    { left: '3%', top: '20%', width: '60%', rotate: '-7deg' },
    { right: '3%', top: '20%', width: '60%', rotate: '7deg' },
  ],
  3: [
    { left: '23%', top: '3%', width: '54%', zIndex: 1 },
    { left: '3%', bottom: '3%', width: '54%', rotate: '-9deg' },
    { right: '3%', bottom: '3%', width: '54%', rotate: '9deg' },
  ],
};

function Bouquet({ flowers }: { flowers: Flower[] }) {
  const spots = ARRANGEMENTS[flowers.length] ?? ARRANGEMENTS[1];

  return (
    <div className="relative h-full w-full">
      {flowers.slice(0, spots.length).map((flower, index) => (
        <img
          key={flower.id}
          src={flowerArt[flower.id]}
          alt=""
          style={spots[index]}
          className="absolute aspect-square object-contain"
        />
      ))}
    </div>
  );
}

/** "Rose", "Rose & Tulip", "Rose, Tulip & Daisy". */
function namesOf(flowers: Flower[]): string {
  const names = flowers.map((flower) => flower.name);
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}
