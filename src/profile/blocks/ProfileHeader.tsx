import { HandLabel, Stamp } from '@/components/primitives';
import { chosenSwatches, textAnswer } from '@/lib/answerDisplay';
import { identityOf } from '@/lib/profileData';
import type { BlockProps } from '../blockTypes';

export function ProfileHeader({ profile }: BlockProps) {
  const { answers } = profile;
  const { name, emoji } = identityOf(profile.person);
  const tagline = textAnswer(answers, 'oneSentence');
  const colours = chosenSwatches(answers, 'coloursLoved');

  return (
    <header className="flex flex-col items-center text-center">
      <span aria-hidden="true" className="text-4xl">
        {emoji}
      </span>

      <HandLabel as="h1" size="hero" face="title" glow className="mt-1 block">
        {name}
      </HandLabel>

      {tagline && <p className="mt-2 max-w-md text-ink-soft">{tagline}</p>}

      {colours.length > 0 && (
        <ul className="mt-4 flex gap-2" aria-label="Signature colours">
          {colours.map((swatch) => (
            <li
              key={swatch.name}
              title={swatch.name}
              style={{ backgroundColor: swatch.base }}
              className="h-7 w-7 rounded-full border-2 border-ink/20"
            />
          ))}
        </ul>
      )}

      <div className="mt-4">
        <CompletionStamp profile={profile} />
      </div>
    </header>
  );
}

/**
 * Says plainly whether the page is finished. A part-filled page that claimed to
 * be complete would make the stamp worthless on every other page too.
 */
function CompletionStamp({ profile }: { profile: BlockProps['profile'] }) {
  return profile.complete ? (
    <Stamp label="Completed" tone="done" />
  ) : (
    <Stamp label="Incomplete" tone="muted" />
  );
}
