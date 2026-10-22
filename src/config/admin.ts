/**
 * The admin account's uid.
 *
 * Duplicated from `firestore.rules`, which is the copy that actually enforces
 * anything — this one only decides whether to draw the admin tools. Change both
 * together, or the panel will offer buttons the database refuses.
 */
export const ADMIN_UID = 'dr1jtAR1iJVrWmPU4xkMvCodGQK2';

/**
 * Matched as well as the uid, because an admin account created in the emulator
 * gets a different uid than the real one.
 */
export const ADMIN_EMAIL = 'saymadevelops@gmail.com';
