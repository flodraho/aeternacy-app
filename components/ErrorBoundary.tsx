
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
          <div className="bg-slate-800/50 p-8 rounded-3xl ring-1 ring-white/10 max-w-md w-full backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white font-brand mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6 text-sm">
              æternacy encountered an unexpected issue. Our team has been notified.
            </p>
            
            <div className="bg-black/30 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
                <code className="text-xs text-red-300 font-mono">
                    {this.state.error?.message}
                </code>
            </div>

            <div className="flex gap-4 justify-center">
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-full transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Reload
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                    <Home className="w-4 h-4" /> Go Home
                </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
