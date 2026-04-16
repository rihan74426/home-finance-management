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
} from "lucide-react";
import { BILL_TYPE, BILL_SPLIT_TYPE } from "@/lib/constants";

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
  const [splitting, setSplitting] = useState(null);
  const [splitForm, setSplitForm] = useState({
    type: "equal",
    customSplits: [],
  });

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
      toast.error("Please fill in all required fields.");
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
      toast.success("Bill created successfully.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSplit(bill) {
    setSplitting(bill._id);
    // Init custom splits
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
          `Custom splits must total ${fmtCurrency(bill.totalAmount, house?.currency)}. Currently ${fmtCurrency(total * 100, house?.currency)}.`
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
      toast.success("Bill split among members. Ledger entries created.");
    } catch {
      toast.error("Network error.");
    }
  }

  async function loadSplitDetails(billId) {
    if (splitDetails[billId]) {
      setExpandedBill(expandedBill === billId ? null : billId);
      return;
    }
    const res = await fetch(`/api/bills/${billId}/split`);
    const json = await res.json();
    if (json.success) setSplitDetails((p) => ({ ...p, [billId]: json.data }));
    setExpandedBill(billId);
  }

  if (loading) return <BillsSkeleton />;

  const totalThisMonth = bills
    .slice(0, 10)
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

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

      {/* Summary */}
      {isManager && bills.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Total Bills", value: bills.length, color: "var(--text)" },
            {
              label: "Split",
              value: bills.filter((b) => b.isSplit).length,
              color: "#4ade80",
            },
            {
              label: "Pending Split",
              value: bills.filter((b) => !b.isSplit).length,
              color: "#fbbf24",
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

      {/* Create Bill Modal */}
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
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {/* Type */}
              <div>
                <label style={lS}>Bill Type *</label>
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
                            ? `1.5px solid var(--accent)`
                            : "1px solid var(--glass-border)",
                          background: on
                            ? "var(--accent-dim)"
                            : "var(--glass-bg)",
                          color: on ? "var(--text)" : "var(--muted)",
                          fontSize: "0.7rem",
                          fontWeight: on ? 600 : 400,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Icon size={14} color={on ? c.color : "var(--muted)"} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Label */}
              <div>
                <label style={lS}>Label</label>
                <input
                  style={iS}
                  placeholder={`e.g. Electricity — April 2025`}
                  value={form.label}
                  onChange={(e) => setF("label", e.target.value)}
                  maxLength={200}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={lS}>Total Amount ({house?.currency}) *</label>
                <input
                  style={iS}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1200"
                  value={form.totalAmount}
                  onChange={(e) => setF("totalAmount", e.target.value)}
                />
              </div>

              {/* Meter readings (electricity only) */}
              {form.type === "electricity" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={lS}>Meter Start (units)</label>
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
                    <label style={lS}>Meter End (units)</label>
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

              {/* Dates */}
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

              {/* Note */}
              <div>
                <label style={lS}>Note</label>
                <input
                  style={iS}
                  placeholder="Optional"
                  value={form.note}
                  onChange={(e) => setF("note", e.target.value)}
                  maxLength={500}
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

      {/* Split Modal */}
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

                {/* Split type toggle */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
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
                      gap: 6,
                      marginBottom: 16,
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
                      marginBottom: 16,
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
                    {/* Total checker */}
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
                            color: diff === 0 ? "#4ade80" : "#f87171",
                            textAlign: "right",
                          }}
                        >
                          {diff === 0
                            ? "✓ Totals match"
                            : `${diff > 0 ? `${fmtCurrency(diff, house?.currency)} remaining` : `${fmtCurrency(Math.abs(diff), house?.currency)} over`}`}
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

      {/* Bills list */}
      {bills.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <Zap size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
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

            return (
              <div
                key={bill._id}
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
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
                        gap: 8,
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
                            color: "#4ade80",
                            background: "rgba(74,222,128,0.1)",
                            border: "1px solid rgba(74,222,128,0.2)",
                          }}
                        >
                          Split
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
                          marginTop: 2,
                        }}
                      >
                        {bill.unitsConsumed} units consumed
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
                        gap: 6,
                        marginTop: 6,
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
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
                            gap: 4,
                          }}
                        >
                          Details{" "}
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

                {/* Expanded split details */}
                {isExpanded && splitDetails[bill._id] && (
                  <div
                    style={{
                      borderTop: "1px solid var(--glass-border)",
                      padding: "12px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {splitDetails[bill._id].map((split) => {
                      const sc =
                        STATUS_CONFIG[split.status] || STATUS_CONFIG.pending;
                      const SIcon = sc.icon;
                      return (
                        <div
                          key={split._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 10px",
                            background: "var(--bg-surface)",
                            borderRadius: 9,
                          }}
                        >
                          <span style={{ fontSize: "0.82rem" }}>
                            {split.membershipId?.userId?.name || "Member"}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
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
                                background: sc.bg,
                                border: `1px solid ${sc.border}`,
                              }}
                            >
                              <SIcon size={10} />
                              {sc.label}
                            </span>
                            <span
                              style={{ fontWeight: 700, fontSize: "0.875rem" }}
                            >
                              {fmtCurrency(split.shareAmount, house?.currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}

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
        <div>
          <div
            style={{
              width: 80,
              height: 22,
              borderRadius: 6,
              background: "var(--glass-bg-mid)",
              marginBottom: 8,
            }}
            className="skeleton"
          />
          <div
            style={{
              width: 160,
              height: 14,
              borderRadius: 4,
              background: "var(--glass-bg-mid)",
            }}
            className="skeleton"
          />
        </div>
        <div
          style={{
            width: 100,
            height: 36,
            borderRadius: 50,
            background: "var(--glass-bg-mid)",
          }}
          className="skeleton"
        />
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 72,
            borderRadius: 14,
            background: "var(--glass-bg-mid)",
            marginBottom: 8,
          }}
          className="skeleton"
        />
      ))}
      <style>{`.skeleton{animation:pulse 1.5s ease-in-out infinite} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
