"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  Plus,
  X,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Wifi,
  Lock,
  FileText,
  Phone,
  Package,
  Trash2,
  Globe,
} from "lucide-react";
import { VAULT_TYPE, VAULT_VISIBILITY } from "@/lib/constants";
import { VaultSkeleton } from "@/components/ui/Skeleton";

const TYPE_CONFIG = {
  wifi: {
    label: "WiFi",
    icon: Wifi,
    color: "#38bdf8",
    fields: ["SSID", "Password"],
  },
  door_code: {
    label: "Door Code",
    icon: Lock,
    color: "#fbbf24",
    fields: ["Code"],
  },
  gate_code: {
    label: "Gate Code",
    icon: Lock,
    color: "#fb923c",
    fields: ["Code"],
  },
  lease: {
    label: "Lease",
    icon: FileText,
    color: "#a78bfa",
    fields: ["File / Notes"],
  },
  contact: {
    label: "Contact",
    icon: Phone,
    color: "#4ade80",
    fields: ["Phone/Email", "Notes"],
  },
  document: {
    label: "Document",
    icon: FileText,
    color: "#94a3b8",
    fields: ["Value", "Notes"],
  },
  appliance: {
    label: "Appliance",
    icon: Package,
    color: "#f472b6",
    fields: ["Model/Serial", "Notes"],
  },
  other: {
    label: "Other",
    icon: Globe,
    color: "var(--muted)",
    fields: ["Value", "Notes"],
  },
};

const TYPE_ORDER = [
  "wifi",
  "door_code",
  "gate_code",
  "contact",
  "lease",
  "document",
  "appliance",
  "other",
];

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

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "var(--teal)" : "var(--muted)",
        padding: 3,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function VaultCard({ item, isManager, onDelete }) {
  const [revealed, setRevealed] = useState(false);
  const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
  const Icon = tc.icon;
  const isManagerOnly = item.visibility === VAULT_VISIBILITY.MANAGER_ONLY;

  const fields = [
    item.primaryValue && { label: tc.fields[0], value: item.primaryValue },
    item.secondaryValue && {
      label: tc.fields[1] || "Secondary",
      value: item.secondaryValue,
    },
    item.notes && { label: "Notes", value: item.notes },
  ].filter(Boolean);

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 13,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "13px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            flexShrink: 0,
            background: `${tc.color}18`,
            border: `1px solid ${tc.color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color={tc.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              {item.label}
            </span>
            {isManagerOnly && (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  padding: "1px 7px",
                  borderRadius: 50,
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                Manager only
              </span>
            )}
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}
          >
            {tc.label}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {fields.length > 0 && (
            <button
              onClick={() => setRevealed((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: 4,
              }}
            >
              {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
          {(isManager || item.canDelete) && (
            <button
              onClick={() => onDelete(item._id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: 4,
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {revealed && fields.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--glass-border)",
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "var(--bg-surface)",
          }}
        >
          {fields.map((f) => (
            <div key={f.label}>
              <div
                style={{
                  fontSize: "0.67rem",
                  color: "var(--muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 3,
                }}
              >
                {f.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code
                  style={{
                    flex: 1,
                    fontSize: "0.85rem",
                    background: "var(--glass-bg)",
                    padding: "6px 10px",
                    borderRadius: 7,
                    border: "1px solid var(--glass-border)",
                    wordBreak: "break-all",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                >
                  {f.value}
                </code>
                <CopyBtn value={f.value} />
              </div>
            </div>
          ))}
          {item.fileUrl && (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.78rem",
                color: "var(--teal)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <FileText size={12} /> {item.fileName || "View file"}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function VaultPage() {
  const { houseId } = useParams();
  const [items, setItems] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "wifi",
    label: "",
    primaryValue: "",
    secondaryValue: "",
    notes: "",
    visibility: "all",
    fileUrl: "",
    fileName: "",
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

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error("Label is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/vault`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
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
        fileUrl: "",
        fileName: "",
      });
      toast.success("Vault item added.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this vault item?")) return;
    setItems((p) => p.filter((i) => i._id !== id));
    const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
    } else toast.success("Item deleted.");
  }

  // Group by type
  const grouped = TYPE_ORDER.reduce((acc, type) => {
    const group = items.filter((i) => i.type === type);
    if (group.length > 0) acc[type] = group;
    return acc;
  }, {});

  const tc_form = TYPE_CONFIG[form.type] || TYPE_CONFIG.other;

  if (loading) return <VaultSkeleton />;

  return (
    <div>
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
            <ShieldCheck size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              The Vault
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {items.length} item{items.length !== 1 ? "s" : ""} · AES-256
            encrypted
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

      {/* Add item modal */}
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
                Add Vault Item
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
              {/* Type selector */}
              <div>
                <label style={lS}>Type</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 5,
                  }}
                >
                  {TYPE_ORDER.map((t) => {
                    const c = TYPE_CONFIG[t];
                    const TIcon = c.icon;
                    const on = form.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setF("type", t)}
                        style={{
                          padding: "8px 4px",
                          borderRadius: 8,
                          flexDirection: "column",
                          border: on
                            ? "1.5px solid var(--accent)"
                            : "1px solid var(--glass-border)",
                          background: on
                            ? "var(--accent-dim)"
                            : "var(--glass-bg)",
                          color: on ? "var(--text)" : "var(--muted)",
                          fontSize: "0.65rem",
                          fontWeight: on ? 600 : 400,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <TIcon
                          size={13}
                          color={on ? c.color : "var(--muted)"}
                        />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={lS}>Label *</label>
                <input
                  style={iS}
                  placeholder={`e.g. Home ${tc_form.label}`}
                  value={form.label}
                  onChange={(e) => setF("label", e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <label style={lS}>{tc_form.fields[0]}</label>
                <input
                  style={iS}
                  placeholder={tc_form.fields[0]}
                  value={form.primaryValue}
                  onChange={(e) => setF("primaryValue", e.target.value)}
                />
              </div>
              {tc_form.fields[1] && (
                <div>
                  <label style={lS}>{tc_form.fields[1]}</label>
                  <input
                    style={iS}
                    placeholder={tc_form.fields[1]}
                    value={form.secondaryValue}
                    onChange={(e) => setF("secondaryValue", e.target.value)}
                  />
                </div>
              )}
              <div>
                <label style={lS}>Notes</label>
                <input
                  style={iS}
                  placeholder="Optional notes"
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
                  marginTop: 4,
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
                }}
              >
                {submitting && (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {submitting ? "Saving…" : "Save to vault"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grouped vault items */}
      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <ShieldCheck size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>Nothing in the vault yet.</p>
          <p style={{ fontSize: "0.82rem", marginTop: 4 }}>
            Add WiFi passwords, door codes, and important documents.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, group]) => {
          const tc = TYPE_CONFIG[type] || TYPE_CONFIG.other;
          const Icon = tc.icon;
          return (
            <div key={type} style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 10,
                }}
              >
                <Icon size={13} color={tc.color} />
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {tc.label}
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--faint)" }}>
                  ({group.length})
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {group.map((item) => (
                  <VaultCard
                    key={item._id}
                    item={item}
                    isManager={isManager}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}
