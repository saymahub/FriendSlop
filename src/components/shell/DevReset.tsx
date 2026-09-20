import { useNavigate } from 'react-router-dom';
import { useViewer } from '@/state/ViewerContext';

/**
 * A testing shortcut back to the landing page from any viewer state. Rendered
 * only when `import.meta.env.DEV` is true, so Vite drops it from the production
 * bundle entirely rather than shipping a button that unclaims someone's name.
 */
export function DevReset() {
  const navigate = useNavigate();
  const { viewer, releaseName } = useViewer();

  const reset = async () => {
    await releaseName();
    navigate('/landing');
  };

  return (
    <div className="fixed right-3 bottom-3 z-50 flex items-center gap-2 rounded-card border-2 border-ink/30 bg-paper/90 px-2 py-1 text-xs shadow-lift">
      <span className="text-faded">dev: {describe(viewer.kind)}</span>
      <button type="button" onClick={reset} className="font-semibold underline underline-offset-2">
        Reset
      </button>
    </div>
  );
}

function describe(kind: string): string {
  return kind === 'unknown' ? 'no one' : kind;
}
