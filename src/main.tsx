import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/components.css';
import './styles/shell.css';

if (import.meta.env.DEV && import.meta.env['VITE_ENABLE_REACT_DEVTOOLS'] === '1') {
  void Promise.all([import('react-grab'), import('react-scan')])
    .then(([, scanner]) => scanner.scan({ enabled: true, showToolbar: false }))
    .catch((error: unknown) => {
      console.warn(
        'Development diagnostics could not start',
        error instanceof Error ? error.message : error,
      );
    });
}
const element = document.getElementById('root');
if (element)
  createRoot(element).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
