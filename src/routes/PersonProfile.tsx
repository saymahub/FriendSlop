import { Link, useParams } from 'react-router-dom';
import { HandLabel, PaperCard } from '@/components/primitives';
import { canSeePrivate, identityOf, loadProfile } from '@/lib/profileData';
import { useAsync } from '@/lib/useAsync';
import { ProfilePage } from '@/profile/ProfilePage';
import { useViewer } from '@/state/ViewerContext';

export function PersonProfile() {
  const { personId = '' } = useParams();
  const { viewer } = useViewer();
  const profile = useAsync(() => loadProfile(personId), [personId]);

  if (profile.status === 'loading') {
    return <p className="py-10 text-center text-ink-soft">Opening the page…</p>;
  }

  if (profile.status === 'failed') {
    return <Missing title="Could not open that" note={profile.message} />;
  }

  if (!profile.value) {
    return <Missing title="No such person" note="That name is not on the roster." />;
  }

  if (!profile.value.hasAnswers) {
    return (
      <Missing
        title={`${identityOf(profile.value.person).name} hasn\u2019t filled theirs in`}
        note="Their page appears here once they do."
      />
    );
  }

  return <ProfilePage profile={profile.value} showPrivate={canSeePrivate(viewer)} />;
}

function Missing({ title, note }: { title: string; note: string }) {
  return (
    <PaperCard tiltSeed={title} className="text-center">
      <HandLabel size="lg">{title}</HandLabel>
      <p className="mt-2 mb-3 text-sm text-ink-soft">{note}</p>
      <Link to="/people" className="text-sm underline underline-offset-2">
        Back to the gang
      </Link>
    </PaperCard>
  );
}
