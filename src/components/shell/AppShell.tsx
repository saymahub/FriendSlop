import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMusic } from '@/state/MusicContext';
import { SidebarNav } from './SidebarNav';

/**
 * Sidebar on a wide screen, drawer behind a menu button on a phone. Both render
 * the same nav component, so there is only ever one list of sections.
 */
export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { track } = useMusic();

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r-2 border-paper-edge bg-paper-deep/40 lg:block">
        <div className="sticky top-0">
          <SidebarNav />
        </div>
      </aside>

      <div>
        <MenuBar onOpen={() => setDrawerOpen(true)} />
        {/* Room under the last block for the now-playing bar, so it never covers anything. */}
        <main className={`mx-auto w-full max-w-3xl px-4 py-8 ${track ? 'pb-32' : ''}`}>
          <Outlet />
        </main>
      </div>

      {drawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}

function MenuBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-card border-2 border-paper-edge text-xl"
      >
        &#9776;
      </button>
    </div>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r-2 border-paper-edge bg-paper shadow-lift">
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>
  );
}
