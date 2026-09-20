import type { FC } from 'react';
import type { Profile } from '@/lib/profileData';

export type BlockProps = {
  profile: Profile;
  /** Whether the viewer is allowed to see answers marked private. */
  showPrivate: boolean;
};

export type ProfileBlock = {
  readonly id: string;
  readonly Component: FC<BlockProps>;
  /** Omitted entirely for viewers without private access, never shown locked. */
  readonly privateOnly?: boolean;
};
