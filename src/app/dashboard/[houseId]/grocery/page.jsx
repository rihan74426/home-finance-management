"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  X,
  Check,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "dairy", label: "Dairy" },
  { value: "meat", label: "Meat" },
  { value: "grains", label: "Grains" },
  { value: "beverages", label: "Beverages" },
  { value: "snacks", label: "Snacks" },
  { value: "cleaning", label: "Cleaning" },
  { value: "toiletries", label: "Toiletries" },
  { value: "other", label: "Other" },
];

const CAT_COLORS = {
  vegetables: {
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.22)",
    text: "#4ade80",
  },
  fruits: {
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.22)",
    text: "#fb923c",
  },
  dairy: {
    bg: "rgba(147,197,253,0.08)",
    border: "rgba(147,197,253,0.22)",
    text: "#93c5fd",
  },
  meat: {
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.22)",
    text: "#f87171",
  },
  grains: {
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.22)",
    text: "#fbbf24",
  },
  beverages: {
    bg: "rgba(45,212,191,0.08)",
    border: "rgba(45,212,191,0.22)",
    text: "#2dd4bf",
  },
  snacks: {
    bg: "rgba(192,132,252,0.08)",
    border: "rgba(192,132,252,0.22)",
    text: "#c084fc",
  },
  cleaning: {
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.22)",
    text: "#38bdf8",
  },
  toiletries: {
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.22)",
    text: "#f472b6",
  },
  other: {
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.22)",
    text: "#94a3b8",
  },
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

export default function GroceryPage() {
  const { houseId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBought, setShowBought] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState({});
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    category: "other",
    note: "",
  });
  const [error, setError] = useState(null);
  const nameRef = useRef(null);
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function load(bought = showBought) {
    try {
      const res = await fetch(
        `/api/houses/${houseId}/grocery?showBought=${bought}`
      );
      const json = await res.json();
      if (json.success) setItems(json.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [houseId]);
  useEffect(() => {
    if (showForm) setTimeout(() => nameRef.current?.focus(), 50);
  }, [showForm]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Item name required");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/grocery`, {
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
      setForm({ name: "", quantity: "", category: "other", note: "" });
      nameRef.current?.focus();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleBought(item) {
    const next = !item.isBought;
    setToggling((p) => ({ ...p, [item._id]: true }));
    setItems((p) =>
      p.map((i) => (i._id === item._id ? { ...i, isBought: next } : i))
    );
    try {
      await fetch(`/api/grocery/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBought: next }),
      });
    } catch {
      setItems((p) =>
        p.map((i) =>
          i._id === item._id ? { ...i, isBought: item.isBought } : i
        )
      );
    } finally {
      setToggling((p) => ({ ...p, [item._id]: false }));
    }
  }

  async function handleDelete(id) {
    setItems((p) => p.filter((i) => i._id !== id));
    await fetch(`/api/grocery/${id}`, { method: "DELETE" });
  }

  async function handleToggleShowBought() {
    const next = !showBought;
    setShowBought(next);
    if (next) {
      setLoading(true);
      await load(true);
    }
  }

  const active = items.filter((i) => !i.isBought);
  const bought = items.filter((i) => i.isBought);
  const applyFilter = (list) =>
    catFilter === "all" ? list : list.filter((i) => i.category === catFilter);

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading grocery list…
      </div>
    );

  return (
    <div style={{ maxWidth: 640 }}>
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
            <ShoppingCart size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Grocery List
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {active.length} item{active.length !== 1 ? "s" : ""} to get
            {bought.length > 0 ? ` · ${bought.length} bought` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 50,
            background: showForm ? "var(--glass-bg-mid)" : "var(--accent)",
            color: showForm ? "var(--muted)" : "#fff",
            fontWeight: 600,
            fontSize: "0.825rem",
            border: showForm ? "1px solid var(--glass-border)" : "none",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {showForm ? (
            <>
              <X size={14} /> Cancel
            </>
          ) : (
            <>
              <Plus size={14} /> Add item
            </>
          )}
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: 14,
            padding: 18,
            marginBottom: 20,
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#f87171",
                fontSize: "0.8rem",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleAdd}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                ref={nameRef}
                style={iS}
                placeholder="Item name"
                value={form.name}
                onChange={(e) => setF("name", e.target.value)}
                maxLength={100}
              />
              <input
                style={iS}
                placeholder="Qty"
                value={form.quantity}
                onChange={(e) => setF("quantity", e.target.value)}
                maxLength={50}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <select
                style={{ ...iS, cursor: "pointer" }}
                value={form.category}
                onChange={(e) => setF("category", e.target.value)}
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                style={iS}
                placeholder="Note (optional)"
                value={form.note}
                onChange={(e) => setF("note", e.target.value)}
                maxLength={200}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px",
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
                gap: 7,
              }}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Adding…
                </>
              ) : (
                "Add to list"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Category filter pills */}
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}
      >
        {CATEGORIES.map((c) => {
          const on = catFilter === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setCatFilter(c.value)}
              style={{
                padding: "4px 13px",
                borderRadius: 50,
                fontSize: "0.76rem",
                fontWeight: 600,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.12s",
                borderColor: on ? "var(--accent)" : "var(--glass-border)",
                background: on ? "var(--accent-dim)" : "transparent",
                color: on ? "var(--accent)" : "var(--muted)",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {active.length === 0 && bought.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <ShoppingCart size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ marginBottom: 6 }}>Your list is empty.</p>
          <p style={{ fontSize: "0.82rem" }}>Add something to get started.</p>
        </div>
      ) : (
        <>
          {/* Active items */}
          {applyFilter(active).length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                marginBottom: 16,
              }}
            >
              {applyFilter(active).map((item) => (
                <GroceryRow
                  key={item._id}
                  item={item}
                  toggling={toggling[item._id]}
                  onToggle={() => toggleBought(item)}
                  onDelete={() => handleDelete(item._id)}
                />
              ))}
            </div>
          )}

          {/* Bought section toggle */}
          {bought.length > 0 && (
            <div>
              <button
                onClick={handleToggleShowBought}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "6px 0",
                  marginBottom: showBought ? 10 : 0,
                }}
              >
                {showBought ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {bought.length} bought
              </button>
              {showBought && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    opacity: 0.6,
                  }}
                >
                  {applyFilter(bought).map((item) => (
                    <GroceryRow
                      key={item._id}
                      item={item}
                      toggling={toggling[item._id]}
                      onToggle={() => toggleBought(item)}
                      onDelete={() => handleDelete(item._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #0e1520; color: #f0ede8; }
      `}</style>
    </div>
  );
}

function GroceryRow({ item, toggling, onToggle, onDelete }) {
  const cat = CAT_COLORS[item.category] || CAT_COLORS.other;
  const done = item.isBought;
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 11,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 11,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={toggling}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${done ? "#4ade80" : "var(--glass-border-hover)"}`,
          background: done ? "rgba(74,222,128,0.15)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {toggling ? (
          <Loader2
            size={11}
            style={{
              animation: "spin 0.7s linear infinite",
              color: "var(--muted)",
            }}
          />
        ) : done ? (
          <Check size={12} color="#4ade80" strokeWidth={3} />
        ) : null}
      </button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.88rem",
              textDecoration: done ? "line-through" : "none",
              color: done ? "var(--muted)" : "var(--text)",
            }}
          >
            {item.name}
          </span>
          {item.quantity && (
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--muted)",
                background: "var(--glass-bg-mid)",
                padding: "1px 7px",
                borderRadius: 50,
                border: "1px solid var(--glass-border)",
              }}
            >
              {item.quantity}
            </span>
          )}
          <span
            style={{
              fontSize: "0.67rem",
              fontWeight: 600,
              padding: "1px 7px",
              borderRadius: 50,
              background: cat.bg,
              border: `1px solid ${cat.border}`,
              color: cat.text,
            }}
          >
            {item.category}
          </span>
        </div>
        {item.note && (
          <div
            style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}
          >
            {item.note}
          </div>
        )}
        {done && item.boughtBy?.name && (
          <div
            style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}
          >
            Bought by {item.boughtBy.name}
          </div>
        )}
      </div>

      {/* Added-by initial */}
      {!done && item.addedBy?.name && (
        <div
          style={{
            width: 20,
            height: 20,
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
          {item.addedBy.name[0].toUpperCase()}
        </div>
      )}

      <button
        onClick={onDelete}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted)",
          padding: 3,
          flexShrink: 0,
          opacity: 0.6,
          lineHeight: 1,
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
