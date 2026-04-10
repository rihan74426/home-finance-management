"use client";

import {
  Construction,
  MessageSquare,
  ShoppingCart,
  BookOpen,
  ShieldCheck,
  CheckSquare,
  Users,
  Settings,
} from "lucide-react";

const ICON_MAP = {
  chat: MessageSquare,
  grocery: ShoppingCart,
  ledger: BookOpen,
  vault: ShieldCheck,
  tasks: CheckSquare,
  members: Users,
  settings: Settings,
};

export default function PlaceholderPage({
  icon,
  title,
  description,
  comingSoon = true,
}) {
  const Icon = ICON_MAP[icon] ?? Construction;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "55vh",
        textAlign: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "var(--glass-bg-mid)",
          border: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={24} color="var(--muted)" />
      </div>

      <div>
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          {title}
        </h1>
        <p
          style={{ color: "var(--muted)", fontSize: "0.875rem", maxWidth: 380 }}
        >
          {description}
        </p>
      </div>

      {comingSoon && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 50,
            border: "1px solid var(--teal-border)",
            background: "var(--teal-dim)",
            fontSize: "0.78rem",
            color: "var(--teal)",
            fontWeight: 600,
          }}
        >
          <Construction size={13} />
          Coming soon
        </div>
      )}
    </div>
  );
}
