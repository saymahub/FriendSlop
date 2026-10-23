# FriendSlop

A private scrapbook site where a friend group records their favourite things, so
buying gifts and planning for each other doesn't mean asking. Pick your name, fill
in the questionnaire, and submitting unlocks everyone else's pages and the group stats.

Vite · React · TypeScript · Tailwind v4 · Firestore · Cloudflare Pages

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
npm run emulators    # local Firebase (needs JDK 21+), in a second terminal
npm run rules:deploy # publish firestore.rules
```

Copy `.env.example` to `.env.local` and fill in every key, or the page stays blank.
`VITE_USE_EMULATORS=true` works against the local emulators instead of real data.

## The roster

Real names live in the gitignored `src/config/names.local.json`, mapping each id in
`roster.ts` to a name. **Seed roster from code** in `/admin` writes them to Firestore;
it only adds new ids and never updates or removes anyone.

## Deploying

Cloudflare Pages builds `main` with `npm run build` into `dist`. Set the six
`VITE_FIREBASE_*` keys and `NODE_VERSION = 22` as build variables, and add the site's
address to Firebase's authorized domains.

## Layout

```text
src/assets/       art, and the registry components name it through
src/components/   scrapbook primitives, question renderers, app shell
src/config/       questions, swatches, flowers, roster
src/data/         Firestore reads and writes, PIN auth, backups
src/lib/          answer helpers, picture and song search, stats maths
src/profile/      profile blocks
src/routes/       screens
firestore.rules   the actual security boundary
```
