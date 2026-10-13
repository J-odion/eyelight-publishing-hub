import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
          <div className="max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              An unexpected error occurred while loading this view. Click below to refresh the page.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto text-left text-muted-foreground mb-6 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="bg-accent text-accent-foreground font-semibold px-6 py-2.5 rounded-xl hover:opacity-95"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
