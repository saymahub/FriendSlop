import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon } from '@/components/icons';
import { Button, HandLabel } from '@/components/primitives';
import { swatches } from '@/config/swatches';
import { fetchPeople, claimPerson, type PersonDoc } from '@/data/people';
import { writeClaim } from '@/data/claims';
import { PIN_LENGTH, PinError, setPin, signInWithPin } from '@/data/pinAuth';
import { identityOf } from '@/lib/profileData';
import { tiltFor } from '@/lib/tilt';
import { useAsync } from '@/lib/useAsync';
import { useViewer } from '@/state/ViewerContext';

export function NamePicker() {
  const people = useAsync(fetchPeople, []);
  const [chosen, setChosen] = useState<PersonDoc | undefined>(undefined);

  if (people.status === 'loading') {
    return <Centred>Loading the gang…</Centred>;
  }

  if (people.status === 'failed') {
    return <Centred>{people.message}</Centred>;
  }

  if (chosen) {
    return <PinStep person={chosen} onBack={() => setChosen(undefined)} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <HandLabel as="h1" size="hero" face="title" className="block text-center">
        Which one are you?
      </HandLabel>
      <p className="mt-2 text-center text-sm text-ink-soft">
        You pick a {PIN_LENGTH}-digit PIN, so you can carry on from any phone or laptop.
      </p>
      <p className="mt-2 mb-8 text-center">
        <Link to="/landing" className="text-xs text-faded underline underline-offset-2">
          Back
        </Link>
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {people.value.map((person, index) => {
          const identity = identityOf(person);

          return (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => setChosen(person)}
                style={{ rotate: tiltFor(index), backgroundColor: swatches[person.colour].wash }}
                className="flex min-h-28 w-full flex-col items-center justify-center gap-1 rounded-card border-2 border-paper-edge p-3 shadow-lift transition-transform active:translate-y-px"
              >
                <span aria-hidden="true" className="text-2xl">
                  {identity.emoji}
                </span>
                <HandLabel size="md">{identity.name}</HandLabel>
                {person.claimedBy && <span className="text-xs text-faded">has a PIN</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type PinStepProps = { person: PersonDoc; onBack: () => void };

/**
 * A card with no owner needs a PIN choosing; one already claimed needs the PIN
 * entering. Firebase checks it, so a wrong PIN fails at the server rather than
 * in a comparison this bundle could be edited to skip.
 */
function PinStep({ person, onBack }: PinStepProps) {
  const navigate = useNavigate();
  const { onClaimed } = useViewer();
  const [pin, setPinValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const isNew = person.claimedBy === null;
  const identity = identityOf(person);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const credential = isNew
        ? await setPin(person.id, person.claimVersion, pin)
        : await signInWithPin(person.id, person.claimVersion, pin);

      const uid = credential.user.uid;

      if (isNew) {
        await claimPerson(person.id, uid);
      }

      await writeClaim(uid, { personId: person.id, submitted: person.submittedAt !== null });
      onClaimed(person.id, uid, person.submittedAt !== null);
      navigate('/me');
    } catch (caught) {
      setError(caught instanceof PinError ? caught.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-12 text-center">
      <span aria-hidden="true" className="text-4xl">
        {identity.emoji}
      </span>
      <HandLabel as="h1" size="xl" face="title" className="mt-2 block">
        {identity.name}
      </HandLabel>

      <p className="mt-2 mb-6 text-sm text-ink-soft">
        {isNew
          ? `Pick a ${PIN_LENGTH}-digit PIN. You will need it to get back in from another device.`
          : `Enter your ${PIN_LENGTH}-digit PIN.`}
      </p>

      <form onSubmit={submit}>
        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            maxLength={PIN_LENGTH}
            aria-label={`${PIN_LENGTH}-digit PIN`}
            onChange={(event) => setPinValue(event.target.value.replace(/\D/g, ''))}
            className="w-full rounded-card border-2 border-paper-edge bg-paper px-12 py-3 text-center text-2xl tracking-[0.5em]"
          />
          {/* Only while choosing a PIN: seeing it once guards against a typo they could not get back past. */}
          {isNew && (
            <button
              type="button"
              onClick={() => setShowPin((shown) => !shown)}
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              aria-pressed={showPin}
              className="absolute inset-y-0 right-1 flex min-w-11 items-center justify-center text-faded hover:text-ink"
            >
              <EyeIcon crossed={showPin} />
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-allergy">{error}</p>}

        <div className="mt-5 flex flex-col gap-2">
          <Button type="submit" disabled={busy || pin.length !== PIN_LENGTH}>
            {busy ? 'One moment…' : isNew ? 'Set my PIN' : 'Let me in'}
          </Button>
          <button type="button" onClick={onBack} className="min-h-11 text-sm text-faded underline">
            That is not me
          </button>
        </div>
      </form>

      {!isNew && (
        <p className="mt-6 text-xs text-faded">
          Forgotten it? YOU IDIOT! Ask the admin to reset your PIN, then you can set a new one.
        </p>
      )}
    </div>
  );
}

function Centred({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-16 text-center text-ink-soft">{children}</p>;
}
