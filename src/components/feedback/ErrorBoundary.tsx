'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children:  ReactNode;
  /** Fallback personnalisé (optionnel) */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Remplacer par un vrai service de logging (Sentry…) en production
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center"
          role="alert"
        >
          <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {this.state.error?.message ?? 'Erreur inattendue'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
