"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  CheckSquare,
  ShoppingCart,
  MessageSquare,
  Zap,
  Users,
  Settings,
  Clock,
  AlertCircle,
  ChevronRight,
  Flag,
  TrendingUp,
} from "lucide-react";

// ── Simple in-memory cache (survives navigations in same session) ─────────────
const CACHE = {};
const CACHE_TTL = 30000; // 30s

function getCached(key) {
  const entry = CACHE[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    delete CACHE[key];
    return null;
  }
  return entry.data;
}
function setCache(key, data) {
  CACHE[key] = { data, ts: Date.now() };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtCurrency(amount, currency) {
  if (!amount) return null;
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

// ── Skeleton components ───────────────────────────────────────────────────────
function Pulse({ w = "100%", h = 14, r = 6, mb = 0 }) {
  return (
    <div
      className="sk"
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "var(--glass-bg-mid)",
        marginBottom: mb,
      }}
    />
  );
}

function CardSkeleton() {
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
          padding: "14px 18px",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Pulse w={16} h={16} r={4} />
          <Pulse w={80} h={13} />
        </div>
        <Pulse w={60} h={24} r={50} />
      </div>
      <div style={{ padding: "14px 18px" }}>
        <Pulse h={13} mb={8} />
        <Pulse w="75%" h={13} mb={8} />
        <Pulse w="55%" h={13} />
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div>
      <style>{`.sk{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {/* Header skeleton */}
      <div style={{ marginBottom: 28 }}>
        <Pulse w={220} h={28} r={6} mb={8} />
        <Pulse w={180} h={14} />
      </div>
      {/* Stats skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Pulse key={i} h={72} r={12} />
        ))}
      </div>
      {/* Cards grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ label, value, color, sub }) {
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 12,
        padding: "12px 16px",
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
        {label}
      </div>
      <div
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          color: color || "var(--text)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  label,
  href,
  houseId,
  accent,
  children,
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
          padding: "13px 18px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={15} color={accent || "var(--accent)"} />
          <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{label}</span>
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
      <div style={{ padding: "12px 18px", minHeight: 60 }}>
        {empty ? (
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--muted)",
              padding: "8px 0",
            }}
          >
            {emptyText || "Nothing yet."}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ── Row divider ───────────────────────────────────────────────────────────────
function RowDivider() {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--glass-border)",
        marginBottom: 8,
        paddingBottom: 8,
      }}
    />
  );
}

export default function HouseOverviewPage() {
  const { houseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Try cache first for instant render
    const cached = getCached(houseId);
    if (cached) {
      setData(cached);
      setLoading(false);
      // Refresh in background silently
      loadData(true);
    } else {
      loadData(false);
    }
  }, [houseId]);

  async function loadData(silent = false) {
    try {
      const [hRes, lRes, tRes, gRes, mRes, bRes, thRes] = await Promise.all([
        fetch(`/api/houses/${houseId}`),
        fetch(`/api/houses/${houseId}/ledger`),
        fetch(`/api/houses/${houseId}/tasks`),
        fetch(`/api/houses/${houseId}/grocery?showBought=false`),
        fetch(`/api/houses/${houseId}/members`),
        fetch(`/api/houses/${houseId}/bills`),
        fetch(`/api/houses/${houseId}/threads`),
      ]);
      const [hJson, lJson, tJson, gJson, mJson, bJson, thJson] =
        await Promise.all([
          hRes.json(),
          lRes.json(),
          tRes.json(),
          gRes.json(),
          mRes.json(),
          bRes.json(),
          thRes.json(),
        ]);

      const newData = {
        house: hJson.success ? hJson.data : null,
        ledger: lJson.success
          ? { entries: lJson.data, isManager: lJson.isManager }
          : null,
        tasks: tJson.success ? tJson.data : [],
        grocery: gJson.success ? gJson.data : [],
        members: mJson.success ? mJson.data : [],
        bills: bJson.success
          ? { bills: bJson.data, isManager: bJson.isManager }
          : null,
        threads: thJson.success ? thJson.data : [],
      };

      setCache(houseId, newData);
      setData(newData);
    } catch (e) {
      console.error("Overview load error:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  if (loading || !data) return <OverviewSkeleton />;

  const { house, ledger, tasks, grocery, members, bills, threads } = data;
  const currency = house?.currency || "BDT";

  // Derived stats
  const activeTasks = tasks.filter((t) => t.status !== "done");
  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date()
  );
  const urgentTasks = activeTasks.filter((t) => t.priority === "urgent");
  const overdueEntries = ledger
    ? ledger.entries.filter((e) => e.status === "overdue")
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
  const hasAlerts =
    overdueEntries.length > 0 ||
    overdueTasks.length > 0 ||
    unsplitBills.length > 0;

  return (
    <div>
      <style>{`.sk{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
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
        <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
          {house?.address?.city ? `${house.address.city} · ` : ""}
          {currency} · {members.length} member{members.length !== 1 ? "s" : ""}{" "}
          · Rent due day {house?.rentDueDay}
        </p>
      </div>

      {/* ── Alert banner ── */}
      {hasAlerts && (
        <div
          style={{
            background: "rgba(248,113,113,0.07)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span
            className="alert-pulse"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f87171",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#f87171",
              marginRight: 4,
            }}
          >
            Needs attention:
          </span>
          {overdueEntries.length > 0 && (
            <Link
              href={`/dashboard/${houseId}/ledger`}
              style={{ textDecoration: "none" }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 50,
                  color: "#f87171",
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.25)",
                }}
              >
                <AlertCircle
                  size={11}
                  style={{
                    display: "inline",
                    marginRight: 3,
                    verticalAlign: "middle",
                  }}
                />
                {overdueEntries.length} overdue payment
                {overdueEntries.length !== 1 ? "s" : ""}
              </span>
            </Link>
          )}
          {overdueTasks.length > 0 && (
            <Link
              href={`/dashboard/${houseId}/tasks`}
              style={{ textDecoration: "none" }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 50,
                  color: "#fbbf24",
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.25)",
                }}
              >
                <Clock
                  size={11}
                  style={{
                    display: "inline",
                    marginRight: 3,
                    verticalAlign: "middle",
                  }}
                />
                {overdueTasks.length} overdue task
                {overdueTasks.length !== 1 ? "s" : ""}
              </span>
            </Link>
          )}
          {unsplitBills.length > 0 && (
            <Link
              href={`/dashboard/${houseId}/bills`}
              style={{ textDecoration: "none" }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 50,
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                <Zap
                  size={11}
                  style={{
                    display: "inline",
                    marginRight: 3,
                    verticalAlign: "middle",
                  }}
                />
                {unsplitBills.length} bill{unsplitBills.length !== 1 ? "s" : ""}{" "}
                need splitting
              </span>
            </Link>
          )}
        </div>
      )}

      {/* ── Quick stats ── */}
      {ledger?.isManager && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 10,
            marginBottom: 24,
          }}
        >
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
          <Stat
            label="Active Tasks"
            value={activeTasks.length}
            color={urgentTasks.length > 0 ? "#f87171" : "var(--text)"}
            sub={
              urgentTasks.length > 0
                ? `${urgentTasks.length} urgent`
                : undefined
            }
          />
          <Stat label="Members" value={members.length} color="var(--teal)" />
        </div>
      )}

      {/* ── Cards grid ── */}
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
          empty={!ledger?.entries?.length}
          emptyText="No payments logged yet."
        >
          {ledger?.entries?.slice(0, 3).map((e, i) => {
            const sc =
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
                  marginBottom: i < 2 ? 8 : 0,
                  borderBottom:
                    i < 2 ? "1px solid var(--glass-border)" : "none",
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
                    color: sc,
                    background: `${sc}18`,
                    border: `1px solid ${sc}30`,
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
          empty={!bills?.bills?.length}
          emptyText="No bills added yet."
        >
          {bills?.bills?.slice(0, 3).map((b, i) => (
            <div
              key={b._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 8,
                marginBottom: i < 2 ? 8 : 0,
                borderBottom: i < 2 ? "1px solid var(--glass-border)" : "none",
              }}
            >
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  {b.label || b.type}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                  {new Date(b.periodEnd).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
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
          ))}
        </SectionCard>

        {/* TASKS */}
        <SectionCard
          icon={CheckSquare}
          label="Tasks"
          href="tasks"
          houseId={houseId}
          empty={activeTasks.length === 0}
          emptyText="No active tasks."
        >
          {activeTasks.slice(0, 4).map((t, i) => {
            const due = t.dueDate ? relDate(t.dueDate) : null;
            const pc =
              { urgent: "#f87171", normal: "var(--teal)", low: "var(--muted)" }[
                t.priority
              ] || "var(--muted)";
            return (
              <div
                key={t._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  paddingBottom: 8,
                  marginBottom: i < 3 ? 8 : 0,
                  borderBottom:
                    i < 3 ? "1px solid var(--glass-border)" : "none",
                }}
              >
                <Flag size={10} color={pc} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.title}
                </span>
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
        </SectionCard>

        {/* GROCERY */}
        <SectionCard
          icon={ShoppingCart}
          label="Grocery List"
          href="grocery"
          houseId={houseId}
          empty={grocery.length === 0}
          emptyText="List is empty."
        >
          {grocery.slice(0, 4).map((item, i) => (
            <div
              key={item._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 7,
                marginBottom: i < 3 ? 7 : 0,
                borderBottom: i < 3 ? "1px solid var(--glass-border)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                  {item.name}
                </span>
                {item.quantity && (
                  <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                    {item.quantity}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.67rem",
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
        </SectionCard>

        {/* MEMBERS */}
        <SectionCard
          icon={Users}
          label="Members"
          href="members"
          houseId={houseId}
          empty={members.length === 0}
          emptyText="No members yet."
        >
          {members.slice(0, 4).map((m, i) => {
            const bc = {
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
                  marginBottom: i < 3 ? 8 : 0,
                  borderBottom:
                    i < 3 ? "1px solid var(--glass-border)" : "none",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, flex: 1 }}>
                  {m.name}
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: bc,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {m.role}
                </span>
              </div>
            );
          })}
        </SectionCard>

        {/* CHAT */}
        <SectionCard
          icon={MessageSquare}
          label="Chat"
          href="chat"
          houseId={houseId}
          empty={threads.length === 0}
          emptyText="No channels yet."
        >
          {[...threads]
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
            )
            .slice(0, 4)
            .map((t, i) => (
              <div
                key={t._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  paddingBottom: 8,
                  marginBottom: i < 3 ? 8 : 0,
                  borderBottom:
                    i < 3 ? "1px solid var(--glass-border)" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
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
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.lastMessageText}
                    </div>
                  )}
                </div>
                {t.lastMessageAt && (
                  <span
                    style={{
                      fontSize: "0.67rem",
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
        </SectionCard>

        {/* VAULT — static promo */}
        <SectionCard
          icon={ShieldCheck}
          label="Vault"
          href="vault"
          houseId={houseId}
        >
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            WiFi passwords, door codes, lease docs, landlord contacts — AES-256
            encrypted.
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
            <ShieldCheck size={12} /> Open Vault →
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
