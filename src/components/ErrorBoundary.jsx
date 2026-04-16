"use client";

import { Component } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            gap: 16,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={22} color="#f87171" />
          </div>
          <div>
            <h2
              style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--muted)",
                maxWidth: 340,
              }}
            >
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 20px",
              borderRadius: 50,
              background: "var(--glass-bg-mid)",
              border: "1px solid var(--glass-border)",
              color: "var(--text)",
              fontSize: "0.825rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} /> Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
