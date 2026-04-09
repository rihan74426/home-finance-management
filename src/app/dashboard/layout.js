"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  CheckSquare,
  ShoppingCart,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
} from "lucide-react";

const TOP_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "My Houses" },
];

const HOUSE_NAV = [
  { href: "", icon: LayoutDashboard, label: "Overview" },
  { href: "/ledger", icon: BookOpen, label: "Ledger" },
  { href: "/vault", icon: ShieldCheck, label: "Vault" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/grocery", icon: ShoppingCart, label: "Grocery" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const houseId = params?.houseId;

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--glass-border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "var(--bg-mid)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              fontWeight: 800,
              fontSize: "1.2rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🏠 Homy
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {/* If inside a house, show house nav */}
          {houseId ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 12px",
                  borderRadius: 8,
                  marginBottom: 8,
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  textDecoration: "none",
                }}
              >
                <ChevronLeft size={13} /> All Houses
              </Link>
              {HOUSE_NAV.map(({ href, icon: Icon, label }) => {
                const fullHref = `/dashboard/${houseId}${href}`;
                const active = pathname === fullHref;
                return (
                  <Link
                    key={href}
                    href={fullHref}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 10,
                      marginBottom: 2,
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--text)" : "var(--muted)",
                      background: active
                        ? "var(--glass-bg-mid)"
                        : "transparent",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon
                      size={16}
                      color={active ? "var(--accent)" : "var(--muted)"}
                    />
                    {label}
                  </Link>
                );
              })}
            </>
          ) : (
            TOP_NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 10,
                    marginBottom: 2,
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--text)" : "var(--muted)",
                    background: active ? "var(--glass-bg-mid)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  <Icon
                    size={16}
                    color={active ? "var(--accent)" : "var(--muted)"}
                  />
                  {label}
                </Link>
              );
            })
          )}
        </nav>

        {/* User */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <UserButton afterSignOutUrl="/" />
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: "var(--text)",
                fontSize: "0.8rem",
              }}
            >
              My Account
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "28px" }}>{children}</div>
      </main>
    </div>
  );
}
