import { stickers, type StickerName } from '@/assets/registry';

type StickerProps = {
  name: StickerName;
  size?: number;
  /** Recolours the drawing via a CSS mask: one file, any number of colours. */
  tint?: string;
  className?: string;
};

export function Sticker({ name, size = 48, tint = 'var(--person-base)', className = '' }: StickerProps) {
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
