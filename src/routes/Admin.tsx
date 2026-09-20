import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { fetchPeople, resetPin, seedRoster, wipeEveryone, type PersonDoc } from '@/data/people';
import {
  clearAllAnswers,
  downloadBackup,
  exportEverything,
  restoreEverything,
  type Backup,
} from '@/data/backup';
import { signInAsAdmin, signOutOfAdmin, useAdminAuth } from '@/state/useAdminAuth';

/**
 * Deliberately plain. The plan keeps the admin tools as boring scannable tables
 * so the scrapbook primitives stay uncontaminated by admin concerns.
 */
export function Admin() {
  const { user, isAdmin } = useAdminAuth();

  if (user === undefined) {
    return <Shell>Checking your session…</Shell>;
  }

  if (!isAdmin) {
    return (
      <Shell>
        <SignInForm signedInAs={user?.email ?? undefined} />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="text-sm text-slate-600">Signed in as {user?.email}</p>
        <button type="button" onClick={signOutOfAdmin} className="text-sm underline">
          Sign out
        </button>
      </div>
      <SeedPanel />
      <DataPanel />
      <DangerZone />
    </Shell>
  );
}

function SignInForm({ signedInAs }: { signedInAs?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await signInAsAdmin(email, password);
    } catch {
      setError('That email and password did not work.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm">
      <h1 className="mb-4 text-xl font-bold">Admin</h1>

      {signedInAs && (
        <p className="mb-3 text-sm text-slate-600">
          Signed in as {signedInAs}, which is not the admin account.{' '}
          <button type="button" onClick={signOutOfAdmin} className="underline">
            Sign out
          </button>
        </p>
      )}

      <label className="mb-3 block">
        <span className="mb-1 block text-sm">Email</span>
        <input
          type="email"
          value={email}
          autoComplete="username"
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-base"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm">Password</span>
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-base"
        />
      </label>

      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

function SeedPanel() {
  const [people, setPeople] = useState<PersonDoc[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (label: string, action: () => Promise<string>) => {
    setBusy(true);
    setStatus(`${label}…`);

    try {
      setStatus(await action());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const load = () =>
    run('Loading', async () => {
      const loaded = await fetchPeople();
      setPeople(loaded);
      return `${loaded.length} people in the database.`;
    });

  /**
   * Retires the account behind the current PIN by bumping the claim version, so
   * the person sets a fresh one next visit. Their answers are untouched.
   */
  const reset = (person: PersonDoc) => {
    const confirmed = window.confirm(
      `Reset ${person.name}'s PIN? Their answers stay, but they will set a new PIN next time they visit.`,
    );

    if (!confirmed) {
      return;
    }

    return run('Resetting', async () => {
      await resetPin(person.id, person.claimVersion);
      setPeople(await fetchPeople());
      return `${person.name} can set a new PIN now.`;
    });
  };

  const seed = () =>
    run('Seeding', async () => {
      const created = await seedRoster();
      setPeople(await fetchPeople());
      return created === 0 ? 'Everyone already existed. Nothing created.' : `Created ${created} people.`;
    });

  return (
    <section>
      <h1 className="mb-4 text-xl font-bold">Roster</h1>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={seed}
          disabled={busy}
          className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
        >
          Seed roster from code
        </button>
        <button
          type="button"
          onClick={load}
          disabled={busy}
          className="rounded border border-slate-300 px-4 py-2 disabled:opacity-50"
        >
          Reload
        </button>
      </div>

      {status && <p className="mb-4 text-sm text-slate-700">{status}</p>}

      {people.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left">
              <th className="py-2 pr-4">Id</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Claimed</th>
              <th className="py-2 pr-4">PIN version</th>
              <th className="py-2 pr-4">Submitted</th>
              <th className="py-2">PIN</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-b border-slate-200">
                <td className="py-2 pr-4 font-mono text-xs">{person.id}</td>
                <td className="py-2 pr-4">{person.name}</td>
                <td className="py-2 pr-4">{person.claimedBy ? 'yes' : 'no'}</td>
                <td className="py-2 pr-4">{person.claimVersion}</td>
                <td className="py-2 pr-4">{person.submittedAt ? 'yes' : 'no'}</td>
                <td className="py-2">
                  <button
                    type="button"
                    disabled={busy || !person.claimedBy}
                    onClick={() => reset(person)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    Reset PIN
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/** Export, restore and clearing answers: the whole safety net on the free plan. */
function DataPanel() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (working: string, action: () => Promise<string>) => {
    setBusy(true);
    setStatus(working);

    try {
      setStatus(await action());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const download = () =>
    run('Exporting…', async () => {
      const backup = await exportEverything();
      downloadBackup(backup);
      return `Exported ${backup.people.length} people.`;
    });

  const restore = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !window.confirm('Restore this backup? It overwrites everyone currently in the database.')) {
      return;
    }

    return run('Restoring…', async () => {
      const backup = JSON.parse(await file.text()) as Backup;
      const restored = await restoreEverything(backup);
      return `Restored ${restored} people from ${file.name}.`;
    });
  };

  const clear = () => {
    if (!window.confirm('Empty everyone’s answers? The roster and PINs stay, the answers go.')) {
      return;
    }

    return run('Clearing…', async () => `Cleared answers for ${await clearAllAnswers()} people.`);
  };

  return (
    <section className="mt-10">
      <h2 className="mb-2 text-lg font-bold">Data</h2>
      <p className="mb-3 text-sm text-slate-700">
        The free plan has no automatic backups. Download one before anything risky.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
        >
          Download backup
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="rounded border border-slate-300 px-4 py-2 disabled:opacity-50"
        >
          Restore from file
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={busy}
          className="rounded border border-slate-300 px-4 py-2 disabled:opacity-50"
        >
          Clear all answers
        </button>
        <input ref={fileInput} type="file" accept="application/json" onChange={restore} className="hidden" />
      </div>

      {status && <p className="mt-3 text-sm text-slate-800">{status}</p>}
    </section>
  );
}

/**
 * Clearing test data before the real roster goes in. Typing the word is
 * deliberate friction: there is no backup on the free plan, so a mistaken click
 * here is not recoverable.
 */
function DangerZone() {
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const wipe = async () => {
    setBusy(true);
    setStatus('Deleting…');

    try {
      const removed = await wipeEveryone();
      setConfirmation('');
      setStatus(`Deleted ${removed} people and every claim. Seed again to start over.`);
    } catch {
      setStatus('Could not delete. Check you are still signed in as the admin.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-12 rounded border border-red-300 bg-red-50 p-4">
      <h2 className="mb-2 font-bold text-red-800">Danger zone</h2>
      <p className="mb-3 text-sm text-slate-700">
        Deletes every person, their answers and every claim. There is no backup on the free plan, so
        this cannot be undone. Afterwards, delete the leftover test accounts in Firebase console
        under Authentication &rarr; Users, or those names will refuse a new PIN.
      </p>

      <label className="mb-3 block max-w-xs">
        <span className="mb-1 block text-sm">Type DELETE to enable</span>
        <input
          type="text"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-base"
        />
      </label>

      <button
        type="button"
        onClick={wipe}
        disabled={busy || confirmation !== 'DELETE'}
        className="rounded bg-red-700 px-4 py-2 text-white disabled:opacity-40"
      >
        Delete everything
      </button>

      {status && <p className="mt-3 text-sm text-slate-800">{status}</p>}
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl bg-white p-6 font-sans text-slate-900">{children}</main>;
}
