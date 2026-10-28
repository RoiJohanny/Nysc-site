import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Tier 1: Google Maps Platform Global Quota Defense & Activation Tap
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-auth-failed'));
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };

  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args.map((a) => String(a)).join(' ');
    if (msg.includes('ApiNotActivatedMapError')) {
      window.dispatchEvent(new CustomEvent('gmp-api-not-activated', { detail: { message: msg } }));
      // Suppress unhandled console blow-up while allowing warning
      console.warn('[Google Maps] Maps JavaScript API is not yet activated for this project API key. Graceful fallback active.');
      return;
    }
    origError.apply(console, args);
    if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  };

  // Catch unhandled script error from external Google Maps if API is disabled
  window.addEventListener('error', (event) => {
    if (
      event.message === 'Script error.' ||
      (event.filename && event.filename.includes('maps.googleapis.com'))
    ) {
      window.dispatchEvent(new CustomEvent('gmp-script-error'));
      // Prevent browser default error dialog or test halt
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
