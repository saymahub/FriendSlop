import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tapeNames, type TapeName } from '@/assets/registry';
import { Button, HandLabel, Tape } from '@/components/primitives';
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
        You are my friends. (❁´◡`❁)
      </p>

      <TapeRow />

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

const TAPES_IN_ROW = 5;

/** Each strip leans the other way to the last, so the row zigzags. */
const LEAN_DEGREES = 7;

/**
 * Five different washi strips side by side, alternating up and down. The
 * patterns are shuffled once per visit, so the row never repeats a pattern and
 * never reshuffles while someone is looking at it.
 */
function TapeRow() {
  const [patterns] = useState(() => shuffled(tapeNames).slice(0, TAPES_IN_ROW));

  return (
    <div aria-hidden="true" className="my-8 flex justify-center">
      {patterns.map((pattern, index) => (
        <Tape
          key={pattern}
          placement="loose"
          pattern={pattern}
          style={{ rotate: `${index % 2 === 0 ? -LEAN_DEGREES : LEAN_DEGREES}deg` }}
          className="-mx-1 w-1/5 max-w-28"
        />
      ))}
    </div>
  );
}

function shuffled(names: readonly TapeName[]): TapeName[] {
  const copy = [...names];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}
