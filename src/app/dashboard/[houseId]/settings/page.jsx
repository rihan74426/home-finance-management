"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { HOUSE_TYPE } from "@/lib/constants";

const HOUSE_TYPES = [
  { value: "flat", label: "Flat / Apartment", emoji: "🏢" },
  { value: "villa", label: "Villa", emoji: "🏡" },
  { value: "family", label: "Family Home", emoji: "🏠" },
  { value: "co_living", label: "Co-Living", emoji: "🏘️" },
  { value: "dormitory", label: "Dormitory", emoji: "🏫" },
  { value: "other", label: "Other", emoji: "🏗️" },
];
const CURRENCIES = ["BDT", "PKR", "INR", "USD", "GBP", "AUD", "EUR"];

const iS = {
  width: "100%",
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "10px 14px",
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
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function SettingsPage() {
  const { houseId } = useParams();
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "flat",
    currency: "BDT",
    rentDueDay: 1,
    rules: "",
    address: { line1: "", city: "", country: "" },
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setAddr = (k, v) =>
    setForm((p) => ({ ...p, address: { ...p.address, [k]: v } }));

  useEffect(() => {
    fetch(`/api/houses/${houseId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const h = j.data;
          setIsManager(h.role === "manager");
          setForm({
            name: h.name || "",
            type: h.type || "flat",
            currency: h.currency || "BDT",
            rentDueDay: h.rentDueDay || 1,
            rules: h.rules || "",
            address: {
              line1: h.address?.line1 || "",
              city: h.address?.city || "",
              country: h.address?.country || "",
            },
          });
        }
        setLoading(false);
      });
  }, [houseId]);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("House name required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/houses/${houseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading settings…
      </div>
    );

  if (!isManager)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 0",
          color: "var(--muted)",
        }}
      >
        <p>Only the house manager can change settings.</p>
      </div>
    );

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          House Settings ⚙️
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          Manage your house details and preferences.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#f87171",
            fontSize: "0.825rem",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}
      {saved && (
        <div
          style={{
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#4ade80",
            fontSize: "0.825rem",
            marginBottom: 20,
          }}
        >
          ✓ Settings saved.
        </div>
      )}

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Name */}
        <div>
          <label style={lS}>House name *</label>
          <input
            style={iS}
            value={form.name}
            onChange={(e) => setF("name", e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Type */}
        <div>
          <label style={lS}>Type</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {HOUSE_TYPES.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setF("type", value)}
                style={{
                  padding: "9px 6px",
                  borderRadius: 10,
                  border:
                    form.type === value
                      ? "1.5px solid var(--accent)"
                      : "1px solid var(--glass-border)",
                  background:
                    form.type === value
                      ? "var(--accent-dim)"
                      : "var(--glass-bg)",
                  color: form.type === value ? "var(--text)" : "var(--muted)",
                  fontSize: "0.75rem",
                  fontWeight: form.type === value ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency + Rent due day */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={lS}>Currency</label>
            <select
              style={{ ...iS, cursor: "pointer" }}
              value={form.currency}
              onChange={(e) => setF("currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={lS}>Rent due day (1–28)</label>
            <input
              style={iS}
              type="number"
              min={1}
              max={28}
              value={form.rentDueDay}
              onChange={(e) => setF("rentDueDay", Number(e.target.value))}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label style={lS}>Address</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              style={iS}
              placeholder="Street address"
              value={form.address.line1}
              onChange={(e) => setAddr("line1", e.target.value)}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <input
                style={iS}
                placeholder="City"
                value={form.address.city}
                onChange={(e) => setAddr("city", e.target.value)}
              />
              <input
                style={iS}
                placeholder="Country"
                value={form.address.country}
                onChange={(e) => setAddr("country", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* House rules */}
        <div>
          <label style={lS}>House rules</label>
          <textarea
            style={{
              ...iS,
              minHeight: 100,
              resize: "vertical",
              fontFamily: "inherit",
            }}
            placeholder="e.g. No guests after 11pm. Kitchen clean by midnight."
            value={form.rules}
            onChange={(e) => setF("rules", e.target.value)}
            maxLength={2000}
          />
          <div
            style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}
          >
            {form.rules.length}/2000
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px",
            borderRadius: 12,
            background: saving ? "var(--glass-bg-mid)" : "var(--accent)",
            color: saving ? "var(--muted)" : "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: saving ? "none" : "0 8px 24px rgba(232,98,26,0.2)",
          }}
        >
          {saving ? (
            <Loader2
              size={15}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Save size={15} />
          )}
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}
