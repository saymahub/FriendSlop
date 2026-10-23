import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router';
import { MusicProvider } from './state/MusicContext';
import { ViewerProvider } from './state/ViewerContext';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Missing #root element in index.html');
}

createRoot(container).render(
  <StrictMode>
    <ViewerProvider>
      <MusicProvider>
        <RouterProvider router={router} />
      </MusicProvider>
    </ViewerProvider>
  </StrictMode>,
);
