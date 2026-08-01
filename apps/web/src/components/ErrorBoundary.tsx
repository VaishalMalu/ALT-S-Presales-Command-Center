import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              An unexpected error occurred in the application. Our team has been notified.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-left overflow-auto max-h-32 mb-6 border border-gray-100">
              <code className="text-xs text-red-600 font-mono break-all">
                {this.state.error?.message || "Unknown error"}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-[#1E2761] text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
