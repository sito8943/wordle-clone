import { Component, type ErrorInfo } from "react";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "./types";
import { ErrorFallback } from "./ErrorFallback";
import { hasResetKeysChanged } from "./utils";

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { name, onError } = this.props;

    if (onError) {
      onError(error, errorInfo);
      return;
    }

    console.error(`[ErrorBoundary${name ? `:${name}` : ""}]`, error, errorInfo);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { error } = this.state;

    if (error && hasResetKeysChanged(previousProps.resetKeys, resetKeys)) {
      this.reset();
    }
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, fallback, name } = this.props;
    const { error } = this.state;

    if (error) {
      if (typeof fallback === "function") {
        return fallback({ error, reset: this.reset, boundaryName: name });
      }

      if (fallback !== undefined) {
        return fallback;
      }

      return <ErrorFallback />;
    }

    return children;
  }
}

export default ErrorBoundary;
