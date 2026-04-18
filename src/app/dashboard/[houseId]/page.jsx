"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  CheckSquare,
  ShoppingCart,
  MessageSquare,
  Users,
  Zap,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  Calendar,
  Flag,
} from "lucide-react";

// ── Tiny skeleton pulse ───────────────────────────────────────────────────────
function Pulse({ w = "100%", h = 14, r = 6, style = {} }) {
  return (
    <div
      className="sk"
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "var(--glass-bg-mid)",
        ...style,
      }}
    />
  );
}

// ── Currency formatter ────────────────────────────────────────────────────────
function fmtCurrency(amount, currency) {
  if (amount == null || amount === 0) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "BDT",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return `${amount / 100}`;
  }
}

// ── Relative date ────────────────────────────────────────────────────────────
function relDate(d) {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: "#f87171" };
  if (diff === 0) return { text: "Due today", color: "#fbbf24" };
  if (diff === 1) return { text: "Tomorrow", color: "#fbbf24" };
  return {
    text: new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    color: "var(--muted)",
  };
}

// ── Section card shell ────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  label,
  href,
  houseId,
  accent,
  children,
  loading,
  empty,
  emptyText,
}) {
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon size={16} color={accent || "var(--accent)"} />
          <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{label}</span>
        </div>
        <Link
          href={`/dashboard/${houseId}/${href}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            color: "var(--muted)",
            textDecoration: "none",
            padding: "4px 10px",
            borderRadius: 50,
            border: "1px solid var(--glass-border)",
            background: "var(--glass-bg-mid)",
          }}
        >
          View all <ChevronRight size={11} />
        </Link>
      </div>
      <div style={{ padding: loading || empty ? "20px 18px" : "12px 18px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Pulse h={13} w="80%" />
            <Pulse h={13} w="60%" />
          </div>
        ) : empty ? (
          <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
            {emptyText || "Nothing yet."}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ label, value, color }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        borderRadius: 10,
        padding: "10px 14px",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: "0.68rem",
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.1rem",
          fontWeight: 800,
          color: color || "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function HouseOverviewPage() {
  const { houseId } = useParams();

  const [house, setHouse] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [grocery, setGrocery] = useState(null);
  const [members, setMembers] = useState(null);
  const [bills, setBills] = useState(null);
  const [threads, setThreads] = useState(null);

  const [loading, setLoading] = useState({
    house: true,
    ledger: true,
    tasks: true,
    grocery: true,
    members: true,
    bills: true,
    threads: true,
  });

  function setDone(key) {
    setLoading((p) => ({ ...p, [key]: false }));
  }

  useEffect(() => {
    // Parallel fetch — each sets its own state independently
    fetch(`/api/houses/${houseId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setHouse(j.data);
      })
      .finally(() => setDone("house"));

    fetch(`/api/houses/${houseId}/ledger`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setLedger({ entries: j.data, isManager: j.isManager });
      })
      .finally(() => setDone("ledger"));

    fetch(`/api/houses/${houseId}/tasks`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setTasks(j.data);
      })
      .finally(() => setDone("tasks"));

    fetch(`/api/houses/${houseId}/grocery?showBought=false`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setGrocery(j.data);
      })
      .finally(() => setDone("grocery"));

    fetch(`/api/houses/${houseId}/members`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setMembers(j.data);
      })
      .finally(() => setDone("members"));

    fetch(`/api/houses/${houseId}/bills`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setBills({ bills: j.data, isManager: j.isManager });
      })
      .finally(() => setDone("bills"));

    fetch(`/api/houses/${houseId}/threads`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setThreads(j.data);
      })
      .finally(() => setDone("threads"));
  }, [houseId]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeTasks = tasks ? tasks.filter((t) => t.status !== "done") : [];
  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date()
  );
  const urgentTasks = activeTasks.filter((t) => t.priority === "urgent");

  const overdueEntries = ledger
    ? ledger.entries.filter((e) => e.status === "overdue")
    : [];
  const pendingEntries = ledger
    ? ledger.entries.filter((e) => e.status === "pending")
    : [];
  const totalCollected = ledger
    ? ledger.entries.reduce((s, e) => s + (e.amountPaid || 0), 0)
    : 0;
  const totalOutstanding = ledger
    ? ledger.entries.reduce(
        (s, e) => s + Math.max(0, (e.amountDue || 0) - (e.amountPaid || 0)),
        0
      )
    : 0;

  const unsplitBills = bills ? bills.bills.filter((b) => !b.isSplit) : [];
  const groceryItems = grocery ? grocery.slice(0, 4) : [];

  const recentThread = threads
    ? [...threads].sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      )[0]
    : null;

  const houseLoading = loading.house;
  const currency = house?.currency || "BDT";

  return (
    <div>
      {/* ── House header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        {houseLoading ? (
          <>
            <Pulse w={200} h={26} style={{ marginBottom: 8 }} />
            <Pulse w={160} h={13} />
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  letterSpacing: "-0.025em",
                }}
              >
                {house?.name}
              </h1>
              <Link
                href={`/dashboard/${houseId}/settings`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 50,
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg-mid)",
                  color: "var(--muted)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Settings size={12} /> Settings
              </Link>
            </div>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.82rem",
                marginTop: 4,
              }}
            >
              {house?.address?.city ? `${house.address.city} · ` : ""}
              {currency} · {members?.length || "—"} member
              {members?.length !== 1 ? "s" : ""} · Rent due day{" "}
              {house?.rentDueDay}
            </p>
          </>
        )}
      </div>

      {/* ── Alert strip — overdue / urgent items ─────────────────────────── */}
      {(overdueEntries.length > 0 ||
        overdueTasks.length > 0 ||
        unsplitBills.length > 0) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {overdueEntries.length > 0 && (
            <Link
              href={`/dashboard/${houseId}/ledger`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 14px",
                  borderRadius: 50,
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  color: "#f87171",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={13} /> {overdueEntries.length} overdue
                payment{overdueEntries.length !== 1 ? "s" : ""}
              </div>
            </Link>
          )}
          {overdueTasks.length > 0 && (
            <Link
              href={`/dashboard/${houseId}/tasks`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 14px",
                  borderRadius: 50,
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  color: "#fbbf24",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                <Clock size={13} /> {overdueTasks.length} overdue task
                {overdueTasks.length !== 1 ? "s" : ""}
              </div>
            </Link>
          )}
          {unsplitBills.length > 0 && (
            <Link
              href={`/dashboard/${houseId}/bills`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 14px",
                  borderRadius: 50,
                  background: "rgba(232,98,26,0.08)",
                  border: "1px solid rgba(232,98,26,0.25)",
                  color: "var(--accent)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                <Zap size={13} /> {unsplitBills.length} bill
                {unsplitBills.length !== 1 ? "s" : ""} need splitting
              </div>
            </Link>
          )}
        </div>
      )}

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
        {/* LEDGER */}
        <SectionCard
          icon={BookOpen}
          label="Rent Ledger"
          href="ledger"
          houseId={houseId}
          loading={loading.ledger}
          empty={!loading.ledger && ledger?.entries.length === 0}
          emptyText="No payments logged yet."
        >
          {ledger && ledger.isManager && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Stat
                label="Collected"
                value={fmtCurrency(totalCollected, currency) || "—"}
                color="#4ade80"
              />
              <Stat
                label="Outstanding"
                value={fmtCurrency(totalOutstanding, currency) || "—"}
                color={totalOutstanding > 0 ? "#fbbf24" : "var(--muted)"}
              />
            </div>
          )}
          {ledger &&
            ledger.entries.slice(0, 3).map((e) => {
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 8,
                    marginBottom: 8,
                    borderBottom: "1px solid var(--glass-border)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      {e.label || "Rent"}
                    </div>
                    {e.membershipId?.userId && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--teal)",
                          marginTop: 1,
                        }}
                      >
                        {e.membershipId.userId.name}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 50,
                      color: statusColor,
                      background: `${statusColor}18`,
                      border: `1px solid ${statusColor}30`,
                    }}
                  >
                    {e.status}
                  </span>
                </div>
              );
            })}
        </SectionCard>

        {/* BILLS */}
        <SectionCard
          icon={Zap}
          label="Bills"
          href="bills"
          houseId={houseId}
          loading={loading.bills}
          empty={!loading.bills && bills?.bills.length === 0}
          emptyText="No bills added yet."
        >
          {bills && (
            <>
              {bills.bills.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <Stat label="Total" value={bills.bills.length} />
                  <Stat
                    label="Split"
                    value={bills.bills.filter((b) => b.isSplit).length}
                    color="#4ade80"
                  />
                  <Stat
                    label="Pending"
                    value={unsplitBills.length}
                    color={unsplitBills.length > 0 ? "#fbbf24" : "var(--muted)"}
                  />
                </div>
              )}
              {bills.bills.slice(0, 3).map((b) => {
                const typeIcons = {
                  electricity: "⚡",
                  water: "💧",
                  internet: "📶",
                  gas: "🔥",
                  maintenance: "🔧",
                  garbage: "🗑️",
                  cable: "📺",
                  other: "📦",
                };
                return (
                  <div
                    key={b._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: 8,
                      marginBottom: 8,
                      borderBottom: "1px solid var(--glass-border)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: "1rem" }}>
                        {typeIcons[b.type] || "📦"}
                      </span>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                          {b.label || b.type}
                        </div>
                        <div
                          style={{ fontSize: "0.7rem", color: "var(--muted)" }}
                        >
                          {new Date(b.periodEnd).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 50,
                        color: b.isSplit ? "#4ade80" : "#fbbf24",
                        background: b.isSplit
                          ? "rgba(74,222,128,0.1)"
                          : "rgba(251,191,36,0.1)",
                        border: `1px solid ${b.isSplit ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.25)"}`,
                      }}
                    >
                      {b.isSplit ? "Split" : "Not split"}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </SectionCard>

        {/* TASKS */}
        <SectionCard
          icon={CheckSquare}
          label="Tasks"
          href="tasks"
          houseId={houseId}
          loading={loading.tasks}
          empty={!loading.tasks && tasks?.length === 0}
          emptyText="No tasks yet."
        >
          {tasks && (
            <>
              {tasks.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <Stat label="Active" value={activeTasks.length} />
                  <Stat
                    label="Urgent"
                    value={urgentTasks.length}
                    color={urgentTasks.length > 0 ? "#f87171" : "var(--muted)"}
                  />
                  <Stat
                    label="Done"
                    value={tasks.filter((t) => t.status === "done").length}
                    color="#4ade80"
                  />
                </div>
              )}
              {activeTasks.slice(0, 3).map((t) => {
                const due = t.dueDate ? relDate(t.dueDate) : null;
                const pColor =
                  {
                    urgent: "#f87171",
                    normal: "var(--teal)",
                    low: "var(--muted)",
                  }[t.priority] || "var(--muted)";
                return (
                  <div
                    key={t._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      paddingBottom: 8,
                      marginBottom: 8,
                      borderBottom: "1px solid var(--glass-border)",
                    }}
                  >
                    <Flag size={11} color={pColor} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.title}
                      </div>
                      {t.assignedTo?.userId && (
                        <div
                          style={{ fontSize: "0.7rem", color: "var(--muted)" }}
                        >
                          {t.assignedTo.userId.name}
                        </div>
                      )}
                    </div>
                    {due && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: due.color,
                          flexShrink: 0,
                          fontWeight: 600,
                        }}
                      >
                        {due.text}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </SectionCard>

        {/* GROCERY */}
        <SectionCard
          icon={ShoppingCart}
          label="Grocery List"
          href="grocery"
          houseId={houseId}
          loading={loading.grocery}
          empty={!loading.grocery && grocery?.length === 0}
          emptyText="List is empty."
        >
          {grocery && grocery.length > 0 && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Stat label="Items to get" value={grocery.length} />
              </div>
              {groceryItems.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 7,
                    marginBottom: 7,
                    borderBottom: "1px solid var(--glass-border)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      {item.name}
                    </span>
                    {item.quantity && (
                      <span
                        style={{ fontSize: "0.68rem", color: "var(--muted)" }}
                      >
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--muted)",
                      background: "var(--glass-bg-mid)",
                      padding: "1px 7px",
                      borderRadius: 50,
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              ))}
              {grocery.length > 4 && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                    marginTop: 4,
                  }}
                >
                  +{grocery.length - 4} more items
                </div>
              )}
            </>
          )}
        </SectionCard>

        {/* MEMBERS */}
        <SectionCard
          icon={Users}
          label="Members"
          href="members"
          houseId={houseId}
          loading={loading.members}
          empty={!loading.members && members?.length === 0}
          emptyText="No members yet."
        >
          {members && members.length > 0 && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Stat label="Total" value={members.length} />
                <Stat
                  label="Managers"
                  value={members.filter((m) => m.role === "manager").length}
                  color="var(--accent)"
                />
                <Stat
                  label="Members"
                  value={members.filter((m) => m.role === "member").length}
                  color="var(--teal)"
                />
              </div>
              {members.slice(0, 4).map((m) => {
                const badgeColor = {
                  manager: "var(--accent)",
                  member: "var(--teal)",
                  guest: "var(--muted)",
                }[m.role];
                const initials =
                  m.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "?";
                return (
                  <div
                    key={m.membershipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      paddingBottom: 8,
                      marginBottom: 8,
                      borderBottom: "1px solid var(--glass-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--accent-dim)",
                        border: "1px solid var(--accent-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {m.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: badgeColor,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {m.role}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </SectionCard>

        {/* CHAT */}
        <SectionCard
          icon={MessageSquare}
          label="Chat"
          href="chat"
          houseId={houseId}
          loading={loading.threads}
          empty={!loading.threads && threads?.length === 0}
          emptyText="No channels yet."
        >
          {threads && threads.length > 0 && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Stat label="Channels" value={threads.length} />
              </div>
              {[...threads]
                .sort(
                  (a, b) =>
                    new Date(b.lastMessageAt || 0) -
                    new Date(a.lastMessageAt || 0)
                )
                .slice(0, 4)
                .map((t) => (
                  <div
                    key={t._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      paddingBottom: 8,
                      marginBottom: 8,
                      borderBottom: "1px solid var(--glass-border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--muted)",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      #
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {t.name}
                      </div>
                      {t.lastMessageText && (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--muted)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.lastMessageText}
                        </div>
                      )}
                    </div>
                    {t.lastMessageAt && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--muted)",
                          flexShrink: 0,
                        }}
                      >
                        {new Date(t.lastMessageAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ))}
            </>
          )}
        </SectionCard>

        {/* VAULT */}
        <SectionCard
          icon={ShieldCheck}
          label="Vault"
          href="vault"
          houseId={houseId}
          loading={false}
          empty={false}
        >
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            WiFi passwords, door codes, lease docs, landlord contacts — all
            encrypted and accessible to your household.
          </p>
          <Link
            href={`/dashboard/${houseId}/vault`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginTop: 10,
              fontSize: "0.78rem",
              color: "var(--teal)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={12} /> Open Vault
          </Link>
        </SectionCard>
      </div>

      <style>{`.sk{animation:pulse 1.5s ease-in-out infinite} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
