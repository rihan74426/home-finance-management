"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { HOUSE_TYPE } from "@/lib/constants";

const HOUSE_TYPES = [
  { value: HOUSE_TYPE.FLAT, label: "Flat / Apartment", emoji: "🏢" },
  { value: HOUSE_TYPE.VILLA, label: "Villa", emoji: "🏡" },
  { value: HOUSE_TYPE.FAMILY, label: "Family Home", emoji: "🏠" },
  { value: HOUSE_TYPE.CO_LIVING, label: "Co-Living", emoji: "🏘️" },
  { value: HOUSE_TYPE.DORMITORY, label: "Dormitory", emoji: "🏫" },
  { value: HOUSE_TYPE.OTHER, label: "Other", emoji: "🏗️" },
];

const CURRENCIES = [
  { value: "BDT", label: "BDT — Bangladeshi Taka" },
  { value: "PKR", label: "PKR — Pakistani Rupee" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "EUR", label: "EUR — Euro" },
];

const inputStyle = {
  width: "100%",
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const labelStyle = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function CreateHousePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: HOUSE_TYPE.FLAT,
    currency: "BDT",
    rentDueDay: 1,
    address: { line1: "", city: "", country: "" },
    rules: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setAddress(field, value) {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("House name is required.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      // Redirect to the new house dashboard
      router.push(`/dashboard/${json.data.house._id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Back link */}
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--muted)",
          fontSize: "0.825rem",
          textDecoration: "none",
          marginBottom: 28,
        }}
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          Create your house
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Set up your household. You'll be the manager.
        </p>
      </div>

      {/* Error */}
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

      <form onSubmit={handleSubmit}>
        {/* House name */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>House name *</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Bashundhara Block C, Flat 4B"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={100}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--accent-border)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
          />
        </div>

        {/* House type */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Type</label>
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
                onClick={() => set("type", value)}
                style={{
                  padding: "10px 8px",
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
                  fontSize: "0.78rem",
                  fontWeight: form.type === value ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency + rent due day */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={labelStyle}>Currency</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              {CURRENCIES.map(({ value, label }) => (
                <option
                  key={value}
                  value={value}
                  style={{ background: "var(--bg-mid)" }}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Rent due day</label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={28}
              value={form.rentDueDay}
              onChange={(e) => set("rentDueDay", Number(e.target.value))}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--accent-border)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--glass-border)")
              }
            />
          </div>
        </div>

        {/* Address (optional) */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Address (optional)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Street address"
              value={form.address.line1}
              onChange={(e) => setAddress("line1", e.target.value)}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--accent-border)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--glass-border)")
              }
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <input
                style={inputStyle}
                type="text"
                placeholder="City"
                value={form.address.city}
                onChange={(e) => setAddress("city", e.target.value)}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--accent-border)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--glass-border)")
                }
              />
              <input
                style={inputStyle}
                type="text"
                placeholder="Country"
                value={form.address.country}
                onChange={(e) => setAddress("country", e.target.value)}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--accent-border)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--glass-border)")
                }
              />
            </div>
          </div>
        </div>

        {/* House rules */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>House rules (optional)</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: 90,
              resize: "vertical",
              fontFamily: "inherit",
            }}
            placeholder="e.g. No guests after 11pm. Kitchen clean by midnight."
            value={form.rules}
            onChange={(e) => set("rules", e.target.value)}
            maxLength={2000}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--accent-border)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            background: submitting ? "var(--glass-bg-mid)" : "var(--accent)",
            color: submitting ? "var(--muted)" : "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.15s ease",
            boxShadow: submitting ? "none" : "0 8px 24px rgba(232,98,26,0.25)",
          }}
        >
          {submitting && (
            <Loader2
              size={16}
              style={{ animation: "spin 1s linear infinite" }}
            />
          )}
          {submitting ? "Creating…" : "Create house →"}
        </button>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #0e1520; color: #f0ede8; }
      `}</style>
    </div>
  );
}
