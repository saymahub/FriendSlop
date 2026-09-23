# FriendSlop

A private scrapbook site where a friend group records their favourite things, so
buying gifts and planning for each other doesn't mean asking. Pick your name, fill
in the questionnaire, and submitting unlocks everyone else's pages.

Vite · React · TypeScript · Tailwind v4 · Firestore · Cloudflare Pages

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
npm run emulators    # local Firebase, in a second terminal
npm run build
npm run typecheck
npm run rules:deploy # publish firestore.rules
```

Copy `.env.example` to `.env.local` and fill in the Firebase web config. Set
`VITE_USE_EMULATORS=true` to work against the local emulators instead of the real
project — a green badge appears when you are.

Seed the roster once from `/admin`, which also holds PIN resets, JSON backups and
the danger zone.

## How it works

**Privacy is enforced by the database, not by React.** Firestore rules are
document-level, so a guest who can read a person's document can read every field
in it. Private answers therefore live in a separate document, `people/{id}/private/data`,
that the rules never serve them. Hiding a field in a component hides it from the
page, not from the network tab.

**A PIN is a Firebase Auth password**, on a synthetic account per card, never a
value this app compares. Identity survives switching phones, and a wrong PIN fails
at the server where it can be rate limited. An admin reset bumps the card's claim
version, which retires the old account without needing the paid plan.

**Four things keep the aesthetic reshapeable:** one theme file of CSS custom
properties, a registry mapping question type to renderer, a profile page defined as
an array of block configs, and an asset registry so components name art rather than
pointing at files.

## Layout

```
src/components/   nine scrapbook primitives, question renderers, app shell
src/config/       questions, swatches, flowers — content as typed data
src/data/         Firestore reads and writes, PIN auth, backups
src/profile/      profile blocks and the array that orders them
src/routes/       screens
firestore.rules   the actual security boundary
```
