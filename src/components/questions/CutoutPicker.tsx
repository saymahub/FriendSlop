import { cutouts } from '@/assets/registry';
import { cutoutLabel } from '@/lib/answerDisplay';
import type { CutoutQuestion } from '@/config/questionTypes';
import type { QuestionProps } from './types';

/** Pick one, tap it again to put it back. The pictures speak for themselves. */
export function CutoutPicker({ question, value, onChange }: QuestionProps<CutoutQuestion>) {
  const art = cutouts[question.set];
  const names = Object.keys(art).sort();

  if (names.length === 0) {
    return <p className="text-sm text-faded">No pictures have been added yet.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {names.map((name) => (
        <CutoutTile
          key={name}
          name={name}
          src={art[name]}
          isSelected={value === name}
          onSelect={() => onChange(value === name ? null : name)}
        />
      ))}
    </div>
  );
}

type CutoutTileProps = { name: string; src: string; isSelected: boolean; onSelect: () => void };

function CutoutTile({ name, src, isSelected, onSelect }: CutoutTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`overflow-hidden rounded-card border-2 transition-shadow ${
        isSelected ? 'border-ink shadow-lift' : 'border-paper-edge'
      }`}
    >
      <span className="flex h-20 items-center justify-center bg-paper-deep p-1">
        <img src={src} alt={cutoutLabel(name)} className="h-full w-full object-contain" />
      </span>
    </button>
  );
}
