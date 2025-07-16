import React from 'react';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Button } from 'src/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Here you would typically log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;
      
      // Custom fallback component
      if (Fallback) {
        return <Fallback error={this.state.error} resetError={this.handleReset} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">Something went wrong</h3>
                    <p className="text-sm mt-1">
                      An unexpected error occurred. Please try refreshing the page.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={this.handleReset}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                    >
                      Reload Page
                    </Button>
                  </div>
                  
                  {showDetails && this.state.error && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                        Technical Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {this.state.error.toString()}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for programmatic error handling
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    // This could trigger an error boundary by throwing
    throw error;
  };
};

// Specialized error boundaries for different contexts
export const ChartErrorBoundary = ({ children, onError }) => {
  const handleError = (error, errorInfo) => {
    console.error('Chart error:', error);
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-gray-600">Chart failed to load</p>
            <Button onClick={resetError} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </div>
      )}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

export const FormErrorBoundary = ({ children, onError }) => {
  const handleError = (error, errorInfo) => {
    console.error('Form error:', error);
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p>Form encountered an error. Please try again.</p>
              <Button onClick={resetError} variant="outline" size="sm">
                Reset Form
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

export const RouteErrorBoundary = ({ children, onError }) => {
  const handleError = (error, errorInfo) => {
    console.error('Route error:', error);
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Page Error
            </h2>
            <p className="text-gray-600 mb-4">
              This page encountered an error. Please try navigating back or refreshing.
            </p>
            <div className="space-x-2">
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={resetError}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;