"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  BarChart2,
  Menu,
  LogOut,
  User,
  AlertTriangle,
} from "lucide-react";

const TOP_NAV = [
  { href: "/dashboard", icon: Home, label: "My Houses" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

const HOUSE_NAV = [
  { href: "", icon: LayoutDashboard, label: "Overview" },
  { href: "/ledger", icon: BookOpen, label: "Ledger" },
  { href: "/bills", icon: Zap, label: "Bills" },
  { href: "/vault", icon: ShieldCheck, label: "Vault" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/grocery", icon: ShoppingCart, label: "Grocery" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/polls", icon: BarChart2, label: "Polls" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/rules", icon: BookMarked, label: "Rules" },
  { href: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/meetings", icon: Video, label: "Meetings" },
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

// Notification type → color + icon
const NOTIF_TYPE_CONFIG = {
  rent_overdue: { color: "#f87171", pulse: true },
  rent_due: { color: "#fbbf24", pulse: false },
  task_overdue: { color: "#f87171", pulse: true },
  rule_broken: { color: "#f87171", pulse: true },
  default: { color: "var(--accent)", pulse: false },
};

function NotificationPanel({ onClose, onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications?limit=25")
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
    onRead(0);
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
  const urgentAlerts = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.type === "rent_overdue" ||
        n.type === "task_overdue" ||
        n.type === "rule_broken")
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.55)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "min(380px, 100vw)",
          background: "var(--bg-mid)",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--glass-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={15} color="var(--accent)" />
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
                  background:
                    unread > 0 && urgentAlerts.length > 0
                      ? "#f87171"
                      : "var(--accent)",
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

        {/* Urgent alerts banner */}
        {urgentAlerts.length > 0 && (
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(248,113,113,0.08)",
              borderBottom: "1px solid rgba(248,113,113,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <span
              className="alert-pulse"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f87171",
                display: "block",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: "0.78rem", color: "#f87171", fontWeight: 600 }}
            >
              {urgentAlerts.length} urgent alert
              {urgentAlerts.length !== 1 ? "s" : ""} require attention
            </span>
          </div>
        )}

        {/* List */}
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
                padding: "40px 16px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "0.8rem",
              }}
            >
              <Bell
                size={28}
                style={{
                  marginBottom: 8,
                  opacity: 0.2,
                  display: "block",
                  margin: "0 auto 8px",
                }}
              />
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => {
              const cfg =
                NOTIF_TYPE_CONFIG[n.type] || NOTIF_TYPE_CONFIG.default;
              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markOne(n._id)}
                  style={{
                    padding: "12px 18px",
                    borderBottom: "1px solid var(--glass-border)",
                    background: n.isRead ? "transparent" : `${cfg.color}08`,
                    cursor: n.isRead ? "default" : "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        paddingTop: 3,
                        flexShrink: 0,
                      }}
                    >
                      {!n.isRead ? (
                        <span
                          className={cfg.pulse ? "alert-pulse" : ""}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: cfg.color,
                            display: "block",
                          }}
                        />
                      ) : (
                        <span
                          style={{ width: 7, height: 7, display: "block" }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.83rem",
                          fontWeight: n.isRead ? 400 : 600,
                          marginBottom: 2,
                          color:
                            !n.isRead && cfg.pulse ? cfg.color : "var(--text)",
                        }}
                      >
                        {n.title}
                      </div>
                      {n.body && (
                        <div
                          style={{ fontSize: "0.75rem", color: "var(--muted)" }}
                        >
                          {n.body}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--faint)",
                          marginTop: 4,
                        }}
                      >
                        {fmtTime(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
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
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    setShowMobileSidebar(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSignedIn) return;
    function fetchCount() {
      fetch("/api/notifications?limit=50&unreadOnly=true")
        .then((r) => r.json())
        .then((j) => {
          if (j.success) {
            setUnreadCount(j.unreadCount || 0);
            const urgent = (j.data || []).filter((n) =>
              ["rent_overdue", "task_overdue", "rule_broken"].includes(n.type)
            ).length;
            setUrgentCount(urgent);
          }
        })
        .catch(() => {});
    }
    fetchCount();
    const iv = setInterval(fetchCount, 30000);
    return () => clearInterval(iv);
  }, [isSignedIn]);

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

  function SidebarContent({ onLinkClick }) {
    return (
      <>
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {houseId ? (
            <>
              <Link
                href="/dashboard"
                onClick={onLinkClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 12px",
                  borderRadius: 8,
                  marginBottom: 10,
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
                    onClick={onLinkClick}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 10,
                      marginBottom: 1,
                      fontSize: "0.845rem",
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--text)" : "var(--muted)",
                      background: active
                        ? "var(--glass-bg-mid)"
                        : "transparent",
                      textDecoration: "none",
                      transition: "all 0.12s",
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
                  onClick={onLinkClick}
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

        {/* Bottom */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid var(--glass-border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              setShowNotifications(true);
              setUrgentCount(0);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 10px",
              borderRadius: 10,
              marginBottom: 10,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div style={{ position: "relative" }}>
              <Bell
                size={16}
                color={
                  urgentCount > 0
                    ? "#f87171"
                    : unreadCount > 0
                      ? "var(--accent)"
                      : "var(--muted)"
                }
              />
              {unreadCount > 0 && (
                <span
                  className={urgentCount > 0 ? "alert-pulse-badge" : ""}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -6,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    background: urgentCount > 0 ? "#f87171" : "var(--accent)",
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
                color: urgentCount > 0 ? "#f87171" : "var(--muted)",
                fontWeight: urgentCount > 0 ? 600 : 400,
              }}
            >
              Notifications
            </span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UserButton afterSignOutUrl="/" />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              My Account
            </span>
          </div>
        </div>
      </>
    );
  }

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

      {/* ── Mobile overlay sidebar ── */}
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
            style={{
              width: 240,
              background: "var(--bg-mid)",
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--glass-border)",
            }}
            onClick={(e) => e.stopPropagation()}
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
                onClick={() => setShowMobileSidebar(false)}
              >
                <Image
                  src="/favicon.png"
                  alt="Homify"
                  width={24}
                  height={24}
                  style={{ borderRadius: 5, objectFit: "cover" }}
                />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "var(--text)",
                  }}
                >
                  Homify
                </span>
              </Link>
              <button
                onClick={() => setShowMobileSidebar(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setShowMobileSidebar(false)} />
          </div>
        </div>
      )}

      {/* ── FIXED desktop sidebar ── */}
      <div
        className="desktop-sidebar"
        style={{
          width: 220,
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          background: "var(--bg-mid)",
          borderRight: "1px solid var(--glass-border)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "18px 20px 16px",
            borderBottom: "1px solid var(--glass-border)",
            flexShrink: 0,
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
              alt="Homify"
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
              Homify
            </span>
          </Link>
        </div>
        <SidebarContent onLinkClick={undefined} />
      </div>

      {/* ── Main content — offset by sidebar width ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        <div
          className="mobile-topbar"
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
                alt="Homify"
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
                Homify
              </span>
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => {
                setShowNotifications(true);
                setUrgentCount(0);
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
              <Bell
                size={18}
                color={urgentCount > 0 ? "#f87171" : "var(--muted)"}
              />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: urgentCount > 0 ? "#f87171" : "var(--accent)",
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

        <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <div style={{ padding: "clamp(16px, 4vw, 28px)" }}>{children}</div>
        </main>
      </div>

      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
          onRead={(n) => setUnreadCount(n)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          /* offset main content for fixed sidebar */
          .desktop-sidebar ~ div { margin-left: 220px; }
        }
        /* Alert pulse animation */
        @keyframes alertPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(248,113,113,0.7); }
          50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(248,113,113,0); }
        }
        .alert-pulse {
          animation: alertPulse 1.5s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.6); }
          50% { box-shadow: 0 0 0 4px rgba(248,113,113,0); }
        }
        .alert-pulse-badge {
          animation: badgePulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
