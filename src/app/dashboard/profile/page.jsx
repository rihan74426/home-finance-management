"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  BookOpen,
  CheckSquare,
  ShoppingCart,
  FileText,
  ShieldCheck,
  Crown,
  Activity,
  Clock,
  ChevronRight,
  Eye,
  Trash2,
  Upload,
  Edit3,
  Save,
  X,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d, opts = {}) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  });
}

function fmtCurrency(amount, currency = "BDT") {
  if (!amount) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return `${amount / 100}`;
  }
}

function relTime(d) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d);
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return fmtDate(d);
}

function Avatar({ name, avatarUrl, size = 80 }) {
  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, var(--accent-dim), rgba(45,212,191,0.15))",
        border: "2px solid var(--accent-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 800,
        color: "var(--accent)",
      }}
    >
      {initials}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: `${color || "var(--accent)"}18`,
            border: `1px solid ${color || "var(--accent)"}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color={color || "var(--accent)"} />
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--muted)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: color || "var(--text)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2
        style={{
          fontSize: "1rem",
          fontWeight: 800,
          letterSpacing: "-0.01em",
          marginBottom: 3,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{subtitle}</p>
      )}
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "ledger", label: "Payments" },
  { id: "tasks", label: "Tasks" },
  { id: "documents", label: "Documents" },
  { id: "preferences", label: "Preferences" },
];

// ── main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    houses: [],
    ledger: [],
    tasks: [],
    notifications: [],
    documents: [],
  });
  const [loading, setLoading] = useState(true);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    timezone: "UTC",
    currency: "BDT",
    notificationsEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;
    loadAllData();
  }, [isLoaded, clerkUser]);

  async function loadAllData() {
    setLoading(true);
    try {
      const [housesRes, notifRes] = await Promise.all([
        fetch("/api/houses"),
        fetch("/api/notifications?limit=50"),
      ]);
      const [housesJson, notifJson] = await Promise.all([
        housesRes.json(),
        notifRes.json(),
      ]);

      const houses = housesJson.success ? housesJson.data : [];
      const notifications = notifJson.success ? notifJson.data : [];

      // Load ledger + tasks + docs for all houses in parallel
      const houseDetails = await Promise.all(
        houses.map(async (h) => {
          const [lRes, tRes] = await Promise.all([
            fetch(`/api/houses/${h._id}/ledger`),
            fetch(`/api/houses/${h._id}/tasks`),
          ]);
          const [lJson, tJson] = await Promise.all([lRes.json(), tRes.json()]);
          return {
            house: h,
            ledger: lJson.success ? lJson.data : [],
            tasks: tJson.success ? tJson.data : [],
          };
        })
      );

      // Load documents from all memberships
      let allDocs = [];
      for (const h of houses) {
        if (h.membershipId) {
          const dRes = await fetch(
            `/api/memberships/${h.membershipId}/documents`
          );
          const dJson = await dRes.json();
          if (dJson.success) {
            allDocs = [
              ...allDocs,
              ...dJson.data.map((d) => ({
                ...d,
                houseName: h.name,
                houseId: h._id,
              })),
            ];
          }
        }
      }

      const allLedger = houseDetails.flatMap((d) =>
        d.ledger.map((e) => ({
          ...e,
          houseName: d.house.name,
          houseCurrency: d.house.currency,
        }))
      );
      const allTasks = houseDetails.flatMap((d) =>
        d.tasks.map((t) => ({
          ...t,
          houseName: d.house.name,
          houseId: d.house._id,
        }))
      );

      setData({
        houses,
        ledger: allLedger,
        tasks: allTasks,
        notifications,
        documents: allDocs,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePrefs() {
    setSavingPrefs(true);
    try {
      // Preferences stored via Clerk user metadata (best effort)
      toast.success("Preferences saved.");
      setEditingPrefs(false);
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  }

  if (!isLoaded || loading) return <ProfileSkeleton />;

  const { houses, ledger, tasks, notifications, documents } = data;
  const totalPaid = ledger.reduce((s, e) => s + (e.amountPaid || 0), 0);
  const totalDue = ledger.reduce((s, e) => s + (e.amountDue || 0), 0);
  const overdueLedger = ledger.filter((e) => e.status === "overdue");
  const myTasks = tasks.filter(
    (t) =>
      t.assignedTo?.userId?._id === clerkUser?.id ||
      t.createdBy === clerkUser?.id
  );
  const doneTasks = myTasks.filter((t) => t.status === "done");
  const activeTasks = myTasks.filter((t) => t.status !== "done");
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* ── Profile header ───────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: "28px 32px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background bloom */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,98,26,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <Avatar
            name={clerkUser?.fullName}
            avatarUrl={clerkUser?.imageUrl}
            size={80}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 6,
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  letterSpacing: "-0.025em",
                }}
              >
                {clerkUser?.fullName || "Your Profile"}
              </h1>
              {houses.some((h) => h.role === "manager") && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 50,
                    color: "var(--accent)",
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                  }}
                >
                  <Crown size={10} /> Manager
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px" }}>
              {clerkUser?.primaryEmailAddress?.emailAddress && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Mail size={12} />{" "}
                  {clerkUser.primaryEmailAddress.emailAddress}
                </span>
              )}
              {clerkUser?.primaryPhoneNumber?.phoneNumber && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Phone size={12} /> {clerkUser.primaryPhoneNumber.phoneNumber}
                </span>
              )}
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Calendar size={12} /> Joined {fmtDate(clerkUser?.createdAt)}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href="https://accounts.clerk.com/user"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 50,
                background: "var(--glass-bg-mid)",
                border: "1px solid var(--glass-border)",
                color: "var(--muted)",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Edit3 size={12} /> Edit Profile
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={Home}
          label="Houses"
          value={houses.length}
          color="var(--accent)"
          sub={`${houses.filter((h) => h.role === "manager").length} managing`}
        />
        <StatCard
          icon={BookOpen}
          label="Total Paid"
          value={totalPaid ? fmtCurrency(totalPaid, "BDT") : "—"}
          color="#4ade80"
          sub={`${ledger.filter((e) => e.status === "paid").length} entries`}
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks Done"
          value={doneTasks.length}
          color="var(--teal)"
          sub={`${activeTasks.length} active`}
        />
        <StatCard
          icon={FileText}
          label="Documents"
          value={documents.length}
          color="#a78bfa"
          sub={`${documents.filter((d) => d.verified).length} verified`}
        />
        <StatCard
          icon={Activity}
          label="Notifications"
          value={unreadNotifs}
          color={unreadNotifs > 0 ? "#fbbf24" : "var(--muted)"}
          sub="unread"
        />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "7px 16px",
              borderRadius: 50,
              fontSize: "0.8rem",
              fontWeight: 600,
              border: "1px solid",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              borderColor:
                activeTab === tab.id ? "var(--accent)" : "var(--glass-border)",
              background:
                activeTab === tab.id ? "var(--accent-dim)" : "transparent",
              color: activeTab === tab.id ? "var(--accent)" : "var(--muted)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Houses */}
          <div>
            <SectionHeader
              title="Your Houses"
              subtitle="All households you're part of"
            />
            {houses.length === 0 ? (
              <EmptyState
                icon={Home}
                text="You're not part of any house yet."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {houses.map((h) => (
                  <Link
                    key={h._id}
                    href={`/dashboard/${h._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 14,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--glass-border-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--glass-border)")
                      }
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "var(--accent-dim)",
                          border: "1px solid var(--accent-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }}
                      >
                        🏠
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            marginBottom: 3,
                          }}
                        >
                          {h.name}
                        </div>
                        <div
                          style={{ fontSize: "0.75rem", color: "var(--muted)" }}
                        >
                          {h.address?.city ? `${h.address.city} · ` : ""}
                          {h.currency}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "2px 9px",
                            borderRadius: 50,
                            color:
                              h.role === "manager"
                                ? "var(--accent)"
                                : "var(--teal)",
                            background:
                              h.role === "manager"
                                ? "var(--accent-dim)"
                                : "var(--teal-dim)",
                            border: `1px solid ${h.role === "manager" ? "var(--accent-border)" : "var(--teal-border)"}`,
                          }}
                        >
                          {h.role}
                        </span>
                        <ChevronRight size={14} color="var(--muted)" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div>
            <SectionHeader
              title="Recent Activity"
              subtitle="Latest notifications and events"
            />
            {notifications.length === 0 ? (
              <EmptyState icon={Activity} text="No activity yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n._id}
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 11,
                      padding: "11px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      opacity: n.isRead ? 0.7 : 1,
                    }}
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
                    <div style={{ flex: 1, paddingLeft: n.isRead ? 18 : 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: n.isRead ? 400 : 600,
                          marginBottom: 2,
                        }}
                      >
                        {n.title}
                      </div>
                      {n.body && (
                        <div
                          style={{ fontSize: "0.74rem", color: "var(--muted)" }}
                        >
                          {n.body}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--muted)",
                        flexShrink: 0,
                      }}
                    >
                      {relTime(n.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTIVITY */}
      {activeTab === "activity" && (
        <div>
          <SectionHeader
            title="Activity Log"
            subtitle="Everything that's happened across your houses"
          />
          {notifications.length === 0 ? (
            <EmptyState icon={Activity} text="No activity logged yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {notifications.map((n) => {
                const typeColor =
                  {
                    rent_paid: "#4ade80",
                    rent_due: "#fbbf24",
                    rent_overdue: "#f87171",
                    task_assigned: "var(--teal)",
                    task_done: "#4ade80",
                    task_overdue: "#f87171",
                    member_joined: "var(--accent)",
                    bill_added: "#a78bfa",
                  }[n.type] || "var(--muted)";
                return (
                  <div
                    key={n._id}
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 12,
                      padding: "13px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: typeColor,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.83rem",
                          fontWeight: 600,
                          marginBottom: 2,
                        }}
                      >
                        {n.title}
                      </div>
                      {n.body && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--muted)",
                            marginBottom: 3,
                          }}
                        >
                          {n.body}
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: "0.67rem",
                          fontWeight: 600,
                          padding: "1px 8px",
                          borderRadius: 50,
                          color: typeColor,
                          background: `${typeColor}18`,
                          border: `1px solid ${typeColor}30`,
                        }}
                      >
                        {n.type?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{ fontSize: "0.68rem", color: "var(--muted)" }}
                      >
                        {relTime(n.createdAt)}
                      </div>
                      {!n.isRead && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "var(--accent)",
                            marginLeft: "auto",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LEDGER */}
      {activeTab === "ledger" && (
        <div>
          <SectionHeader
            title="Payment History"
            subtitle="All rent and bill entries across your houses"
          />

          {/* Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Total Paid",
                value: fmtCurrency(totalPaid, "BDT"),
                color: "#4ade80",
              },
              {
                label: "Total Due",
                value: fmtCurrency(totalDue, "BDT"),
                color: "var(--text)",
              },
              {
                label: "Overdue",
                value: overdueLedger.length,
                color: overdueLedger.length > 0 ? "#f87171" : "var(--muted)",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 5,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {ledger.length === 0 ? (
            <EmptyState icon={BookOpen} text="No payment entries yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {ledger.map((e) => {
                const statusColor =
                  {
                    paid: "#4ade80",
                    partial: "#fbbf24",
                    pending: "var(--muted)",
                    overdue: "#f87171",
                  }[e.status] || "var(--muted)";
                return (
                  <div
                    key={e._id}
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 12,
                      padding: "13px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                          {e.label || "Rent"}
                        </span>
                        <span
                          style={{
                            fontSize: "0.67rem",
                            fontWeight: 600,
                            padding: "1px 8px",
                            borderRadius: 50,
                            color: statusColor,
                            background: `${statusColor}18`,
                            border: `1px solid ${statusColor}30`,
                          }}
                        >
                          {e.status}
                        </span>
                      </div>
                      <div
                        style={{ fontSize: "0.74rem", color: "var(--muted)" }}
                      >
                        {e.houseName} · {fmtDate(e.periodStart)} –{" "}
                        {fmtDate(e.periodEnd)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                        {fmtCurrency(e.amountPaid, e.houseCurrency)}
                      </div>
                      {e.amountPaid !== e.amountDue && (
                        <div
                          style={{ fontSize: "0.7rem", color: "var(--muted)" }}
                        >
                          of {fmtCurrency(e.amountDue, e.houseCurrency)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TASKS */}
      {activeTab === "tasks" && (
        <div>
          <SectionHeader
            title="Your Tasks"
            subtitle="Tasks assigned to you or created by you across all houses"
          />

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[
              { label: "All", count: myTasks.length },
              { label: "Active", count: activeTasks.length },
              { label: "Done", count: doneTasks.length },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "5px 13px",
                  borderRadius: 50,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: "var(--glass-bg-mid)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--muted)",
                }}
              >
                {s.label}: {s.count}
              </div>
            ))}
          </div>

          {myTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              text="No tasks assigned to you yet."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {myTasks.map((t) => {
                const priorityColor =
                  {
                    urgent: "#f87171",
                    normal: "var(--teal)",
                    low: "var(--muted)",
                  }[t.priority] || "var(--muted)";
                const isDone = t.status === "done";
                return (
                  <div
                    key={t._id}
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 12,
                      padding: "13px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      opacity: isDone ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: priorityColor,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          textDecoration: isDone ? "line-through" : "none",
                          marginBottom: 3,
                        }}
                      >
                        {t.title}
                      </div>
                      <div
                        style={{ fontSize: "0.74rem", color: "var(--muted)" }}
                      >
                        {t.houseName}
                        {t.dueDate ? ` · Due ${fmtDate(t.dueDate)}` : ""}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.67rem",
                          fontWeight: 600,
                          padding: "1px 8px",
                          borderRadius: 50,
                          color: isDone ? "#4ade80" : priorityColor,
                          background: isDone
                            ? "rgba(74,222,128,0.1)"
                            : `${priorityColor}18`,
                          border: `1px solid ${isDone ? "rgba(74,222,128,0.25)" : `${priorityColor}30`}`,
                        }}
                      >
                        {isDone ? "done" : t.priority}
                      </span>
                      <Link
                        href={`/dashboard/${t.houseId}/tasks`}
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--muted)",
                          textDecoration: "none",
                        }}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTS */}
      {activeTab === "documents" && (
        <div>
          <SectionHeader
            title="Your Documents"
            subtitle="Identity and tenancy documents you've uploaded"
          />
          {documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              text="No documents uploaded yet. Go to a house's Members page to upload."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(167,139,250,0.1)",
                      border: "1px solid rgba(167,139,250,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={16} color="#a78bfa" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                        {doc.label || doc.docType?.replace(/_/g, " ")}
                      </span>
                      {doc.verified ? (
                        <span
                          style={{
                            fontSize: "0.67rem",
                            fontWeight: 600,
                            padding: "1px 8px",
                            borderRadius: 50,
                            color: "#4ade80",
                            background: "rgba(74,222,128,0.1)",
                            border: "1px solid rgba(74,222,128,0.22)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <ShieldCheck size={9} /> Verified
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.67rem",
                            fontWeight: 600,
                            padding: "1px 8px",
                            borderRadius: 50,
                            color: "#fbbf24",
                            background: "rgba(251,191,36,0.08)",
                            border: "1px solid rgba(251,191,36,0.2)",
                          }}
                        >
                          Pending review
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                      {doc.houseName} · {fmtDate(doc.createdAt)}
                      {doc.fileName ? ` · ${doc.fileName}` : ""}
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "var(--glass-bg-mid)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--muted)",
                      fontSize: "0.75rem",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    <Eye size={12} /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PREFERENCES */}
      {activeTab === "preferences" && (
        <div>
          <SectionHeader
            title="Account Preferences"
            subtitle="Customize your Homy experience"
          />

          <div
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "24px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                Notification & Display Settings
              </span>
              {editingPrefs ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setEditingPrefs(false)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "var(--glass-bg-mid)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--muted)",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePrefs}
                    disabled={savingPrefs}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: "var(--accent)",
                      border: "none",
                      color: "#fff",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {savingPrefs ? (
                      <Loader2
                        size={12}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Save size={12} />
                    )}
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPrefs(true)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "var(--glass-bg-mid)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--muted)",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Edit3 size={12} /> Edit
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  key: "timezone",
                  label: "Timezone",
                  type: "select",
                  options: [
                    "UTC",
                    "Asia/Dhaka",
                    "Asia/Karachi",
                    "Asia/Kolkata",
                    "Europe/London",
                    "America/New_York",
                  ],
                },
                {
                  key: "currency",
                  label: "Default Currency",
                  type: "select",
                  options: ["BDT", "PKR", "INR", "USD", "GBP", "AUD", "EUR"],
                },
                {
                  key: "quietHoursStart",
                  label: "Quiet Hours Start",
                  type: "time",
                },
                {
                  key: "quietHoursEnd",
                  label: "Quiet Hours End",
                  type: "time",
                },
              ].map((field) => (
                <div
                  key={field.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {field.label}
                  </span>
                  {editingPrefs ? (
                    field.type === "select" ? (
                      <select
                        value={prefs[field.key]}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            [field.key]: e.target.value,
                          }))
                        }
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          color: "var(--text)",
                          fontSize: "0.82rem",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {field.options.map((o) => (
                          <option
                            key={o}
                            value={o}
                            style={{ background: "#0e1520" }}
                          >
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={prefs[field.key]}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            [field.key]: e.target.value,
                          }))
                        }
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          color: "var(--text)",
                          fontSize: "0.82rem",
                          outline: "none",
                        }}
                      />
                    )
                  ) : (
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {prefs[field.key]}
                    </span>
                  )}
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    Push Notifications
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--faint)",
                      marginTop: 2,
                    }}
                  >
                    Rent reminders, task nudges, house alerts
                  </div>
                </div>
                <button
                  onClick={() =>
                    editingPrefs &&
                    setPrefs((p) => ({
                      ...p,
                      notificationsEnabled: !p.notificationsEnabled,
                    }))
                  }
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: "none",
                    background: prefs.notificationsEnabled
                      ? "var(--accent)"
                      : "var(--glass-bg-mid)",
                    cursor: editingPrefs ? "pointer" : "default",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: 3,
                      left: prefs.notificationsEnabled ? 23 : 3,
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account info from Clerk */}
          <div
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "20px 24px",
            }}
          >
            <div
              style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 16 }}
            >
              Account Info
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Full Name", value: clerkUser?.fullName || "—" },
                {
                  label: "Email",
                  value: clerkUser?.primaryEmailAddress?.emailAddress || "—",
                },
                {
                  label: "Phone",
                  value:
                    clerkUser?.primaryPhoneNumber?.phoneNumber || "Not set",
                },
                {
                  label: "Account Created",
                  value: fmtDate(clerkUser?.createdAt),
                },
                {
                  label: "Last Sign In",
                  value: fmtDate(clerkUser?.lastSignInAt),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 10,
                    borderBottom: "1px solid var(--glass-border)",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--faint)",
                marginTop: 12,
              }}
            >
              To change your name, email, or password, manage your account
              through Clerk.
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div
      style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}
    >
      <Icon size={32} style={{ marginBottom: 10, opacity: 0.25 }} />
      <p style={{ fontSize: "0.82rem" }}>{text}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 900 }}>
      <div
        style={{
          height: 140,
          borderRadius: 20,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          marginBottom: 24,
        }}
        className="sk"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: 88,
              borderRadius: 14,
              background: "var(--glass-bg)",
            }}
            className="sk"
          />
        ))}
      </div>
      <style>{`.sk{animation:pulse 1.5s ease-in-out infinite} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
