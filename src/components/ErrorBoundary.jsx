import { Component } from "react";

import { AdminButton } from "@/components/ui/admin-button";
import { devError } from "@/lib/logger";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    devError("[ErrorBoundary]", error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { goHomeLink = "/", goHomeLabel = "Go Home", goAdminLink, goAdminLabel } = this.props;

    if (error) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel)] p-6 text-center shadow-[var(--admin-shadow-soft)]">
            <h2 className="text-lg font-semibold text-[color:var(--admin-text)]">Something went wrong</h2>
            <p className="mt-2 text-sm text-[color:var(--admin-muted)]">
              {error?.message || "An unexpected error occurred while rendering this view."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <AdminButton onClick={this.reset}>Try again</AdminButton>
              <AdminButton variant="outline" onClick={() => window.location.assign(goHomeLink)}>
                {goHomeLabel}
              </AdminButton>
              {goAdminLink && (
                <AdminButton variant="outline" onClick={() => window.location.assign(goAdminLink)}>
                  {goAdminLabel || "Go to dashboard"}
                </AdminButton>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
