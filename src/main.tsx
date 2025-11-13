import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// StrictMode disabled to match production behavior
// (no double mount/unmount in development)
createRoot(document.getElementById('root')!).render(<App />);
