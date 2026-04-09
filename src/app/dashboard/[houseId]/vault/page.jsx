"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  X,
  Loader2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

const TYPE_CONFIG = {
  wifi: { label: "WiFi", emoji: "📶", f1: "Network name", f2: "Password" },
  door_code: { label: "Door Code", emoji: "🚪", f1: "Code", f2: "" },
  gate_code: { label: "Gate Code", emoji: "🔑", f1: "Code", f2: "" },
  lease: { label: "Lease", emoji: "📄", f1: "Details", f2: "" },
  contact: { label: "Contact", emoji: "📞", f1: "Phone / Email", f2: "Notes" },
  document: { label: "Document", emoji: "📁", f1: "Details", f2: "Notes" },
  appliance: {
    label: "Appliance",
    emoji: "🔧",
    f1: "Model / Serial",
    f2: "Notes",
  },
  other: { label: "Other", emoji: "📌", f1: "Value", f2: "Notes" },
};

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "#4ade80" : "var(--muted)",
        padding: 4,
        lineHeight: 1,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function SecretField({ value, label }) {
  const [show, setShow] = useState(false);
  if (!value) return null;
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
    >
      <span
        style={{ fontSize: "0.75rem", color: "var(--muted)", flexShrink: 0 }}
      >
        {label}:
      </span>
      <span
        style={{
          fontSize: "0.82rem",
          fontFamily: show ? "inherit" : "monospace",
          color: "var(--text)",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {show ? value : "••••••••"}
      </span>
      <button
        onClick={() => setShow((s) => !s)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted)",
          padding: 2,
          lineHeight: 1,
        }}
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
      <CopyBtn value={value} />
    </div>
  );
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

export default function VaultPage() {
  const { houseId } = useParams();
  const [items, setItems] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    type: "wifi",
    label: "",
    primaryValue: "",
    secondaryValue: "",
    notes: "",
    visibility: "all",
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch(`/api/houses/${houseId}/vault`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setItems(j.data);
          setIsManager(j.isManager);
        }
      })
      .finally(() => setLoading(false));
  }, [houseId]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.label.trim()) {
      setError("Label required");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/vault`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setItems((p) => [json.data, ...p]);
      setShowForm(false);
      setForm({
        type: "wifi",
        label: "",
        primaryValue: "",
        secondaryValue: "",
        notes: "",
        visibility: "all",
      });
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this vault item?")) return;
    await fetch(`/api/vault/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((i) => i._id !== id));
  }

  const grouped = items.reduce((acc, item) => {
    const g = item.type || "other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});
  const tc = TYPE_CONFIG[form.type] || TYPE_CONFIG.other;

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading vault…
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
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            The Vault 🔐
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Household info, encrypted and always accessible.
          </p>
        </div>
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
          <Plus size={14} /> Add item
        </button>
      </div>

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
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                Add to Vault
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
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}
            <form
              onSubmit={handleAdd}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div>
                <label style={lS}>Type</label>
                <select
                  style={{ ...iS, cursor: "pointer" }}
                  value={form.type}
                  onChange={(e) => setF("type", e.target.value)}
                >
                  {Object.entries(TYPE_CONFIG).map(([v, c]) => (
                    <option key={v} value={v}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lS}>Label *</label>
                <input
                  style={iS}
                  placeholder="e.g. Home WiFi"
                  value={form.label}
                  onChange={(e) => setF("label", e.target.value)}
                />
              </div>
              {tc.f1 && (
                <div>
                  <label style={lS}>{tc.f1}</label>
                  <input
                    style={iS}
                    placeholder={tc.f1}
                    value={form.primaryValue}
                    onChange={(e) => setF("primaryValue", e.target.value)}
                  />
                </div>
              )}
              {tc.f2 && (
                <div>
                  <label style={lS}>{tc.f2}</label>
                  <input
                    style={iS}
                    placeholder={tc.f2}
                    value={form.secondaryValue}
                    onChange={(e) => setF("secondaryValue", e.target.value)}
                  />
                </div>
              )}
              <div>
                <label style={lS}>Notes</label>
                <input
                  style={iS}
                  placeholder="Optional"
                  value={form.notes}
                  onChange={(e) => setF("notes", e.target.value)}
                />
              </div>
              {isManager && (
                <div>
                  <label style={lS}>Visibility</label>
                  <select
                    style={{ ...iS, cursor: "pointer" }}
                    value={form.visibility}
                    onChange={(e) => setF("visibility", e.target.value)}
                  >
                    <option value="all">All members</option>
                    <option value="manager_only">Manager only</option>
                  </select>
                </div>
              )}
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
                {submitting ? "Saving…" : "Save to Vault"}
              </button>
            </form>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <Lock size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>Your vault is empty. Start with your WiFi password.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(grouped).map(([type, typeItems]) => {
            const tc2 = TYPE_CONFIG[type] || TYPE_CONFIG.other;
            return (
              <div key={type}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  {tc2.emoji} {tc2.label}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {typeItems.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 12,
                        padding: "13px 16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              marginBottom: 2,
                            }}
                          >
                            <span
                              style={{ fontWeight: 700, fontSize: "0.9rem" }}
                            >
                              {item.label}
                            </span>
                            {item.visibility === "manager_only" && (
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  color: "var(--accent)",
                                  background: "var(--accent-dim)",
                                  border: "1px solid var(--accent-border)",
                                  padding: "1px 7px",
                                  borderRadius: 50,
                                  fontWeight: 600,
                                }}
                              >
                                Manager only
                              </span>
                            )}
                          </div>
                          {item.primaryValue && (
                            <SecretField
                              value={item.primaryValue}
                              label={tc2.f1 || "Value"}
                            />
                          )}
                          {item.secondaryValue && (
                            <SecretField
                              value={item.secondaryValue}
                              label={tc2.f2 || "Secondary"}
                            />
                          )}
                          {item.notes && !item.secondaryValue && (
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--muted)",
                                marginTop: 4,
                              }}
                            >
                              {item.notes}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(item._id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--muted)",
                            padding: 4,
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}
