import { cutouts, stickers, type CutoutSet, type StickerName } from '@/assets/registry';

type MaskStickerProps = {
  name: StickerName;
  size?: number;
  /** Recolours the drawing via a CSS mask: one file, any number of colours. */
  tint?: string;
  className?: string;
};

type CutoutStickerProps = {
  /** Full-colour art, drawn as-is with a die-cut edge rather than recoloured. */
  set: CutoutSet;
  name: string;
  /** Unlike the line drawings, a chosen cutout means something, so it is named. */
  label: string;
  size?: number;
  /** Which way it leans. Two stickers on one page lean apart, as if slapped on by hand. */
  lean?: 'left' | 'right';
  className?: string;
};

export function Sticker(props: MaskStickerProps | CutoutStickerProps) {
  return 'set' in props ? <CutoutSticker {...props} /> : <MaskSticker {...props} />;
}

function MaskSticker({ name, size = 48, tint = 'var(--person-base)', className = '' }: MaskStickerProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        backgroundColor: tint,
        maskImage: `url("${stickers[name]}")`,
        WebkitMaskImage: `url("${stickers[name]}")`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
      className={`pointer-events-none inline-block ${className}`}
    />
  );
}

function CutoutSticker({ set, name, label, size = 48, lean = 'right', className = '' }: CutoutStickerProps) {
  return (
    <img
      src={cutouts[set][name]}
      alt={label}
      width={size}
      height={size}
      style={{ rotate: lean === 'right' ? 'var(--rotate-sticker)' : 'calc(var(--rotate-sticker) * -1)' }}
      className={`die-cut pointer-events-none object-contain ${className}`}
    />
  );
}
