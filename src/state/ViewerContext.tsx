import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ADMIN_EMAIL, ADMIN_UID } from '@/config/admin';
import { fetchClaim, writeClaim } from '@/data/claims';
import { signOutOfCard } from '@/data/pinAuth';
import { clearStored, readStored, writeStored } from '@/lib/storage';

/**
 * Who is looking at the site.
 *
 * A member is whoever Firebase Auth says they are: signing in with a PIN is a
 * real password check, and the claim document says which card that account owns.
 * Guests never sign in, so that choice is only a local preference.
 */
export type Viewer =
  | { kind: 'loading' }
  | { kind: 'unknown' }
  | { kind: 'member'; personId: string; submitted: boolean; uid: string }
  | { kind: 'guest' }
  | { kind: 'admin' };

type ViewerContextValue = {
  viewer: Viewer;
  onClaimed: (personId: string, uid: string, submitted: boolean) => void;
  releaseName: () => Promise<void>;
  markSubmitted: () => Promise<void>;
  continueAsGuest: () => void;
};

const GUEST_KEY = 'meet-the-gang:guest';

const ViewerContext = createContext<ViewerContextValue | undefined>(undefined);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<Viewer>({ kind: 'loading' });

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setViewer(readStored(GUEST_KEY, false) ? { kind: 'guest' } : { kind: 'unknown' });
          return;
        }

        if (user.uid === ADMIN_UID || user.email === ADMIN_EMAIL) {
          setViewer({ kind: 'admin' });
          return;
        }

        const claim = await fetchClaim(user.uid);

        setViewer(
          claim
            ? { kind: 'member', personId: claim.personId, submitted: claim.submitted, uid: user.uid }
            : { kind: 'unknown' },
        );
      }),
    [],
  );

  const onClaimed = useCallback((personId: string, uid: string, submitted: boolean) => {
    clearStored(GUEST_KEY);
    setViewer({ kind: 'member', personId, submitted, uid });
  }, []);

  const continueAsGuest = useCallback(() => {
    writeStored(GUEST_KEY, true);
    setViewer({ kind: 'guest' });
  }, []);

  const releaseName = useCallback(async () => {
    clearStored(GUEST_KEY);
    await signOutOfCard();
    setViewer({ kind: 'unknown' });
  }, []);

  /** Records the hand-in on the claim, which is what the vault rule reads. */
  const markSubmitted = useCallback(async () => {
    if (viewer.kind !== 'member' || viewer.submitted) {
      return;
    }

    await writeClaim(viewer.uid, { personId: viewer.personId, submitted: true });
    setViewer({ ...viewer, submitted: true });
  }, [viewer]);

  const value = useMemo(
    () => ({ viewer, onClaimed, releaseName, markSubmitted, continueAsGuest }),
    [viewer, onClaimed, releaseName, markSubmitted, continueAsGuest],
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer(): ViewerContextValue {
  const context = useContext(ViewerContext);

  if (!context) {
    throw new Error('useViewer must be used inside a ViewerProvider');
  }

  return context;
}
