import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ADMIN_EMAIL, ADMIN_UID } from '@/config/admin';

export type AdminAuthState = {
  /** Undefined until Firebase has restored any existing session. */
  user: User | null | undefined;
  isAdmin: boolean;
};

/** Tracks the signed-in Firebase user and whether it is the admin account. */
export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return { user, isAdmin: user?.uid === ADMIN_UID || user?.email === ADMIN_EMAIL };
}

export async function signInAsAdmin(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export function signOutOfAdmin(): Promise<void> {
  return signOut(auth);
}
