/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import MPCPlayer from './components/MPCPlayer';

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white/70 px-6 text-center space-y-4">
          <p className="text-sm font-mono uppercase tracking-widest text-[#E63946]">Something broke the console</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div
      className="min-h-screen text-[#E0E0E0] font-sans flex flex-col overflow-x-hidden md:py-8 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(230,57,70,0.06), transparent 55%), radial-gradient(circle at 100% 100%, rgba(157,78,221,0.05), transparent 50%), #0A0A0A',
        overscrollBehavior: 'none',
      }}
    >
      <ErrorBoundary>
        <MPCPlayer />
      </ErrorBoundary>
    </div>
  );
}
