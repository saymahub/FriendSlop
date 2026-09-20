import { Sticker } from '@/components/primitives';
import { flowers } from '@/config/flowers';
import { swatches, swatchIds } from '@/config/swatches';
import { asSelection, toggleCapped } from '@/lib/selection';
import type { SwatchQuestion } from '@/config/questionTypes';
import type { QuestionProps } from './types';

type Tile = { id: string; name: string; fill: string; ink: string };

/**
 * One grid, three jobs: numbered favourites, crossed-out dislikes, and flowers
 * drawn in the tile instead of a flat fill. Names sit under every tile because
 * touch screens have no hover, and colour alone cannot carry the meaning.
 */
export function SwatchGrid({ question, value, onChange }: QuestionProps<SwatchQuestion>) {
  const selected = asSelection(value);
  const tiles = question.variant === 'flower' ? flowerTiles() : colourTiles();

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {tiles.map((tile) => (
          <SwatchTile
            key={tile.id}
            tile={tile}
            variant={question.variant}
            rank={selected.indexOf(tile.id) + 1}
            onSelect={() => onChange(toggleCapped(selected, tile.id, question.max))}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-faded">Pick up to {question.max}. A new pick replaces your oldest.</p>
    </div>
  );
}

type SwatchTileProps = {
  tile: Tile;
  variant: SwatchQuestion['variant'];
  /** 1-based position in the selection, or 0 when unselected. */
  rank: number;
  onSelect: () => void;
};

function SwatchTile({ tile, variant, rank, onSelect }: SwatchTileProps) {
  const isSelected = rank > 0;
  const isFlower = variant === 'flower';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={tile.name}
      className={`overflow-hidden rounded-card border-2 text-left transition-shadow ${
        isSelected ? 'border-ink shadow-lift' : 'border-paper-edge'
      }`}
    >
      <span
        style={{ backgroundColor: isFlower ? 'var(--color-paper-deep)' : tile.fill, color: tile.ink }}
        className="relative flex h-14 items-center justify-center"
      >
        {isFlower && <Sticker name="flower" size={34} tint={tile.fill} />}
        {isSelected && variant !== 'hate' && (
          <span className="absolute top-1 right-1 text-xs font-bold tabular-nums">{rank}</span>
        )}
        {isSelected && variant === 'hate' && <span className="absolute text-2xl font-bold">&times;</span>}
      </span>
      <span className="block bg-paper px-1 py-1.5 text-center text-[11px] font-bold text-ink-soft">{tile.name}</span>
    </button>
  );
}

function colourTiles(): Tile[] {
  return swatchIds.map((id) => ({ id, name: swatches[id].name, fill: swatches[id].base, ink: swatches[id].ink }));
}

function flowerTiles(): Tile[] {
  return flowers.map((flower) => ({
    id: flower.id,
    name: flower.name,
    fill: swatches[flower.tint].base,
    ink: swatches[flower.tint].ink,
  }));
}
