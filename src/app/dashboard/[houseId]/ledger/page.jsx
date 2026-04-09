"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { PAYMENT_METHOD } from "@/lib/constants";

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
    icon: CheckCircle,
  },
  partial: {
    label: "Partial",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    color: "var(--muted)",
    bg: "var(--glass-bg)",
    border: "var(--glass-border)",
    icon: Clock,
  },
  overdue: {
    label: "Overdue",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
    icon: AlertCircle,
  },
};

const PAYMENT_METHOD_LABELS = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  jazz_cash: "JazzCash",
  easy_paisa: "EasyPaisa",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  card: "Card",
  other: "Other",
};

function fmtCurrency(amount, currency) {
  if (amount == null) return "—";
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

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = c.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.72rem",
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 50,
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <Icon size={11} /> {c.label}
    </span>
  );
}

const inputStyle = {
  width: "100%",
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "9px 13px",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function LedgerPage() {
  const { houseId } = useParams();
  const [entries, setEntries] = useState([]);
  const [members, setMembers] = useState([]);
  const [house, setHouse] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    membershipId: "",
    amountDue: "",
    amountPaid: "",
    label: "Rent",
    paymentMethod: "cash",
    periodStart: "",
    periodEnd: "",
    dueDate: "",
    memberNote: "",
    managerNote: "",
  });

  useEffect(() => {
    async function load() {
      const [lRes, mRes, hRes] = await Promise.all([
        fetch(`/api/houses/${houseId}/ledger`),
        fetch(`/api/houses/${houseId}/members`),
        fetch(`/api/houses/${houseId}`),
      ]);
      const [lJson, mJson, hJson] = await Promise.all([
        lRes.json(),
        mRes.json(),
        hRes.json(),
      ]);
      if (lJson.success) {
        setEntries(lJson.data);
        setIsManager(lJson.isManager);
      }
      if (mJson.success) setMembers(mJson.data);
      if (hJson.success) setHouse(hJson.data);
      setLoading(false);
    }
    load();
  }, [houseId]);

  function setF(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.membershipId ||
      !form.amountDue ||
      !form.periodStart ||
      !form.periodEnd ||
      !form.dueDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amountDue: Math.round(parseFloat(form.amountDue) * 100),
          amountPaid: Math.round(parseFloat(form.amountPaid || 0) * 100),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setEntries((p) => [json.data, ...p]);
      setShowForm(false);
      setForm({
        membershipId: "",
        amountDue: "",
        amountPaid: "",
        label: "Rent",
        paymentMethod: "cash",
        periodStart: "",
        periodEnd: "",
        dueDate: "",
        memberNote: "",
        managerNote: "",
      });
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading ledger…
      </div>
    );

  // Summary stats for manager
  const totalDue = entries.reduce((s, e) => s + (e.amountDue || 0), 0);
  const totalPaid = entries.reduce((s, e) => s + (e.amountPaid || 0), 0);
  const overdueCount = entries.filter((e) => e.status === "overdue").length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Rent Ledger
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {house?.name} · {house?.currency}
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 50,
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.825rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={14} /> Log payment
          </button>
        )}
      </div>

      {/* Stats (manager only) */}
      {isManager && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Total Due",
              value: fmtCurrency(totalDue, house?.currency),
              color: "var(--text)",
            },
            {
              label: "Total Collected",
              value: fmtCurrency(totalPaid, house?.currency),
              color: "#4ade80",
            },
            {
              label: "Overdue Entries",
              value: overdueCount,
              color: overdueCount > 0 ? "#f87171" : "var(--muted)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--muted)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
              <div
                style={{ fontSize: "1.3rem", fontWeight: 800, color: s.color }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Payment Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--bg-mid)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
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
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                Log Payment
              </h2>
              <button
                onClick={() => setShowForm(false)}
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

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#f87171",
                  fontSize: "0.825rem",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={labelStyle}>Member *</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.membershipId}
                  onChange={(e) => setF("membershipId", e.target.value)}
                >
                  <option value="">Select member…</option>
                  {members.map((m) => (
                    <option key={m.membershipId} value={m.membershipId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Amount Due ({house?.currency}) *
                  </label>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 8000"
                    value={form.amountDue}
                    onChange={(e) => setF("amountDue", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Amount Paid</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={form.amountPaid}
                    onChange={(e) => setF("amountPaid", e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={labelStyle}>Period Start *</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.periodStart}
                    onChange={(e) => setF("periodStart", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Period End *</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.periodEnd}
                    onChange={(e) => setF("periodEnd", e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={labelStyle}>Due Date *</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setF("dueDate", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.paymentMethod}
                    onChange={(e) => setF("paymentMethod", e.target.value)}
                  >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Label</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="e.g. Rent — April 2025"
                  value={form.label}
                  onChange={(e) => setF("label", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Note for member</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Visible to the member"
                  value={form.memberNote}
                  onChange={(e) => setF("memberNote", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Private note (manager only)</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Only you can see this"
                  value={form.managerNote}
                  onChange={(e) => setF("managerNote", e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "11px",
                  borderRadius: 10,
                  background: submitting
                    ? "var(--glass-bg-mid)"
                    : "var(--accent)",
                  color: submitting ? "var(--muted)" : "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                {submitting && (
                  <Loader2
                    size={15}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {submitting ? "Saving…" : "Save entry"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ledger entries */}
      {entries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <BookOpen size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>
            {isManager
              ? "No entries yet. Log the first payment."
              : "No payment records yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((e) => (
            <div
              key={e._id}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {e.label || "Rent"}
                    </span>
                    <StatusBadge status={e.status} />
                    {e.paymentMethod && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--muted)",
                          background: "var(--glass-bg-mid)",
                          padding: "2px 7px",
                          borderRadius: 50,
                        }}
                      >
                        {PAYMENT_METHOD_LABELS[e.paymentMethod] ||
                          e.paymentMethod}
                      </span>
                    )}
                  </div>
                  {isManager && e.membershipId?.userId && (
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--teal)",
                        marginBottom: 3,
                      }}
                    >
                      {e.membershipId.userId.name}
                    </div>
                  )}
                  <div style={{ fontSize: "0.775rem", color: "var(--muted)" }}>
                    {fmtDate(e.periodStart)} – {fmtDate(e.periodEnd)} · Due{" "}
                    {fmtDate(e.dueDate)}
                  </div>
                  {e.memberNote && (
                    <div
                      style={{
                        fontSize: "0.775rem",
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      "{e.memberNote}"
                    </div>
                  )}
                  {isManager && e.managerNote && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--accent)",
                        marginTop: 3,
                      }}
                    >
                      🔒 {e.managerNote}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                    {fmtCurrency(e.amountPaid, house?.currency)}
                  </div>
                  {e.amountPaid !== e.amountDue && (
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                      of {fmtCurrency(e.amountDue, house?.currency)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } select option { background: #0e1520; color: #f0ede8; }`}</style>
    </div>
  );
}
