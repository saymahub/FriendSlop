import { swatches, swatchVariables, type SwatchId } from '@/config/swatches';
import { songAnswer } from '@/lib/answerDisplay';
import { identityOf, type Profile } from '@/lib/profileData';
import { useSongOnPage } from '@/state/MusicContext';
import { profileBlocks } from './profileBlocks';

type ProfilePageProps = {
  profile: Profile;
  showPrivate: boolean;
};

/**
 * One component for every profile, whoever is looking. The viewer only changes
 * which blocks are drawn, never which page they are on.
 */
export function ProfilePage({ profile, showPrivate }: ProfilePageProps) {
  const visible = profileBlocks.filter((block) => showPrivate || !block.privateOnly);
  const theme = themeFor(profile);
  useSongOnPage(songAnswer(profile.answers, 'signatureSong'), identityOf(profile.person).name, theme);

  return (
    <article style={swatchVariables(theme)} className="flex flex-col gap-8">
      {visible.map(({ id, Component }) => (
        <Component key={id} profile={profile} showPrivate={showPrivate} />
      ))}
    </article>
  );
}

/** Their first favourite colour, falling back to the one set on the roster. */
function themeFor(profile: Profile): SwatchId {
  const loved = profile.answers.coloursLoved;
  const first = Array.isArray(loved) ? (loved[0] as SwatchId) : undefined;

  return first !== undefined && first in swatches ? first : profile.person.colour;
}
