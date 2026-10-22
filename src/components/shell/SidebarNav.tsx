import { Link, NavLink } from 'react-router-dom';
import { HandLabel } from '@/components/primitives';
import { logos } from '@/assets/registry';
import { useViewer } from '@/state/ViewerContext';
import { navItemsFor } from './navItems';

type SidebarNavProps = {
  /** Rendered inside the mobile drawer, so following a link should close it. */
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { viewer, releaseName } = useViewer();
  const items = navItemsFor(viewer);

  return (
    <nav className="flex h-full flex-col gap-6 p-5">
      <Link to="/landing" onClick={onNavigate} className="flex items-center gap-2">
        <img src={logos.bro} alt="" aria-hidden="true" className="h-8 w-9 shrink-0 object-contain" />
        <HandLabel as="span" size="lg" face="title">
          friendslop
        </HandLabel>
      </Link>

      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex min-h-11 items-center rounded-card px-3 font-semibold transition-colors ${
                  isActive ? 'bg-[var(--person-wash)] text-ink' : 'text-ink-soft hover:bg-paper-deep'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {(viewer.kind === 'member' || viewer.kind === 'guest') && (
        <button
          type="button"
          onClick={releaseName}
          className="mt-auto self-start text-xs text-faded underline underline-offset-2"
        >
          {viewer.kind === 'guest' ? 'Leave guest mode' : 'Not you? Start over'}
        </button>
      )}
    </nav>
  );
}
