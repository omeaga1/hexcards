import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HexCards Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl bg-[#120a0d] border border-rose-500/40 text-rose-200 text-center space-y-3 font-['Barlow_Condensed'] my-4">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-black uppercase text-rose-100 tracking-wider">
            {this.props.fallbackTitle || 'Component Render Interrupted'}
          </h3>
          <p className="text-xs text-[#cbdad0] font-sans max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected rendering issue occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-xs font-black uppercase tracking-wider text-rose-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recover Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
