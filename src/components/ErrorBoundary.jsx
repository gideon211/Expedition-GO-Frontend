import { Component } from "react";

import { AdminButton } from "@/components/ui/admin-button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Admin ErrorBoundary caught", error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel)] p-6 text-center shadow-[var(--admin-shadow-soft)]">
            <h2 className="text-lg font-semibold text-[color:var(--admin-text)]">Something went wrong</h2>
            <p className="mt-2 text-sm text-[color:var(--admin-muted)]">
              {this.state.error?.message || "An unexpected error occurred while rendering this view."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <AdminButton onClick={this.reset}>Try again</AdminButton>
              <AdminButton variant="outline" onClick={() => window.location.assign("/admin")}>
                Go to dashboard
              </AdminButton>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
