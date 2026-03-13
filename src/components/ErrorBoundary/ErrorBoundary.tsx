import { Component, type ErrorInfo } from "react";
import type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorFallbackProps,
} from "./types";
import { hasResetKeysChanged } from "./utils";

export const ErrorFallback = ({
  title = "Something went wrong.",
  description = "Try again in a moment.",
  actionLabel = "Try again",
  onAction,
}: ErrorFallbackProps) => (
  <section
    role="alert"
    className="w-full max-w-xl rounded border border-red-300 bg-red-100 px-4 py-3 text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200"
  >
    <p className="text-sm font-semibold">{title}</p>
    <p className="mt-1 text-sm">{description}</p>
    {onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="mt-3 rounded border border-red-400 bg-red-200 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-red-300 dark:border-red-600 dark:bg-red-900/40 dark:hover:bg-red-900/70"
      >
        {actionLabel}
      </button>
    ) : null}
  </section>
);

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

      return <ErrorFallback onAction={this.reset} />;
    }

    return children;
  }
}

export default ErrorBoundary;
