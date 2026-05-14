"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
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
import { usePageActions } from "@/hooks/usePageActions";
import { GrocerySkeleton } from "@/components/ui/Skeleton";

const POLL_INTERVAL = 5000;

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
const lS = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

// ── Single grocery row ────────────────────────────────────────────────────────
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

      {/* Added-by avatar */}
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

      {/* Delete — undo enabled */}
      <button
        onClick={onDelete}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted)",
          padding: 3,
          flexShrink: 0,
          borderRadius: 6,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GroceryPage() {
  const { houseId } = useParams();
  const { deleteGroceryItem, toggleGroceryBought } = usePageActions({
    houseId,
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBought, setShowBought] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState({});
  const [liveIndicator, setLiveIndicator] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    category: "other",
    note: "",
  });

  const nameRef = useRef(null);
  const pollRef = useRef(null);
  // Track item IDs with pending optimistic ops so polling doesn't overwrite them
  const pendingOps = useRef(new Set());

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(
    async (showBoughtFlag, silent = false) => {
      try {
        const res = await fetch(
          `/api/houses/${houseId}/grocery?showBought=${showBoughtFlag}`
        );
        const json = await res.json();
        if (!json.success) return;

        setItems((prev) => {
          if (pendingOps.current.size === 0) {
            if (silent && json.data.length > prev.length) {
              setLiveIndicator(true);
              setTimeout(() => setLiveIndicator(false), 1200);
            }
            return json.data;
          }
          // Merge: keep optimistic state for pending items
          const serverMap = Object.fromEntries(
            json.data.map((i) => [String(i._id), i])
          );
          const merged = prev.map((item) =>
            pendingOps.current.has(String(item._id))
              ? item
              : serverMap[String(item._id)] || item
          );
          const prevIds = new Set(prev.map((i) => String(i._id)));
          const newItems = json.data.filter((i) => !prevIds.has(String(i._id)));
          if (newItems.length > 0 && silent) {
            setLiveIndicator(true);
            setTimeout(() => setLiveIndicator(false), 1200);
          }
          return [...merged, ...newItems];
        });
      } catch {
        /* silent */
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [houseId]
  );

  useEffect(() => {
    fetchItems(false, false);
  }, [fetchItems]);

  useEffect(() => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(
      () => fetchItems(showBought, true),
      POLL_INTERVAL
    );
    return () => clearInterval(pollRef.current);
  }, [fetchItems, showBought]);

  useEffect(() => {
    if (showForm) setTimeout(() => nameRef.current?.focus(), 50);
  }, [showForm]);

  // ── Add item ──────────────────────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Item name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/grocery`, {
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
      setForm({ name: "", quantity: "", category: "other", note: "" });
      nameRef.current?.focus();
      toast.success("Item added.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Toggle bought — undo enabled ──────────────────────────────────────────
  function handleToggle(item) {
    const id = String(item._id);
    pendingOps.current.add(id);
    toggleGroceryBought({
      item,
      items,
      setItems,
      setToggling,
      // Clean up pending flag after API resolves
      onSuccess: () => pendingOps.current.delete(id),
      onError: () => pendingOps.current.delete(id),
    });
  }

  // ── Delete — undo enabled ─────────────────────────────────────────────────
  function handleDelete(item) {
    deleteGroceryItem({
      itemId: item._id,
      itemName: item.name,
      items,
      setItems,
    });
  }

  async function toggleShowBought() {
    const next = !showBought;
    setShowBought(next);
    await fetchItems(next, false);
  }

  // ── Derived lists ─────────────────────────────────────────────────────────
  const active = items.filter((i) => !i.isBought);
  const bought = items.filter((i) => i.isBought);
  const applyFilter = (list) =>
    catFilter === "all" ? list : list.filter((i) => i.category === catFilter);
  const visibleActive = applyFilter(active);
  const visibleBought = applyFilter(bought);

  if (loading) return <GrocerySkeleton />;

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
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: liveIndicator ? "#4ade80" : "var(--faint)",
                  transition: "background 0.3s",
                }}
              />
              <span style={{ fontSize: "0.68rem", color: "var(--faint)" }}>
                Live
              </span>
            </div>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {active.length} item{active.length !== 1 ? "s" : ""} to get
            {bought.length > 0 && ` · ${bought.length} bought`}
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

      {/* Add form */}
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
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "nowrap",
          overflowX: "auto",
          marginBottom: 18,
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}
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
                whiteSpace: "nowrap",
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
      {active.length === 0 && bought.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <ShoppingCart
            size={40}
            style={{
              marginBottom: 12,
              opacity: 0.3,
              display: "block",
              margin: "0 auto 12px",
            }}
          />
          <p>Your list is empty.</p>
          <p style={{ fontSize: "0.82rem", marginTop: 4 }}>
            Add something to get started.
          </p>
        </div>
      )}

      {/* Active items */}
      {visibleActive.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            marginBottom: 16,
          }}
        >
          {visibleActive.map((item) => (
            <GroceryRow
              key={item._id}
              item={item}
              toggling={toggling[String(item._id)]}
              onToggle={() => handleToggle(item)}
              onDelete={() => handleDelete(item)}
            />
          ))}
        </div>
      )}

      {/* Bought section */}
      {bought.length > 0 && (
        <div>
          <button
            onClick={toggleShowBought}
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
            {showBought ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {bought.length} bought item{bought.length !== 1 ? "s" : ""}
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
              {visibleBought.map((item) => (
                <GroceryRow
                  key={item._id}
                  item={item}
                  toggling={toggling[String(item._id)]}
                  onToggle={() => handleToggle(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8} ::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
