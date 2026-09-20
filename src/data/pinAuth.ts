import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * A person's PIN is a Firebase Auth password, never a value this app compares.
 *
 * Each card maps to a synthetic account whose address carries the claim version.
 * An admin PIN reset bumps that version, which retires the old account without
 * needing the Admin SDK: the new address simply has no password set yet.
 */

export const PIN_LENGTH = 6;

const PIN_DOMAIN = 'meetthegang.invalid';

export class PinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PinError';
  }
}

export function accountEmail(personId: string, claimVersion: number): string {
  return `${personId}.${claimVersion}@${PIN_DOMAIN}`;
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/** Creates the account behind a card nobody has claimed yet. */
export async function setPin(personId: string, claimVersion: number, pin: string): Promise<UserCredential> {
  assertValidPin(pin);

  try {
    return await createUserWithEmailAndPassword(auth, accountEmail(personId, claimVersion), pin);
  } catch (error) {
    throw new PinError(describeSetFailure(error));
  }
}

export async function signInWithPin(
  personId: string,
  claimVersion: number,
  pin: string,
): Promise<UserCredential> {
  assertValidPin(pin);

  try {
    return await signInWithEmailAndPassword(auth, accountEmail(personId, claimVersion), pin);
  } catch (error) {
    throw new PinError(describeSignInFailure(error));
  }
}

export function signOutOfCard(): Promise<void> {
  return signOut(auth);
}

function assertValidPin(pin: string): void {
  if (!isValidPin(pin)) {
    throw new PinError(`Your PIN needs to be ${PIN_LENGTH} digits.`);
  }
}

function describeSetFailure(error: unknown): string {
  if (codeOf(error) === 'auth/email-already-in-use') {
    return 'Someone has already set a PIN for this name. Ask the admin to reset it.';
  }

  return 'Could not set that PIN. Check your connection and try again.';
}

function describeSignInFailure(error: unknown): string {
  switch (codeOf(error)) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That PIN is not right.';
    case 'auth/too-many-requests':
      return 'Too many tries. Wait a minute and try again.';
    default:
      return 'Could not sign you in. Check your connection and try again.';
  }
}

function codeOf(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
}
