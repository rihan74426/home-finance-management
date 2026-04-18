"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  Bell,
  X,
  Check,
  User,
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

function fmtTime(d) {
  const diff = Date.now() - new Date(d);
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications?limit=20")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setNotifications(j.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
  }

  async function markOne(id) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((p) =>
      p.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 230,
        width: 320,
        maxHeight: 420,
        background: "var(--bg-mid)",
        border: "1px solid var(--glass-border)",
        borderRadius: 14,
        boxShadow: "var(--shadow-card)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={14} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
            Notifications
          </span>
          {unread > 0 && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "1px 7px",
                borderRadius: 50,
                background: "var(--accent)",
                color: "#fff",
              }}
            >
              {unread}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--teal)",
                fontSize: "0.72rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Check size={11} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {loading ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.8rem",
            }}
          >
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.8rem",
            }}
          >
            <Bell size={28} style={{ marginBottom: 8, opacity: 0.2 }} />
            <div>No notifications yet.</div>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markOne(n._id)}
              style={{
                padding: "11px 16px",
                borderBottom: "1px solid var(--glass-border)",
                background: n.isRead ? "transparent" : "rgba(232,98,26,0.04)",
                cursor: n.isRead ? "default" : "pointer",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                {!n.isRead && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: n.isRead ? 400 : 600,
                      marginBottom: 2,
                      paddingLeft: n.isRead ? 16 : 0,
                    }}
                  >
                    {n.title}
                  </div>
                  {n.body && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                        paddingLeft: n.isRead ? 16 : 0,
                      }}
                    >
                      {n.body}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--faint)",
                      marginTop: 4,
                      paddingLeft: n.isRead ? 16 : 0,
                    }}
                  >
                    {fmtTime(n.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const houseId = params?.houseId;
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    function fetchCount() {
      fetch("/api/notifications?limit=1&unreadOnly=true")
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setUnreadCount(j.unreadCount || 0);
        })
        .catch(() => {});
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  useEffect(() => {
    if (!showNotifications) return;
    function handler(e) {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowNotifications(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  if (!isLoaded)
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
  if (!isSignedIn) return null;

  const isProfileActive = pathname === "/dashboard/profile";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
      }}
    >
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg-mid)",
            border: "1px solid var(--glass-border)",
            color: "var(--text)",
            fontSize: "0.875rem",
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
            <>
              {TOP_NAV.map(({ href, icon: Icon, label }) => {
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
                      background: active
                        ? "var(--glass-bg-mid)"
                        : "transparent",
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
              })}
            </>
          )}
        </nav>

        {/* Bottom bar */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid var(--glass-border)",
          }}
          ref={bellRef}
        >
          {/* Notification bell */}
          <button
            onClick={() => {
              setShowNotifications((v) => !v);
              if (!showNotifications && unreadCount > 0) setUnreadCount(0);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 10px",
              borderRadius: 10,
              marginBottom: 6,
              background: showNotifications
                ? "var(--glass-bg-mid)"
                : "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              transition: "background 0.15s",
            }}
          >
            <div style={{ position: "relative" }}>
              <Bell
                size={16}
                color={showNotifications ? "var(--accent)" : "var(--muted)"}
              />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -6,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: "0.55rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: showNotifications ? 600 : 400,
                color: showNotifications ? "var(--text)" : "var(--muted)",
              }}
            >
              Notifications
            </span>
          </button>

          {/* Profile link */}
          <Link
            href="/dashboard/profile"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 10px",
              borderRadius: 10,
              marginBottom: 10,
              background: isProfileActive
                ? "var(--glass-bg-mid)"
                : "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              transition: "background 0.15s",
            }}
          >
            <User
              size={16}
              color={isProfileActive ? "var(--accent)" : "var(--muted)"}
            />
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: isProfileActive ? 600 : 400,
                color: isProfileActive ? "var(--text)" : "var(--muted)",
              }}
            >
              My Profile
            </span>
          </Link>

          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UserButton afterSignOutUrl="/" />
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.firstName || "My Account"}
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
