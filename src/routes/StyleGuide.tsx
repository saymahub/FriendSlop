import { useState } from 'react';
import {
  Button,
  Chip,
  HandLabel,
  PaperCard,
  Polaroid,
  Stamp,
  Sticker,
  Tape,
  TornDivider,
} from '@/components/primitives';
import { swatches, swatchIds, swatchVariables, type SwatchId } from '@/config/swatches';
import { questions, questionsInSection, sections } from '@/config/questions';

/** A review page for step 1. It ships nothing; it only shows what exists. */
export function StyleGuide() {
  const [theme, setTheme] = useState<SwatchId>('marigold');

  return (
    <main style={swatchVariables(theme)} className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-10 text-center">
        <HandLabel as="h1" size="hero" face="title" className="block">
          Meet the Gang
        </HandLabel>
        <p className="mt-2 text-sm text-faded">
          Step 1 review: theme tokens, 24 swatches, nine primitives, {questions.length} questions.
        </p>
      </header>

      <SwatchGallery current={theme} onChange={setTheme} />
      <PrimitiveGallery />
      <QuestionSummary />
    </main>
  );
}

type SwatchGalleryProps = { current: SwatchId; onChange: (id: SwatchId) => void };

/**
 * A rehearsal for the real SwatchGrid renderer: the chip itself is the control,
 * four across on a phone and six on a wider screen, with the name always shown
 * underneath rather than on hover.
 */
function SwatchGallery({ current, onChange }: SwatchGalleryProps) {
  return (
    <Panel title="The 24 swatches">
      <p className="mb-3 text-sm text-ink-soft">
        Tap one to theme the page, the way a person&rsquo;s first favourite colour themes theirs.
      </p>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {swatchIds.map((id) => (
          <SwatchTile key={id} id={id} selected={id === current} onSelect={onChange} />
        ))}
      </div>
    </Panel>
  );
}

type SwatchTileProps = { id: SwatchId; selected: boolean; onSelect: (id: SwatchId) => void };

function SwatchTile({ id, selected, onSelect }: SwatchTileProps) {
  const swatch = swatches[id];
  const ring = selected ? 'border-ink shadow-lift' : 'border-paper-edge';

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={`overflow-hidden rounded-card border-2 text-left transition-shadow ${ring}`}
    >
      <span
        style={{ backgroundColor: swatch.base, color: swatch.ink }}
        className="flex h-16 items-end justify-end p-1 text-[10px] font-bold"
      >
        {selected ? 'Aa ✓' : 'Aa'}
      </span>
      <span style={{ backgroundColor: swatch.wash }} className="block h-2" />
      <span className="block bg-paper px-1 py-1.5 text-center text-xs font-bold text-ink-soft">{swatch.name}</span>
    </button>
  );
}

function PrimitiveGallery() {
  return (
    <Panel title="The nine primitives">
      <div className="flex flex-wrap items-start gap-6">
        <PaperCard tiltSeed="card" className="w-56">
          <Tape placement="top-centre" />
          <HandLabel size="lg">PaperCard</HandLabel>
          <p className="mt-1 text-sm text-ink-soft">Tape, tilt and a torn edge below.</p>
          <TornDivider className="mt-3" />
        </PaperCard>

        <Polaroid caption="Spirited Away">
          <Sticker name="flower" size={64} />
        </Polaroid>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Chip label="Cottagecore" selected badge={1} onClick={() => undefined} />
            <Chip label="Vintage" onClick={() => undefined} />
            <Chip label="Read only" />
          </div>
          <div className="flex items-center gap-3">
            <Stamp label="Submitted" detail="19 Sep 2026" />
            <Sticker name="star" size={36} />
            <Sticker name="heart" size={36} />
            <Sticker name="coffee" size={36} />
            <Sticker name="cat" size={36} />
          </div>
          <div className="flex gap-2">
            <Button>Primary</Button>
            <Button variant="quiet">Quiet</Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function QuestionSummary() {
  const privateCount = questions.filter((question) => question.isPrivate).length;

  return (
    <Panel title="Questions">
      <p className="mb-3 text-sm text-ink-soft">
        {questions.length} questions across {sections.length} sections. {privateCount} are private.
      </p>
      <ul className="space-y-1 text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <span className="font-semibold">{section.title}</span>
            <span className="text-faded"> — {questionsInSection(section.id).length} questions</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <HandLabel as="h2" size="lg" className="mb-3 block">
        {title}
      </HandLabel>
      {children}
    </section>
  );
}
