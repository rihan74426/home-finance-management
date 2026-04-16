"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { Toaster } from "sonner";
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
  Home,
  Zap,
} from "lucide-react";

const TOP_NAV = [{ href: "/dashboard", icon: Home, label: "My Houses" }];

const HOUSE_NAV = [
  { href: "", icon: LayoutDashboard, label: "Overview" },
  { href: "/ledger", icon: BookOpen, label: "Ledger" },
  { href: "/bills", icon: Zap, label: "Bills" },
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
      {/* Toaster — global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg-mid)",
            border: "1px solid var(--glass-border)",
            color: "var(--text)",
            fontSize: "0.875rem",
          },
          classNames: {
            success: "toast-success",
            error: "toast-error",
          },
        }}
      />

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
            padding: "18px 20px 16px",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              textDecoration: "none",
            }}
          >
            <Image
              src="/favicon.png"
              alt="Homy"
              width={24}
              height={24}
              style={{ borderRadius: 5, objectFit: "cover" }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                letterSpacing: "-0.02em",
                color: "var(--text)",
              }}
            >
              Homy
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
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

      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "28px" }}>{children}</div>
      </main>
    </div>
  );
}
