import type { ReactNode } from 'react';

/**
 * Interface icons, all drawn the same way: thin rounded lines in the current
 * text colour, so a button's colour and hover state carry over to its icon.
 * Each is decorative; the button around it carries the label.
 */
function Icon({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/** An eye, struck through while what it guards is showing. */
export function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <Icon>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M3 3l18 18" />}
    </Icon>
  );
}

/** A speaker with sound waves, or with a cross when muted. */
export function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <Icon>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      ) : (
        <>
          <path d="M15.5 9a4 4 0 010 6" />
          <path d="M18.5 6.5a7.5 7.5 0 010 11" />
        </>
      )}
    </Icon>
  );
}

/** A play triangle, or two pause bars while playing. Filled, so it reads at a glance. */
export function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <Icon>
      {playing ? (
        <>
          <path d="M8 5.5v13" strokeWidth="3" />
          <path d="M16 5.5v13" strokeWidth="3" />
        </>
      ) : (
        <path d="M7.5 5v14l11-7z" fill="currentColor" />
      )}
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <Icon className="h-4 w-4">
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}
