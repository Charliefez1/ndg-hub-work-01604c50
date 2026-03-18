import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="text-center max-w-md space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" strokeWidth={1.5} />
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-text-2 text-sm">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-surface border rounded p-3 overflow-auto max-h-32 text-destructive">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
