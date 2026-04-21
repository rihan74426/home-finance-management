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
  Video,
  BookMarked,
  StickyNote,
  LogOut,
  Menu,
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
  { href: "/meetings", icon: Video, label: "Meetings" },
  { href: "/rules", icon: BookMarked, label: "Rules" },
  { href: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/moveout", icon: LogOut, label: "Move-Out" },
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
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxHeight: "70vh",
          background: "var(--bg-mid)",
          border: "1px solid var(--glass-border)",
          borderRadius: "16px 16px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={14} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
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
          <div style={{ display: "flex", gap: 10 }}>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--teal)",
                  fontSize: "0.75rem",
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
              <X size={16} />
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
                  padding: "12px 18px",
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
                  <div style={{ flex: 1, paddingLeft: n.isRead ? 16 : 0 }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: n.isRead ? 400 : 600,
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                    {n.body && (
                      <div
                        style={{ fontSize: "0.77rem", color: "var(--muted)" }}
                      >
                        {n.body}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--faint)",
                        marginTop: 4,
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
    </div>
  );
}

function Sidebar({ houseId, pathname, onClose, isMobile }) {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: isMobile ? "none" : "1px solid var(--glass-border)",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-mid)",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "16px 18px 14px",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          onClick={isMobile ? onClose : undefined}
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
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
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
              onClick={isMobile ? onClose : undefined}
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
                  onClick={isMobile ? onClose : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    marginBottom: 1,
                    fontSize: "0.855rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--text)" : "var(--muted)",
                    background: active ? "var(--glass-bg-mid)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon
                    size={15}
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
                onClick={isMobile ? onClose : undefined}
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
    </aside>
  );
}

export default function DashboardLayout({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const houseId = params?.houseId;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Close mobile sidebar on route change
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [pathname]);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
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

      {/* Mobile overlay sidebar */}
      {showMobileSidebar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
          }}
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            style={{ width: 240, height: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              houseId={houseId}
              pathname={pathname}
              onClose={() => setShowMobileSidebar(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <div
        style={{
          display: "none",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg-mid)",
          borderBottom: "1px solid var(--glass-border)",
          padding: "12px 16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="mobile-topbar"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowMobileSidebar(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              padding: 4,
            }}
          >
            <Menu size={20} />
          </button>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <Image
              src="/favicon.png"
              alt="Homy"
              width={22}
              height={22}
              style={{ borderRadius: 5, objectFit: "cover" }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: "1rem",
                color: "var(--text)",
              }}
            >
              Homy
            </span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              setShowNotifications(true);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 4,
              position: "relative",
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "0.55rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Desktop sidebar */}
        <div
          className="desktop-sidebar"
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
                        padding: "8px 12px",
                        borderRadius: 10,
                        marginBottom: 1,
                        fontSize: "0.855rem",
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
                        size={15}
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
              })
            )}
          </nav>

          {/* Desktop bottom: notifications + user */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid var(--glass-border)",
            }}
          >
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
                marginBottom: 10,
                background: showNotifications
                  ? "var(--glass-bg-mid)"
                  : "transparent",
                border: "none",
                cursor: "pointer",
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <UserButton afterSignOutUrl="/" />
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                My Account
              </div>
            </div>
          </div>
        </div>

        <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <div style={{ padding: "clamp(16px, 4vw, 28px)" }}>{children}</div>
        </main>
      </div>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .desktop-sidebar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
