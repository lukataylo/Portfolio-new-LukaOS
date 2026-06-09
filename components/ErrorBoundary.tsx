import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level error boundary. Keeps a runtime error in one part of the app
 * (e.g. a lazily-loaded content window) from blanking the entire desktop,
 * and offers a one-tap recovery.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Surface for debugging without crashing the shell.
    console.error('LukaOS caught a runtime error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#f0f0f0] dark:bg-[#0f0f0f] p-6">
        <div className="max-w-sm w-full text-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 rounded-window shadow-window p-8">
          <div className="w-3 h-3 rounded-full bg-red-600 mx-auto mb-5" />
          <h1 className="text-lg font-bold text-black dark:text-white mb-2">Something went sideways</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            LukaOS hit an unexpected error. Your data is safe — a restart usually clears it.
          </p>
          <button
            onClick={this.handleReload}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Restart LukaOS
          </button>
        </div>
      </div>
    );
  }
}
