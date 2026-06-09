import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AdminProvider } from './contexts/AdminContext';
import { BootSequence } from './components/BootSequence';
import { ErrorBoundary } from './components/ErrorBoundary';
import './src/styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AdminProvider>
        <BootSequence />
        <App />
      </AdminProvider>
    </ErrorBoundary>
  </React.StrictMode>
);