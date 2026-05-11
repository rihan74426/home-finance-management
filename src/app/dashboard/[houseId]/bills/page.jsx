"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Zap,
  Droplets,
  Wifi,
  Wrench,
  Trash2,
  Cable,
  Package,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { BILL_TYPE, BILL_SPLIT_TYPE, PAYMENT_METHOD } from "@/lib/constants";

// ── Config ────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  electricity: { label: "Electricity", icon: Zap, color: "#fbbf24" },
  water: { label: "Water", icon: Droplets, color: "#38bdf8" },
  gas: { label: "Gas", icon: Zap, color: "#f97316" },
  internet: { label: "Internet", icon: Wifi, color: "#a78bfa" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "#94a3b8" },
  garbage: { label: "Garbage", icon: Trash2, color: "#4ade80" },
  cable: { label: "Cable", icon: Cable, color: "#f472b6" },
  other: { label: "Other", icon: Package, color: "var(--muted)" },
};

const STATUS_CONFIG = {
  paid: { label: "Paid", color: "#4ade80", icon: CheckCircle },
  partial: { label: "Partial", color: "#fbbf24", icon: Clock },
  pending: { label: "Pending", color: "var(--muted)", icon: Clock },
  overdue: { label: "Overdue", color: "#f87171", icon: AlertCircle },
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  if (!d) return "—";
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function BillsSkeleton() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div
          className="sk"
          style={{ width: 80, height: 28, borderRadius: 6 }}
        />
        <div
          className="sk"
          style={{ width: 100, height: 36, borderRadius: 50 }}
        />
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="sk"
          style={{ height: 72, borderRadius: 14, marginBottom: 8 }}
        />
      ))}
      <style>{`.sk{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

// ── Mark Paid Modal ───────────────────────────────────────────────────────────
// Shown when manager clicks "Mark Paid" on a split row
function MarkPaidModal({ split, bill, house, onClose, onSaved }) {
  const [amountPaid, setAmountPaid] = useState(String(split.shareAmount / 100));
  const [paymentMethod, setPaymentMethod] = useState("cash");
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
      const res = await fetch(`/api/bills/${bill._id}/split/${split._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid: paid, paymentMethod }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      toast.success("Payment recorded.");
      onSaved(split._id, paid, paymentMethod);
      onClose();
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const memberName = split.membershipId?.userId?.name || "Member";
  const isFullPay =
    Math.round(parseFloat(amountPaid) * 100) >= split.shareAmount;

  return (
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
          maxWidth: 380,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
            Record Payment
          </h2>
          <button
            onClick={onClose}
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

        {/* Context */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--glass-border)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 18,
          }}
        >
          <div
            style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 3 }}
          >
            {memberName}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
            {bill.label || TYPE_CONFIG[bill.type]?.label} · Share:{" "}
            <strong style={{ color: "var(--text)" }}>
              {fmtCurrency(split.shareAmount, house?.currency)}
            </strong>
          </div>
          {split.status !== "pending" && (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: 4,
                color: STATUS_CONFIG[split.status]?.color || "var(--muted)",
              }}
            >
              Current status: {split.status}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: 13 }}
        >
          <div>
            <label style={lS}>Amount Paid ({house?.currency}) *</label>
            <input
              style={iS}
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
            {!isFullPay && parseFloat(amountPaid) > 0 && (
              <div
                style={{ fontSize: "0.72rem", color: "#fbbf24", marginTop: 4 }}
              >
                Partial payment —{" "}
                {fmtCurrency(
                  split.shareAmount - Math.round(parseFloat(amountPaid) * 100),
                  house?.currency
                )}{" "}
                remaining
              </div>
            )}
          </div>
          <div>
            <label style={lS}>Payment Method</label>
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
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setAmountPaid(String(split.shareAmount / 100))}
              style={{
                flex: 1,
                padding: "9px",
                borderRadius: 9,
                background: "var(--teal-dim)",
                border: "1px solid var(--teal-border)",
                color: "var(--teal)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Full Amount
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: "9px",
                borderRadius: 9,
                background: saving ? "var(--glass-bg-mid)" : "var(--accent)",
                color: saving ? "var(--muted)" : "#fff",
                fontWeight: 700,
                fontSize: "0.875rem",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              {saving ? (
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Check size={14} />
              )}
              {saving ? "Saving…" : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Split Details Panel ───────────────────────────────────────────────────────
function SplitPanel({
  bill,
  house,
  isManager,
  splitDetails,
  loadingSplits,
  onMarkPaid,
}) {
  if (loadingSplits) {
    return (
      <div
        style={{
          borderTop: "1px solid var(--glass-border)",
          padding: "12px 18px",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 40,
              background: "var(--glass-bg-mid)",
              borderRadius: 8,
              marginBottom: 6,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (!splitDetails?.length) {
    return (
      <div
        style={{
          borderTop: "1px solid var(--glass-border)",
          padding: "14px 18px",
        }}
      >
        <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          No split data available.
        </p>
      </div>
    );
  }

  const totalPaid = splitDetails.reduce((s, sp) => {
    if (sp.status === "paid") return s + sp.shareAmount;
    return s;
  }, 0);
  const allPaid = splitDetails.every((sp) => sp.status === "paid");

  return (
    <div
      style={{
        borderTop: "1px solid var(--glass-border)",
        background: "var(--bg-surface)",
      }}
    >
      {/* Progress bar */}
      <div style={{ padding: "12px 18px 8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--muted)",
              fontWeight: 600,
            }}
          >
            Collection progress
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              color: allPaid ? "#4ade80" : "var(--muted)",
              fontWeight: 700,
            }}
          >
            {fmtCurrency(totalPaid, house?.currency)} /{" "}
            {fmtCurrency(bill.totalAmount, house?.currency)}
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "var(--glass-border)",
            borderRadius: 50,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 50,
              background: allPaid ? "#4ade80" : "var(--accent)",
              width: `${Math.min(100, (totalPaid / bill.totalAmount) * 100)}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Per-member rows */}
      <div
        style={{
          padding: "4px 18px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {splitDetails.map((split) => {
          const sc = STATUS_CONFIG[split.status] || STATUS_CONFIG.pending;
          const SIcon = sc.icon;
          const name = split.membershipId?.userId?.name || "Member";
          const isOverdue = split.status === "overdue";
          return (
            <div
              key={split._id}
              className={isOverdue ? "row-overdue" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 12px",
                background: "var(--glass-bg)",
                borderRadius: 9,
                border: `1px solid ${isOverdue ? "rgba(248,113,113,0.3)" : "var(--glass-border)"}`,
              }}
            >
              {/* Avatar */}
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
                {name[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "0.84rem", fontWeight: 600 }}>
                  {name}
                </span>
              </div>

              {/* Status */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 50,
                  color: sc.color,
                  background: `${sc.color}18`,
                  border: `1px solid ${sc.color}30`,
                  flexShrink: 0,
                }}
              >
                <SIcon size={10} /> {sc.label}
              </span>

              {/* Amount */}
              <span
                style={{ fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}
              >
                {fmtCurrency(split.shareAmount, house?.currency)}
              </span>

              {/* Action */}
              {isManager && split.status !== "paid" && (
                <button
                  onClick={() => onMarkPaid(split)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                    color: "var(--accent)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Mark Paid
                </button>
              )}
              {split.status === "paid" && (
                <CheckCircle
                  size={16}
                  color="#4ade80"
                  style={{ flexShrink: 0 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BillsPage() {
  const { houseId } = useParams();
  const [bills, setBills] = useState([]);
  const [members, setMembers] = useState([]);
  const [house, setHouse] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedBill, setExpandedBill] = useState(null);
  const [splitDetails, setSplitDetails] = useState({});
  const [loadingSplits, setLoadingSplits] = useState({});
  const [splitting, setSplitting] = useState(null);
  const [splitForm, setSplitForm] = useState({
    type: "equal",
    customSplits: [],
  });
  const [markPaidSplit, setMarkPaidSplit] = useState(null); // { split, bill }

  const [form, setForm] = useState({
    type: "electricity",
    label: "",
    totalAmount: "",
    periodStart: "",
    periodEnd: "",
    dueDate: "",
    splitType: "equal",
    meterReadingStart: "",
    meterReadingEnd: "",
    note: "",
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    async function load() {
      const [bRes, mRes, hRes] = await Promise.all([
        fetch(`/api/houses/${houseId}/bills`),
        fetch(`/api/houses/${houseId}/members`),
        fetch(`/api/houses/${houseId}`),
      ]);
      const [bJson, mJson, hJson] = await Promise.all([
        bRes.json(),
        mRes.json(),
        hRes.json(),
      ]);
      if (bJson.success) {
        setBills(bJson.data);
        setIsManager(bJson.isManager);
      }
      if (mJson.success) setMembers(mJson.data);
      if (hJson.success) setHouse(hJson.data);
      setLoading(false);
    }
    load();
  }, [houseId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (
      !form.totalAmount ||
      !form.periodStart ||
      !form.periodEnd ||
      !form.dueDate
    ) {
      toast.error("Fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalAmount: Math.round(parseFloat(form.totalAmount) * 100),
          meterReadingStart: form.meterReadingStart
            ? parseFloat(form.meterReadingStart)
            : null,
          meterReadingEnd: form.meterReadingEnd
            ? parseFloat(form.meterReadingEnd)
            : null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      setBills((p) => [json.data, ...p]);
      setShowForm(false);
      setForm({
        type: "electricity",
        label: "",
        totalAmount: "",
        periodStart: "",
        periodEnd: "",
        dueDate: "",
        splitType: "equal",
        meterReadingStart: "",
        meterReadingEnd: "",
        note: "",
      });
      toast.success("Bill created.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSplit(bill) {
    setSplitting(bill._id);
    setSplitForm({
      type: "equal",
      customSplits: members.map((m) => ({
        membershipId: m.membershipId,
        name: m.name,
        shareAmount: Math.floor(bill.totalAmount / members.length),
      })),
    });
  }

  async function runSplit(bill) {
    const isCustom = splitForm.type === "custom";
    if (isCustom) {
      const total = splitForm.customSplits.reduce(
        (s, c) => s + (parseInt(c.shareAmount) || 0),
        0
      );
      if (total !== bill.totalAmount) {
        toast.error(
          `Splits must total ${fmtCurrency(bill.totalAmount, house?.currency)}.`
        );
        return;
      }
    }
    try {
      const res = await fetch(`/api/bills/${bill._id}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          splitType: isCustom ? "custom" : "equal",
          splits: isCustom
            ? splitForm.customSplits.map((s) => ({
                membershipId: s.membershipId,
                shareAmount: parseInt(s.shareAmount),
              }))
            : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      setBills((p) =>
        p.map((b) => (b._id === bill._id ? { ...b, isSplit: true } : b))
      );
      setSplitting(null);
      // Auto-expand to show splits
      setExpandedBill(bill._id);
      await loadSplitDetails(bill._id);
      toast.success("Bill split. Members will see it in their ledger.");
    } catch {
      toast.error("Network error.");
    }
  }

  async function loadSplitDetails(billId) {
    if (splitDetails[billId]) {
      setExpandedBill((prev) => (prev === billId ? null : billId));
      return;
    }
    setExpandedBill(billId);
    setLoadingSplits((p) => ({ ...p, [billId]: true }));
    try {
      const res = await fetch(`/api/bills/${billId}/split`);
      const json = await res.json();
      if (json.success) setSplitDetails((p) => ({ ...p, [billId]: json.data }));
    } finally {
      setLoadingSplits((p) => ({ ...p, [billId]: false }));
    }
  }

  // Called after mark-paid modal saves
  function handleSplitPaid(splitId, amountPaid, paymentMethod) {
    setSplitDetails((prev) => {
      const updated = {};
      for (const [billId, splits] of Object.entries(prev)) {
        updated[billId] = splits.map((sp) => {
          if (sp._id !== splitId) return sp;
          const newStatus =
            amountPaid >= sp.shareAmount
              ? "paid"
              : amountPaid > 0
                ? "partial"
                : "pending";
          return { ...sp, status: newStatus };
        });
      }
      return updated;
    });
  }

  if (loading) return <BillsSkeleton />;

  const unsplitCount = bills.filter((b) => !b.isSplit).length;

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
            <Zap size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Bills
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {house?.name} · {bills.length} bill{bills.length !== 1 ? "s" : ""}
            {unsplitCount > 0 && (
              <span
                style={{ marginLeft: 8, color: "#fbbf24", fontWeight: 600 }}
              >
                · {unsplitCount} need splitting
              </span>
            )}
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
            <Plus size={14} /> Add bill
          </button>
        )}
      </div>

      {/* Summary stats — manager only */}
      {isManager && bills.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 22,
          }}
        >
          {[
            { label: "Total", value: bills.length, color: "var(--text)" },
            {
              label: "Split",
              value: bills.filter((b) => b.isSplit).length,
              color: "#4ade80",
            },
            {
              label: "Pending Split",
              value: unsplitCount,
              color: unsplitCount > 0 ? "#fbbf24" : "var(--muted)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--muted)",
                  marginBottom: 5,
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

      {/* ── Create Bill Modal ── */}
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
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Add Bill</h2>
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
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              {/* Type selector */}
              <div>
                <label style={lS}>Type *</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 6,
                  }}
                >
                  {Object.entries(TYPE_CONFIG).map(([v, c]) => {
                    const Icon = c.icon;
                    const on = form.type === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setF("type", v)}
                        style={{
                          padding: "8px 4px",
                          borderRadius: 9,
                          border: on
                            ? "1.5px solid var(--accent)"
                            : "1px solid var(--glass-border)",
                          background: on
                            ? "var(--accent-dim)"
                            : "var(--glass-bg)",
                          color: on ? "var(--text)" : "var(--muted)",
                          fontSize: "0.68rem",
                          fontWeight: on ? 600 : 400,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Icon size={13} color={on ? c.color : "var(--muted)"} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={lS}>Label</label>
                <input
                  style={iS}
                  placeholder="e.g. Electricity — April 2025"
                  value={form.label}
                  onChange={(e) => setF("label", e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <label style={lS}>Total Amount ({house?.currency}) *</label>
                <input
                  style={iS}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => setF("totalAmount", e.target.value)}
                />
              </div>
              {form.type === "electricity" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={lS}>Meter Start</label>
                    <input
                      style={iS}
                      type="number"
                      placeholder="e.g. 1240"
                      value={form.meterReadingStart}
                      onChange={(e) =>
                        setF("meterReadingStart", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label style={lS}>Meter End</label>
                    <input
                      style={iS}
                      type="number"
                      placeholder="e.g. 1480"
                      value={form.meterReadingEnd}
                      onChange={(e) => setF("meterReadingEnd", e.target.value)}
                    />
                  </div>
                </div>
              )}
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
              <div>
                <label style={lS}>Due Date *</label>
                <input
                  style={iS}
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setF("dueDate", e.target.value)}
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
                  fontSize: "0.875rem",
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
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {submitting ? "Creating…" : "Create Bill"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Split Modal ── */}
      {splitting &&
        (() => {
          const bill = bills.find((b) => b._id === splitting);
          if (!bill) return null;
          return (
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
                  maxWidth: 420,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                    Split Bill
                  </h2>
                  <button
                    onClick={() => setSplitting(null)}
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
                <div
                  style={{
                    background: "var(--glass-bg)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>
                    {bill.label || TYPE_CONFIG[bill.type]?.label}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    Total: {fmtCurrency(bill.totalAmount, house?.currency)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {["equal", "custom"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSplitForm((p) => ({ ...p, type: t }))}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: 9,
                        border:
                          splitForm.type === t
                            ? "1.5px solid var(--accent)"
                            : "1px solid var(--glass-border)",
                        background:
                          splitForm.type === t
                            ? "var(--accent-dim)"
                            : "transparent",
                        color:
                          splitForm.type === t
                            ? "var(--accent)"
                            : "var(--muted)",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      {t === "equal" ? "Equal Split" : "Custom Split"}
                    </button>
                  ))}
                </div>
                {splitForm.type === "equal" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      marginBottom: 14,
                    }}
                  >
                    {members.map((m, i) => {
                      const share =
                        i === 0
                          ? bill.totalAmount -
                            Math.floor(bill.totalAmount / members.length) *
                              (members.length - 1)
                          : Math.floor(bill.totalAmount / members.length);
                      return (
                        <div
                          key={m.membershipId}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: "var(--glass-bg)",
                            borderRadius: 8,
                          }}
                        >
                          <span style={{ fontSize: "0.875rem" }}>{m.name}</span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              color: "var(--teal)",
                            }}
                          >
                            {fmtCurrency(share, house?.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    {splitForm.customSplits.map((s, i) => (
                      <div
                        key={s.membershipId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ flex: 1, fontSize: "0.875rem" }}>
                          {s.name}
                        </span>
                        <input
                          style={{ ...iS, width: 120 }}
                          type="number"
                          min="0"
                          step="1"
                          value={s.shareAmount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setSplitForm((p) => ({
                              ...p,
                              customSplits: p.customSplits.map((c, ci) =>
                                ci === i ? { ...c, shareAmount: val } : c
                              ),
                            }));
                          }}
                        />
                      </div>
                    ))}
                    {(() => {
                      const total = splitForm.customSplits.reduce(
                        (s, c) => s + (parseInt(c.shareAmount) || 0),
                        0
                      );
                      const diff = bill.totalAmount - total;
                      return (
                        <div
                          style={{
                            fontSize: "0.78rem",
                            textAlign: "right",
                            color: diff === 0 ? "#4ade80" : "#f87171",
                          }}
                        >
                          {diff === 0
                            ? "✓ Totals match"
                            : `${diff > 0 ? fmtCurrency(diff, house?.currency) + " remaining" : fmtCurrency(Math.abs(diff), house?.currency) + " over"}`}
                        </div>
                      );
                    })()}
                  </div>
                )}
                <button
                  onClick={() => runSplit(bill)}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 10,
                    background: "var(--accent)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Confirm Split
                </button>
              </div>
            </div>
          );
        })()}

      {/* ── Mark Paid Modal ── */}
      {markPaidSplit && (
        <MarkPaidModal
          split={markPaidSplit.split}
          bill={markPaidSplit.bill}
          house={house}
          onClose={() => setMarkPaidSplit(null)}
          onSaved={handleSplitPaid}
        />
      )}

      {/* ── Bills list ── */}
      {bills.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <Zap
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
              ? "No bills yet. Add the first one."
              : "No bills have been added yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bills.map((bill) => {
            const tc = TYPE_CONFIG[bill.type] || TYPE_CONFIG.other;
            const TypeIcon = tc.icon;
            const isExpanded = expandedBill === bill._id;
            const splits = splitDetails[bill._id] || [];
            const allPaid =
              splits.length > 0 && splits.every((s) => s.status === "paid");
            const hasOverdue = splits.some((s) => s.status === "overdue");

            return (
              <div
                key={bill._id}
                style={{
                  background: "var(--glass-bg)",
                  border: `1px solid ${hasOverdue ? "rgba(248,113,113,0.3)" : "var(--glass-border)"}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: `${tc.color}18`,
                      border: `1px solid ${tc.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TypeIcon size={16} color={tc.color} />
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        flexWrap: "wrap",
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        {bill.label || tc.label}
                      </span>
                      {bill.isSplit ? (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 50,
                            color: allPaid ? "#4ade80" : "#fbbf24",
                            background: allPaid
                              ? "rgba(74,222,128,0.1)"
                              : "rgba(251,191,36,0.1)",
                            border: `1px solid ${allPaid ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`,
                          }}
                        >
                          {allPaid
                            ? "Fully Collected"
                            : hasOverdue
                              ? "Has Overdue"
                              : "Split — Collecting"}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 50,
                            color: "#fbbf24",
                            background: "rgba(251,191,36,0.1)",
                            border: "1px solid rgba(251,191,36,0.2)",
                          }}
                        >
                          Not split
                        </span>
                      )}
                      {hasOverdue && (
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
                    <div
                      style={{ fontSize: "0.775rem", color: "var(--muted)" }}
                    >
                      {fmtDate(bill.periodStart)} – {fmtDate(bill.periodEnd)} ·
                      Due {fmtDate(bill.dueDate)}
                    </div>
                    {bill.unitsConsumed && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--muted)",
                          marginTop: 1,
                        }}
                      >
                        {bill.unitsConsumed} units
                      </div>
                    )}
                  </div>
                  {/* Amount + actions */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                      {fmtCurrency(bill.totalAmount, house?.currency)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        marginTop: 5,
                        justifyContent: "flex-end",
                      }}
                    >
                      {isManager && !bill.isSplit && (
                        <button
                          onClick={() => handleSplit(bill)}
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 50,
                            background: "var(--accent-dim)",
                            border: "1px solid var(--accent-border)",
                            color: "var(--accent)",
                            cursor: "pointer",
                          }}
                        >
                          Split
                        </button>
                      )}
                      {bill.isSplit && (
                        <button
                          onClick={() => loadSplitDetails(bill._id)}
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 50,
                            background: "var(--glass-bg-mid)",
                            border: "1px solid var(--glass-border)",
                            color: "var(--muted)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          Payments{" "}
                          {isExpanded ? (
                            <ChevronUp size={10} />
                          ) : (
                            <ChevronDown size={10} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Split panel */}
                {isExpanded && bill.isSplit && (
                  <SplitPanel
                    bill={bill}
                    house={house}
                    isManager={isManager}
                    splitDetails={splitDetails[bill._id]}
                    loadingSplits={loadingSplits[bill._id]}
                    onMarkPaid={(split) => setMarkPaidSplit({ split, bill })}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes alertPulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(248,113,113,.7)}50%{opacity:.85;box-shadow:0 0 0 6px rgba(248,113,113,0)}} .alert-pulse{animation:alertPulse 1.6s ease-in-out infinite} .row-overdue{border-left:3px solid #f87171!important} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}
