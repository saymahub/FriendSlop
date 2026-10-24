import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { DevReset } from './components/shell/DevReset';
import { EmulatorBadge } from './components/shell/EmulatorBadge';
import { NowPlayingBar } from './components/shell/NowPlayingBar';
import { Admin } from './routes/Admin';
import { Credits } from './routes/Credits';
import { GroupStats } from './routes/GroupStats';
import { Landing } from './routes/Landing';
import { MilliesCC } from './routes/MilliesCC';
import { MyProfile } from './routes/MyProfile';
import { NamePicker } from './routes/NamePicker';
import { PeopleGrid } from './routes/PeopleGrid';
import { PersonProfile } from './routes/PersonProfile';
import { Questionnaire } from './routes/Questionnaire';
import { StyleGuide } from './routes/StyleGuide';
import { useViewer } from './state/ViewerContext';
import type { ReactNode } from 'react';

/**
 * A data router rather than `<BrowserRouter>`: leaving a half-edited
 * questionnaire has to be interceptable, and `useBlocker` only exists here.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Entry /> },
      { path: '/landing', element: <Landing /> },
      { path: '/pick', element: <NamePicker /> },
      { path: '/admin', element: <Admin /> },
      {
        element: <AppShell />,
        children: [
          { path: '/me', element: <RequireMember>{<MyProfile />}</RequireMember> },
          { path: '/me/edit', element: <RequireMember>{<Questionnaire />}</RequireMember> },
          { path: '/people', element: <RequireVault>{<PeopleGrid />}</RequireVault> },
          { path: '/people/:personId', element: <RequireVault>{<PersonProfile />}</RequireVault> },
          {
            path: '/stats',
            element: (
              <RequireVault>
                <GroupStats />
              </RequireVault>
            ),
          },
          { path: '/cc', element: <RequireSubmitted>{<MilliesCC />}</RequireSubmitted> },
          { path: '/style-guide', element: <StyleGuide /> },
          { path: '/credits', element: <Credits /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

function RootLayout() {
  return (
    <>
      <EmulatorBadge />
      <Outlet />
      <NowPlayingBar />
      {import.meta.env.DEV && <DevReset />}
    </>
  );
}

/** Returning visitors skip the landing page; the device already knows them. */
function Entry() {
  const { viewer } = useViewer();

  if (viewer.kind === 'loading') {
    return <Waiting />;
  }

  if (viewer.kind === 'member') {
    return <Navigate to="/me" replace />;
  }

  if (viewer.kind === 'guest') {
    return <Navigate to="/people" replace />;
  }

  return <Landing />;
}

function RequireMember({ children }: { children: ReactNode }) {
  const { viewer } = useViewer();

  if (viewer.kind === 'loading') {
    return <Waiting />;
  }

  return viewer.kind === 'member' ? <>{children}</> : <Navigate to="/" replace />;
}

/**
 * The submission gate. Step 3 moves it into Firestore rules, which is where it
 * becomes a real lock rather than a redirect.
 */
/**
 * Members who have handed their page in, and nobody else: stricter than the
 * vault, which also lets guests and the admin look around.
 */
function RequireSubmitted({ children }: { children: ReactNode }) {
  const { viewer } = useViewer();

  if (viewer.kind === 'loading') {
    return <Waiting />;
  }

  if (viewer.kind === 'member') {
    return viewer.submitted ? <>{children}</> : <Navigate to="/me" replace />;
  }

  return <Navigate to="/" replace />;
}

function RequireVault({ children }: { children: ReactNode }) {
  const { viewer } = useViewer();

  if (viewer.kind === 'loading') {
    return <Waiting />;
  }

  if (viewer.kind === 'guest' || viewer.kind === 'admin') {
    return <>{children}</>;
  }

  if (viewer.kind === 'member' && viewer.submitted) {
    return <>{children}</>;
  }

  return <Navigate to="/me" replace />;
}

/** Shown while Firebase restores an existing session, which takes a moment. */
function Waiting() {
  return <p className="px-4 py-16 text-center text-ink-soft">One moment…</p>;
}
