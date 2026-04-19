"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  BookMarked,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Flag,
} from "lucide-react";

const CATEGORY_CONFIG = {
  quiet_hours: { label: "Quiet Hours", color: "#a78bfa" },
  cleanliness: { label: "Cleanliness", color: "#4ade80" },
  guests: { label: "Guests", color: "#38bdf8" },
  payments: { label: "Payments", color: "#fbbf24" },
  kitchen: { label: "Kitchen", color: "#fb923c" },
  common_areas: { label: "Common Areas", color: "#f472b6" },
  security: { label: "Security", color: "#f87171" },
  other: { label: "Other", color: "var(--muted)" },
};

const ALERT_STATUS = {
  open: { label: "Open", color: "#f87171" },
  acknowledged: { label: "Acknowledged", color: "#fbbf24" },
  resolved: { label: "Resolved", color: "#4ade80" },
  dismissed: { label: "Dismissed", color: "var(--muted)" },
};

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

function RuleCard({ rule, isManager, onDelete, onReport }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_CONFIG[rule.category] || CATEGORY_CONFIG.other;
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        {/* Rule number */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--bg-surface)",
            border: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.9rem",
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          {rule.ruleNumber}
        </div>
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
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              {rule.title}
            </span>
            <span
              style={{
                fontSize: "0.67rem",
                fontWeight: 600,
                padding: "1px 8px",
                borderRadius: 50,
                color: cat.color,
                background: `${cat.color}15`,
                border: `1px solid ${cat.color}30`,
              }}
            >
              {cat.label}
            </span>
          </div>
          {rule.description && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--muted)",
                lineHeight: 1.55,
              }}
            >
              {rule.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onReport(rule)}
            title="Report violation"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 11px",
              borderRadius: 50,
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.25)",
              color: "#f87171",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Flag size={11} /> Report
          </button>
          {isManager && (
            <button
              onClick={() => onDelete(rule._id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: 4,
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RulesPage() {
  const { houseId } = useParams();
  const [rules, setRules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportDesc, setReportDesc] = useState("");
  const [reporting, setReporting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch(`/api/houses/${houseId}/rules`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setRules(j.data);
          setAlerts(j.alerts || []);
          setIsManager(j.isManager);
        }
      })
      .finally(() => setLoading(false));
  }, [houseId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Rule title required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      setRules((p) => [...p, json.data]);
      setShowForm(false);
      setForm({ title: "", description: "", category: "other" });
      toast.success("Rule added. Members notified.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(ruleId) {
    if (!confirm("Delete this rule?")) return;
    setRules((p) => p.filter((r) => r._id !== ruleId));
    await fetch(`/api/rules/${ruleId}`, { method: "DELETE" });
    toast.success("Rule deleted.");
  }

  async function handleReport(e) {
    e.preventDefault();
    if (!reportTarget) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/rules/${reportTarget._id}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: reportDesc }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      toast.success("Violation reported. Manager notified.");
      setReportTarget(null);
      setReportDesc("");
    } catch {
      toast.error("Network error.");
    } finally {
      setReporting(false);
    }
  }

  async function resolveAlert(alertId, status) {
    const res = await fetch(
      `/api/rules/${alerts.find((a) => a._id === alertId)?.ruleId?._id}/alerts/${alertId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    const json = await res.json();
    if (json.success) {
      setAlerts((p) => p.filter((a) => a._id !== alertId));
      toast.success(`Alert ${status}.`);
    }
  }

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading rules…
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
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
            <BookMarked size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              House Rules
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {rules.length} rule{rules.length !== 1 ? "s" : ""}
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
            <Plus size={14} /> Add rule
          </button>
        )}
      </div>

      {/* Manager: open alerts */}
      {isManager && alerts.length > 0 && (
        <div
          style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <AlertTriangle size={14} color="#f87171" />
            <span
              style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f87171" }}
            >
              {alerts.length} open violation{alerts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a) => (
              <div
                key={a._id}
                style={{
                  background: "var(--glass-bg)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      marginBottom: 2,
                    }}
                  >
                    Rule #{a.ruleId?.ruleNumber}: {a.ruleId?.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    Reported by {a.reportedBy?.name}
                    {a.description && ` — "${a.description}"`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => resolveAlert(a._id, "resolved")}
                    style={{
                      fontSize: "0.72rem",
                      padding: "4px 10px",
                      borderRadius: 50,
                      background: "rgba(74,222,128,0.1)",
                      border: "1px solid rgba(74,222,128,0.25)",
                      color: "#4ade80",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => resolveAlert(a._id, "dismissed")}
                    style={{
                      fontSize: "0.72rem",
                      padding: "4px 10px",
                      borderRadius: 50,
                      background: "var(--glass-bg-mid)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--muted)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add rule modal */}
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
              maxWidth: 440,
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
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                Add House Rule
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
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div>
                <label style={lS}>Rule *</label>
                <input
                  style={iS}
                  placeholder="e.g. No guests after 11pm"
                  value={form.title}
                  onChange={(e) => setF("title", e.target.value)}
                  maxLength={120}
                />
              </div>
              <div>
                <label style={lS}>Details (optional)</label>
                <textarea
                  style={{
                    ...iS,
                    minHeight: 70,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  placeholder="Explain the rule in more detail"
                  value={form.description}
                  onChange={(e) => setF("description", e.target.value)}
                  maxLength={500}
                />
              </div>
              <div>
                <label style={lS}>Category</label>
                <select
                  style={{ ...iS, cursor: "pointer" }}
                  value={form.category}
                  onChange={(e) => setF("category", e.target.value)}
                >
                  {Object.entries(CATEGORY_CONFIG).map(([v, c]) => (
                    <option key={v} value={v}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
                {submitting ? "Adding…" : "Add rule"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report violation modal */}
      {reportTarget && (
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
              maxWidth: 400,
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
              <h2 style={{ fontSize: "1rem", fontWeight: 800 }}>
                Report Violation
              </h2>
              <button
                onClick={() => {
                  setReportTarget(null);
                  setReportDesc("");
                }}
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
                background: "var(--bg-surface)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  marginBottom: 2,
                }}
              >
                Rule #{reportTarget.ruleNumber}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {reportTarget.title}
              </div>
            </div>
            <form
              onSubmit={handleReport}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div>
                <label style={lS}>What happened? (optional)</label>
                <textarea
                  style={{
                    ...iS,
                    minHeight: 70,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  placeholder="Describe the incident"
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  maxLength={500}
                />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                The manager and all members will be notified.
              </p>
              <button
                type="submit"
                disabled={reporting}
                style={{
                  padding: "10px",
                  borderRadius: 10,
                  background: reporting
                    ? "var(--glass-bg-mid)"
                    : "rgba(248,113,113,0.15)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  color: reporting ? "var(--muted)" : "#f87171",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: reporting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                {reporting && (
                  <Loader2
                    size={13}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {reporting ? "Reporting…" : "Report violation"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <BookMarked size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>
            {isManager
              ? "No rules yet. Add the first one."
              : "No house rules have been set yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rules.map((r) => (
            <RuleCard
              key={r._id}
              rule={r}
              isManager={isManager}
              onDelete={handleDelete}
              onReport={setReportTarget}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}
