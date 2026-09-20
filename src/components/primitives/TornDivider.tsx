const TORN_EDGE =
  'polygon(0 35%, 4% 20%, 9% 42%, 15% 18%, 22% 45%, 29% 22%, 36% 48%, 44% 20%, 52% 44%, 60% 19%, 68% 46%, 76% 21%, 84% 45%, 91% 22%, 97% 43%, 100% 30%, 100% 100%, 0 100%)';

export function TornDivider({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{ clipPath: TORN_EDGE }}
      className={`h-5 w-full bg-paper-edge ${className}`}
    />
  );
}
