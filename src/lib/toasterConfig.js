/**
 * Drop this <Toaster> in place of the existing one inside DashboardLayout.
 *
 * Key changes:
 *  - `expand` shows full toast content (needed to see action button clearly)
 *  - `visibleToasts` allows stacking up to 3
 *  - Custom styles make the Undo button visually distinct (teal, not default)
 *  - `closeButton` gives a quick dismiss option
 *
 * Also add the global CSS below into globals.css.
 */

// ── JSX to paste into layout.js (replace existing <Toaster>) ─────────────────

/*
<Toaster
  position="bottom-right"
  expand
  visibleToasts={3}
  closeButton
  toastOptions={{
    duration: 5500,
    style: {
      background: "var(--bg-mid)",
      border: "1px solid var(--glass-border)",
      color: "var(--text)",
      fontSize: "0.875rem",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      gap: "8px",
    },
    actionButtonStyle: {
      background: "rgba(45, 212, 191, 0.15)",
      border: "1px solid rgba(45, 212, 191, 0.35)",
      color: "#2dd4bf",
      fontWeight: "700",
      fontSize: "0.78rem",
      borderRadius: "8px",
      padding: "5px 12px",
      cursor: "pointer",
    },
    cancelButtonStyle: {
      background: "var(--glass-bg-mid)",
      border: "1px solid var(--glass-border)",
      color: "var(--muted)",
      fontWeight: "600",
      fontSize: "0.78rem",
      borderRadius: "8px",
      padding: "5px 10px",
    },
  }}
/>
*/

// ── CSS to add to globals.css ─────────────────────────────────────────────────
/*
  Sonner toast overrides — undo countdown toasts
  ────────────────────────────────────────────────
  [data-sonner-toaster] [data-type="default"] {
    background: var(--bg-mid) !important;
    border: 1px solid var(--glass-border) !important;
    border-radius: 12px !important;
  }

  [data-sonner-toaster] [data-action] button {
    background: rgba(45, 212, 191, 0.15) !important;
    border: 1px solid rgba(45, 212, 191, 0.35) !important;
    color: #2dd4bf !important;
    font-weight: 700 !important;
    font-size: 0.78rem !important;
    border-radius: 8px !important;
    padding: 5px 12px !important;
    transition: background 0.15s !important;
  }

  [data-sonner-toaster] [data-action] button:hover {
    background: rgba(45, 212, 191, 0.25) !important;
  }

  [data-sonner-toast][data-type="success"] {
    border-color: rgba(74, 222, 128, 0.3) !important;
  }

  [data-sonner-toast][data-type="error"] {
    border-color: rgba(248, 113, 113, 0.3) !important;
  }
*/

export const TOASTER_PROPS = {
  position: "bottom-right",
  expand: true,
  visibleToasts: 3,
  closeButton: true,
  toastOptions: {
    duration: 5500,
    style: {
      background: "var(--bg-mid)",
      border: "1px solid var(--glass-border)",
      color: "var(--text)",
      fontSize: "0.875rem",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    },
    actionButtonStyle: {
      background: "rgba(45, 212, 191, 0.15)",
      border: "1px solid rgba(45, 212, 191, 0.35)",
      color: "#2dd4bf",
      fontWeight: "700",
      fontSize: "0.78rem",
      borderRadius: "8px",
      padding: "5px 12px",
      cursor: "pointer",
    },
    cancelButtonStyle: {
      background: "var(--glass-bg-mid)",
      border: "1px solid var(--glass-border)",
      color: "var(--muted)",
      fontWeight: "600",
      fontSize: "0.78rem",
      borderRadius: "8px",
      padding: "5px 10px",
    },
  },
};
