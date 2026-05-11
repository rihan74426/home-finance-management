"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Check,
  DollarSign,
} from "lucide-react";
import { PAYMENT_METHOD } from "@/lib/constants";
import { LedgerSkeleton } from "@/components/ui/Skeleton";

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

const iS = {
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
const lS = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

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

// Inline mark-as-paid panel (shown below the entry row)
function MarkPaidPanel({ entry, house, onSave, onCancel }) {
  const remaining = Math.max(0, entry.amountDue - entry.amountPaid);
  const [amountPaid, setAmountPaid] = useState(String(remaining / 100));
  const [paymentMethod, setPaymentMethod] = useState(
    entry.paymentMethod || "cash"
  );
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    const paid = Math.round(parseFloat(amountPaid) * 100);
    if (isNaN(paid) || paid < 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/houses/${entry.houseId}/ledger/${entry._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountPaid: entry.amountPaid + paid,
            paymentMethod,
          }),
        }
      );
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      toast.success("Payment updated.");
      onSave(json.data);
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      style={{
        padding: "12px 18px",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--glass-border)",
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      <div style={{ flex: "1 1 140px" }}>
        <label style={lS}>Amount received ({house?.currency})</label>
        <input
          style={iS}
          type="number"
          min="0"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />
      </div>
      <div style={{ flex: "1 1 140px" }}>
        <label style={lS}>Method</label>
        <select
          style={{ ...iS, cursor: "pointer" }}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          display: "flex",
          gap: 7,
          alignItems: "center",
          paddingBottom: 1,
        }}
      >
        <button
          type="button"
          onClick={() => setAmountPaid(String(remaining / 100))}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--teal-dim)",
            border: "1px solid var(--teal-border)",
            color: "var(--teal)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Full ({fmtCurrency(remaining, house?.currency)})
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: saving ? "var(--glass-bg-mid)" : "var(--accent)",
            color: saving ? "var(--muted)" : "#fff",
            fontWeight: 700,
            fontSize: "0.8rem",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {saving ? (
            <Loader2
              size={13}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Check size={13} />
          )}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "8px",
            borderRadius: 8,
            background: "none",
            border: "1px solid var(--glass-border)",
            color: "var(--muted)",
            cursor: "pointer",
          }}
        >
          <X size={13} />
        </button>
      </div>
    </form>
  );
}

export default function LedgerPage() {
  const { houseId } = useParams();
  const [entries, setEntries] = useState([]);
  const [members, setMembers] = useState([]);
  const [house, setHouse] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null); // entryId with mark-paid panel open

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
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.membershipId ||
      !form.amountDue ||
      !form.periodStart ||
      !form.periodEnd ||
      !form.dueDate
    ) {
      toast.error("Fill in all required fields.");
      return;
    }
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
        toast.error(json.error);
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
      toast.success("Payment logged.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExport(membershipId) {
    setExporting(true);
    try {
      const url = membershipId
        ? `/api/houses/${houseId}/ledger/export?membershipId=${membershipId}`
        : `/api/houses/${houseId}/ledger/export`;
      const res = await fetch(url);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "Export failed.");
        return;
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const cd = res.headers.get("content-disposition") || "";
      link.download = cd.match(/filename="(.+?)"/)?.[1] || "ledger.pdf";
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Exported as PDF.");
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  function handleEntrySaved(updatedEntry) {
    setEntries((p) =>
      p.map((e) => (e._id === updatedEntry._id ? updatedEntry : e))
    );
    setExpandedEntry(null);
  }

  if (loading) return <LedgerSkeleton />;

  const totalDue = entries.reduce((s, e) => s + (e.amountDue || 0), 0);
  const totalPaid = entries.reduce((s, e) => s + (e.amountPaid || 0), 0);
  const overdueCount = entries.filter((e) => e.status === "overdue").length;
  const pendingCount = entries.filter(
    (e) => e.status === "pending" || e.status === "partial"
  ).length;

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <BookOpen size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Rent Ledger
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {house?.name} · {house?.currency}
            {overdueCount > 0 && (
              <span
                className="alert-pulse"
                style={{ marginLeft: 8, color: "#f87171", fontWeight: 600 }}
              >
                · {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => handleExport(null)}
            disabled={exporting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 50,
              background: "var(--glass-bg-mid)",
              color: exporting ? "var(--muted)" : "var(--text)",
              fontWeight: 600,
              fontSize: "0.8rem",
              border: "1px solid var(--glass-border)",
              cursor: exporting ? "not-allowed" : "pointer",
            }}
          >
            {exporting ? (
              <Loader2
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Download size={13} />
            )}
            Export PDF
          </button>
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
      </div>

      {/* Stats */}
      {isManager && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
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
              label: "Collected",
              value: fmtCurrency(totalPaid, house?.currency),
              color: "#4ade80",
            },
            {
              label: "Pending",
              value: pendingCount,
              color: pendingCount > 0 ? "#fbbf24" : "var(--muted)",
            },
            {
              label: "Overdue",
              value: overdueCount,
              color: overdueCount > 0 ? "#f87171" : "var(--muted)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--glass-bg)",
                border: `1px solid ${s.color === "#f87171" && overdueCount > 0 ? "rgba(248,113,113,0.3)" : "var(--glass-border)"}`,
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--muted)",
                  marginBottom: 5,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
              <div
                style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}
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
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div>
                <label style={lS}>Member *</label>
                <select
                  style={{ ...iS, cursor: "pointer" }}
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
                  <label style={lS}>Amount Due ({house?.currency}) *</label>
                  <input
                    style={iS}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 8000"
                    value={form.amountDue}
                    onChange={(e) => setF("amountDue", e.target.value)}
                  />
                </div>
                <div>
                  <label style={lS}>Amount Paid</label>
                  <input
                    style={iS}
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
                  <label style={lS}>Period Start *</label>
                  <input
                    style={iS}
                    type="date"
                    value={form.periodStart}
                    onChange={(e) => setF("periodStart", e.target.value)}
                  />
                </div>
                <div>
                  <label style={lS}>Period End *</label>
                  <input
                    style={iS}
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
                  <label style={lS}>Due Date *</label>
                  <input
                    style={iS}
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setF("dueDate", e.target.value)}
                  />
                </div>
                <div>
                  <label style={lS}>Payment Method</label>
                  <select
                    style={{ ...iS, cursor: "pointer" }}
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
                <label style={lS}>Label</label>
                <input
                  style={iS}
                  placeholder="e.g. Rent — April 2025"
                  value={form.label}
                  onChange={(e) => setF("label", e.target.value)}
                />
              </div>
              <div>
                <label style={lS}>Note for member</label>
                <input
                  style={iS}
                  placeholder="Visible to the member"
                  value={form.memberNote}
                  onChange={(e) => setF("memberNote", e.target.value)}
                />
              </div>
              <div>
                <label style={lS}>Private note (manager only)</label>
                <input
                  style={iS}
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

      {/* Entries list */}
      {entries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <BookOpen
            size={40}
            style={{
              marginBottom: 12,
              opacity: 0.3,
              display: "block",
              margin: "0 auto 12px",
            }}
          />
          <p>
            {isManager
              ? "No entries yet. Log the first payment."
              : "No payment records yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map((e) => {
            const isOverdue = e.status === "overdue";
            const isPaid = e.status === "paid";
            const canPay = isManager && !isPaid;
            const isExpanded = expandedEntry === e._id;
            return (
              <div
                key={e._id}
                className={isOverdue ? "border-urgent" : ""}
                style={{
                  background: "var(--glass-bg)",
                  border: `1px solid ${isOverdue ? "rgba(248,113,113,0.3)" : "var(--glass-border)"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "13px 18px",
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
                      {isOverdue && (
                        <span
                          className="alert-pulse"
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#f87171",
                            display: "inline-block",
                          }}
                        />
                      )}
                    </div>
                    {isManager && e.membershipId?.userId && (
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--teal)",
                          marginBottom: 2,
                        }}
                      >
                        {e.membershipId.userId.name}
                      </div>
                    )}
                    <div
                      style={{ fontSize: "0.775rem", color: "var(--muted)" }}
                    >
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
                        {e.managerNote}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                      {fmtCurrency(e.amountPaid, house?.currency)}
                    </div>
                    {e.amountPaid !== e.amountDue && (
                      <div
                        style={{ fontSize: "0.72rem", color: "var(--muted)" }}
                      >
                        of {fmtCurrency(e.amountDue, house?.currency)}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        marginTop: 6,
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                      }}
                    >
                      {canPay && (
                        <button
                          onClick={() =>
                            setExpandedEntry(isExpanded ? null : e._id)
                          }
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 50,
                            background: isExpanded
                              ? "var(--glass-bg-mid)"
                              : "var(--accent-dim)",
                            border: `1px solid ${isExpanded ? "var(--glass-border)" : "var(--accent-border)"}`,
                            color: isExpanded
                              ? "var(--muted)"
                              : "var(--accent)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <DollarSign size={10} />{" "}
                          {isExpanded ? "Cancel" : "Record Payment"}
                        </button>
                      )}
                      {isManager && e.membershipId?._id && (
                        <button
                          onClick={() => handleExport(e.membershipId._id)}
                          disabled={exporting}
                          style={{
                            fontSize: "0.68rem",
                            color: "var(--muted)",
                            background: "none",
                            border: "none",
                            cursor: exporting ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Download size={10} /> Export
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline mark-paid panel */}
                {isExpanded && canPay && (
                  <MarkPaidPanel
                    entry={{ ...e, houseId }}
                    house={house}
                    onSave={handleEntrySaved}
                    onCancel={() => setExpandedEntry(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes alertPulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(248,113,113,.7)}50%{opacity:.85;box-shadow:0 0 0 6px rgba(248,113,113,0)}} .alert-pulse{animation:alertPulse 1.6s ease-in-out infinite} .border-urgent{border-color:rgba(248,113,113,0.3)!important} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}
