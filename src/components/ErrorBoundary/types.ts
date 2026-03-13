import type { ReactNode, ErrorInfo } from "react";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  reset: () => void;
  boundaryName?: string;
}

export type ErrorBoundaryFallback =
  | ReactNode
  | ((props: ErrorBoundaryFallbackProps) => ReactNode);

export interface ErrorBoundaryProps {
  children: ReactNode;
  name?: string;
  fallback?: ErrorBoundaryFallback;
  resetKeys?: ReadonlyArray<unknown>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

export interface ErrorFallbackProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
