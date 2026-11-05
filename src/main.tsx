import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Guard against third-party extension injection rejections (e.g., MetaMask in sandboxed iframes)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '').toLowerCase();
    const stackStr = String(event.reason?.stack || '').toLowerCase();
    if (
      reasonStr.includes('metamask') ||
      reasonStr.includes('ethereum') ||
      reasonStr.includes('failed to connect') ||
      stackStr.includes('chrome-extension://')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Recovered from boundary error:', error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
