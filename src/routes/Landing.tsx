import { useNavigate } from 'react-router-dom';
import { Button, HandLabel, TornDivider } from '@/components/primitives';
import { useViewer } from '@/state/ViewerContext';

export function Landing() {
  const navigate = useNavigate();
  const { continueAsGuest } = useViewer();

  const enterAsGuest = () => {
    continueAsGuest();
    navigate('/people');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <HandLabel as="h1" size="hero" face="title" glow className="block">
        FriendSlop
      </HandLabel>

      <p className="mx-auto mt-4 max-w-md text-ink-soft">
        Everyone&rsquo;s favourite things, in one place, so nobody has to ask what to get you.
      </p>

      <TornDivider className="my-8" />

      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => navigate('/pick')} className="w-full max-w-xs">
          I&rsquo;m in the group
        </Button>
        <Button variant="quiet" onClick={enterAsGuest} className="w-full max-w-xs">
          Just visiting
        </Button>
      </div>

      <p className="mt-8 text-xs text-faded">
        Fill in your own page and everyone else&rsquo;s unlocks.
      </p>
    </div>
  );
}
