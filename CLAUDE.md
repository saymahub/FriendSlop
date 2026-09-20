# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A private scrapbook site where a friend group (~20 people) records their favourite
things, so gift-buying and planning doesn't require asking. No accounts: you pick your
name from a grid, fill out a 47-question form, and submitting unlocks the vault of
everyone else's profiles. That gate is the core mechanic, not a nicety.

Full design document: `planning/friend-scrapbook-plan.md` (gitignored, local only).
It is the source of truth for scope, question list, and build order — read it before
making architectural decisions, and update it when a decision changes.

## Hard rules

- **YOU MUST NOT commit or push without explicit user request.**
- **YOU MUST NOT add `Co-Authored-By: Claude`** to any commit message.
- Always activate `.venv` before running Python scripts (check `venv/`, `.venv/`, `env/`).
- Internal links use **relative paths** (e.g. `01-slash-commands/README.md`); anchors use `#heading-name`.
- Code fences **must** declare a language (`bash`, `python`, `json`, …) — the cross-reference check fails otherwise.
- External URLs must be reachable and stable. No ephemeral links.
- Mermaid diagrams must parse (validated pre-commit, and only when `mmdc` is installed — the check skips with a warning otherwise). A broken EPUB build is usually invalid Mermaid or a missing/failing `mmdc`.
- Commit format: `type(scope): subject` where `scope` is the feature area (e.g. `feat(questionnaire):`, `feat(primitives):`, `feat(admin):`, `fix(swatches):`).
- Do not reorganize the `01-`–`10-` numbering. The order is the curriculum.

## Token efficiency
- Never re-read files you just wrote or edited. You know the contents.
- Never re-run commands to "verify" unless the outcome was uncertain.
- Don't echo back large blocks of code or file contents unless asked.
- Batch related edits into single operations. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." Just do it.
- If a task needs 1 tool call, don't use 3. Plan before acting.
- Do not summarize what you just did unless the result is ambiguous or you need additional input.

## Status

Step 1 of the build order is done: scaffold, theme file, the nine primitives, the 24
swatches and the 43 questions, reviewable at `src/routes/StyleGuide.tsx`, which is
currently the whole app. No router, no Firestore, no auth yet.

Stack in place: Vite 7 + React 19 + TypeScript + Tailwind v4. Still to add per the
plan: React Router, Framer Motion, Recharts, canvas-confetti, Firestore. Hosting is
Cloudflare Pages.

## Commands

```bash
npm run dev        # Vite dev server on :5173
npm run build      # tsc -b then vite build
npm run typecheck  # types only, no emit
npm run preview    # serve the production build
```

## Architecture

### Privacy is enforced at the database, not in React

Firestore rules are document-level: if a guest can read a person's document, they can
read every field in it regardless of what the UI renders. Client-side filtering hides
private answers from the page, not from the network tab. So the document is **split** —
public answers in `people/{id}`, private answers in `people/{id}/private/data`.

Never "protect" a private field by omitting it from a component. If it must be hidden
from guests, it belongs in the private subdocument.

### Claiming is a PIN, and the PIN is a Firebase Auth password

The group shares phones and switches between phone and laptop, so identity must be
portable — a device-bound anonymous-auth claim cannot do that. Each person has a
synthetic account `{personId}.{claimVersion}@meetthegang.invalid` whose password is
their 6-digit PIN. Firebase verifies it server-side; nothing in the bundle decides
whether a PIN was correct.

Never check a PIN in client code, and never store one in Firestore. Admin reset works
by bumping `claimVersion` and clearing `claimedBy`, which retires the old account and
lets the person set a fresh PIN — the Admin SDK route would need Cloud Functions and
the Blaze plan.

The vault gate works the same way. Anonymous auth gives every visitor a uid; claiming a
name writes a reverse-index doc `claims/{uid}` = `{ personId, submitted }` so rules can
`get()` a known path (queries aren't allowed in rules). Admin access is a single
Firebase Auth email/password account checked by `isAdmin()` in rules — never a
passphrase compared in client code, since anything in the bundle is public.

### Questions live in code, answers are a flat map

The 47 questions are a typed config array in `questions.ts`. A person's `answers` is a
flat `Record<string, unknown>` keyed by question id, so adding or reordering a question
never needs a data migration. The admin panel can toggle questions live via a
`settings/config` overrides document merged over the code config — the code array stays
the base, overrides only enable/disable and reorder.

### Four modularity decisions

These exist so the aesthetic can be reshaped without hunting through components. Respect
them; breaking one tends to be invisible until the whole thing needs rework.

1. **One theme file.** Every colour, radius, border weight, font and texture is a token
   in the `@theme` block of `src/index.css`. Tailwind v4 is CSS-first, so there is no
   `tailwind.config.ts` — that file existing again would mean the theme had been split
   in two. Components use only semantic classes (`bg-paper`, `border-ink`, `text-faded`)
   — no raw hex, ever. The exception is a person's chosen swatch, which arrives at
   runtime as `--person-base` / `--person-ink` / `--person-wash`.
2. **Question renderer registry.** `Record<QuestionType, FC<QuestionProps>>`. Every
   renderer takes the same `(question, value, onChange)` props and is interchangeable.
   A new question type is one file plus one line in the registry.
3. **Block-based profile layout.** The profile page is an array of block configs, not
   hardcoded JSX. Reordering or hiding a section is editing that array.
4. **Asset registry.** One file imports all art and exports it by name. Components take
   a name (`<Sticker name="star" />`), never a path or a file extension, so a given asset
   can switch between SVG and WebP with nothing downstream caring.

### Nine UI primitives

Everything composes from `PaperCard`, `Tape`, `Sticker`, `Polaroid`, `Chip`, `Stamp`,
`HandLabel`, `TornDivider`, `Button`. Build new screens from these before adding a tenth.

The admin panel is the deliberate exception: plain, scannable tables, no paper texture or
tilt. Keeping admin out of the scrapbook primitives keeps both clean.

### Colour swatches are curated, not a colour picker

24 named swatches, each a `{ base, ink, wash }` triple. Free colour picking would make
"most popular colour" uncomputable across 20 people and lets someone pick a near-white
that breaks their profile theme. A person's first favourite colour becomes their profile
theme — the profile route sets the triple as three CSS variables at its root and children
inherit.

### Music player lives above the router

One `<audio>` element at the app root, driven by context. Inside a routed component it
unmounts on navigation and restarts the track. No autoplay (browsers block it), mute via
`audio.muted` rather than `volume = 0` so it doesn't clobber the fade logic.

Song search uses the **iTunes Search API via JSONP** — no key, no backend. Spotify was
ruled out: server-side client secret required, and `preview_url` is deprecated.

## Conventions

- Mobile-first. Most people will fill this out on their phone. Concretely, that means:
  interactive targets are at least 44px tall (`min-h-11`); text inputs are at least 16px
  or iOS zooms the page on focus; grids go 4 across on a phone and 6 from `sm:` up; and
  nothing may scroll horizontally at 320px wide.
- Every text field gets a placeholder showing a real example answer, never "e.g.".
- Sliders get labelled ends, not numbers.
- Every multi-select gets an "other" option; every private question gets an explicit
  "prefer not to say" that stores a deliberate null.
- Swatch and chip names are always visible, not hover-only — there's no hover on touch,
  and colour alone can't carry meaning for colourblind users.
- Decorative art is `pointer-events-none`; motion is gated behind `prefers-reduced-motion`.
- Committed artwork is cleaned and resized to 2x display size, WebP at 80%. Raw scans and
  phone photos stay in the gitignored `art-raw/`. Total art budget: under 3 MB.

## Code standards

Core philosophy: **code is read 10x more than written — optimize for readability and
maintainability, not cleverness.** These rules apply to every change in this repository.

### Meaningful names
- Use intention-revealing names that explain why something exists
- Avoid disinformation and meaningless distinctions (`data`, `info`, `manager`)
- Use pronounceable, searchable names
- Class names are nouns (`UserAccount`, `PaymentProcessor`)
- Method names are verbs (`calculateTotal`, `sendEmail`)
- Avoid mental mapping and encodings (Hungarian notation, prefixes)

### Functions
- Keep functions small (under 20 lines ideal)
- Do one thing only — Single Responsibility Principle
- One level of abstraction per function
- Limit arguments: 0–2 ideal, 3 maximum, avoid flag arguments
- No side effects — a function should do what its name says
- Separate commands (change state) from queries (return info)
- Prefer exceptions over error codes

### Comments
- Code should be self-explanatory — avoid comments when possible
- Good comments: legal info, warnings, TODOs, public API documentation
- Bad comments: redundant, misleading, or explaining bad code
- Never comment out code — delete it, version control preserves history
- If you need a comment, consider refactoring the code instead

### Formatting
- Keep files small and focused
- Vertical formatting: related concepts close together, blank lines separate concepts
- Horizontal formatting: limit line length (80–120 characters)
- Use consistent indentation and team style
- Group related functions together

### Objects and data structures
- Objects: hide data behind abstractions, expose behaviour through methods
- Data structures: expose data, have minimal behaviour
- Law of Demeter: only talk to immediate friends, avoid `a.getB().getC().doSomething()`
- Don't expose internal structure through getters/setters blindly

### Error handling
- Use exceptions, not return codes or error flags
- Write `try-catch-finally` first when code might fail
- Provide context in exception messages
- Don't return `null` — return empty collections or use Optional/Maybe
- Don't pass `null` as arguments

### Classes
- Small classes, measured by responsibilities rather than lines
- Single Responsibility Principle: one reason to change
- High cohesion: class variables used by many methods
- Low coupling: minimal dependencies between classes
- Open/Closed Principle: open for extension, closed for modification

_In this codebase the unit is a component, hook or module rather than a class; apply
these to those. A component with two reasons to change gets split._

### Unit tests
- Fast, Independent, Repeatable, Self-validating, Timely (F.I.R.S.T.)
- One assert per test, or one concept
- Test code quality equals production code quality
- Readable test names that describe what's being tested
- Arrange–Act–Assert pattern

### Code quality principles
- **DRY** (Don't Repeat Yourself): no duplication
- **YAGNI** (You Aren't Gonna Need It): don't build for hypothetical futures
- **KISS** (Keep It Simple): avoid unnecessary complexity
- **Boy Scout Rule**: leave code cleaner than you found it

### Code smells to avoid
- Long functions or classes
- Duplicate code
- Dead code (unused variables, functions, parameters)
- Feature envy (a method more interested in another class)
- Inappropriate intimacy (units knowing too much about each other)
- Long parameter lists
- Primitive obsession (overusing primitives instead of small objects)
- Switch/case statements — consider polymorphism
- Temporary fields (variables only used sometimes)

_The question renderer registry is the sanctioned answer to the switch/case smell here:
map question type to component, don't branch on type._

### System design
- Separate construction from use (dependency injection)
- Use factories and builders for complex object creation
- Program to interfaces, not implementations
- Favour composition over inheritance
- Apply design patterns when they simplify, not to show off

### Refactoring
- Refactor continuously, not in big batches
- Always have passing tests before and after
- Small steps: one change at a time
- Common refactorings: Extract Method, Rename, Move, Inline

### Documentation
- Self-documenting code > comments > external docs
- Public APIs need clear documentation
- Include examples in documentation
- Keep docs close to code, ideally in code
