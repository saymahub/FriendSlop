import { Component, type ReactNode } from 'react';

type SafeAreaProps = {
  children: ReactNode;
  /** What shows instead if this part crashes. Defaults to a short note. */
  fallback?: ReactNode;
};

/**
 * A crash inside stays inside. Without this, one bad answer that breaks a single
 * profile block or chart blanks the whole page for everyone who opens it; with
 * it, only that part is replaced by a note and the rest of the page carries on.
 * A class component, because only those can catch errors while rendering.
 */
export class SafeArea extends Component<SafeAreaProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return this.props.fallback ?? <p className="py-2 text-center text-sm text-faded">Couldn&rsquo;t show this part.</p>;
  }
}
