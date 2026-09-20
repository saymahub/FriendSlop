import { Link, useNavigate } from 'react-router-dom';
import { Button, HandLabel, PaperCard } from '@/components/primitives';
import { canSeePrivate, loadProfile } from '@/lib/profileData';
import { useAsync } from '@/lib/useAsync';
import { ProfilePage } from '@/profile/ProfilePage';
import { useViewer } from '@/state/ViewerContext';

export function MyProfile() {
  const navigate = useNavigate();
  const { viewer } = useViewer();
  const personId = viewer.kind === 'member' ? viewer.personId : '';
  const profile = useAsync(() => loadProfile(personId), [personId]);

  if (profile.status === 'loading') {
    return <Note>Fetching your page…</Note>;
  }

  if (profile.status === 'failed') {
    return <Note>{profile.message}</Note>;
  }

  if (!profile.value || !profile.value.hasAnswers) {
    return <NotFilledInYet onStart={() => navigate('/me/edit')} />;
  }

  return (
    <div>
      <ProfilePage profile={profile.value} showPrivate={canSeePrivate(viewer)} />

      <div className="mt-8 text-center">
        <Link to="/me/edit">
          <Button variant="quiet">Edit my answers</Button>
        </Link>
      </div>
    </div>
  );
}

function NotFilledInYet({ onStart }: { onStart: () => void }) {
  return (
    <PaperCard tiltSeed="empty" className="text-center">
      <HandLabel size="lg">Your page is blank so far.</HandLabel>
      <p className="mt-2 mb-4 text-sm text-ink-soft">
        Fill it in and everyone else&rsquo;s opens up at the same time.
      </p>
      <Button onClick={onStart}>Start my page</Button>
    </PaperCard>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-ink-soft">{children}</p>;
}
