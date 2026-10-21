import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button, Notice } from '../components/ui';
export class ErrorBoundary extends Component<
  { readonly children: ReactNode },
  { readonly failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Workspace render failed', error, info.componentStack);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="error-screen">
          <h1>Something interrupted your workspace</h1>
          <Notice tone="error">
            Your saved data is still on this device. Reload to open your workspace again.
          </Notice>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload workspace
          </Button>
        </main>
      );
    return this.props.children;
  }
}
